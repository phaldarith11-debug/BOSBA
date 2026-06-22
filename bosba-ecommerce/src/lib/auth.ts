import { NextAuthOptions } from "next-auth";
import type { Adapter } from "next-auth/adapters";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import AppleProvider from "next-auth/providers/apple";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

const oauthProviders = [];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  oauthProviders.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          role: "CUSTOMER",
        };
      },
    })
  );
}

if (process.env.FACEBOOK_CLIENT_ID && process.env.FACEBOOK_CLIENT_SECRET) {
  oauthProviders.push(
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
      profile(profile) {
        return {
          id: profile.id,
          name: profile.name,
          email: profile.email,
          image: profile.picture?.data?.url,
          role: "CUSTOMER",
        };
      },
    })
  );
}

if (process.env.APPLE_ID && process.env.APPLE_SECRET) {
  oauthProviders.push(
    AppleProvider({
      clientId: process.env.APPLE_ID,
      clientSecret: process.env.APPLE_SECRET,
      allowDangerousEmailAccountLinking: true,
    })
  );
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await prisma.user.findUnique({ where: { email: credentials.email } });
        if (!user || !user.password) return null;
        const valid = await bcrypt.compare(credentials.password, user.password);
        if (!valid) return null;
        // Block sign-in until email is verified
        if (!user.emailVerified) return null;
        // Block deactivated accounts (admin can flip `active` off)
        if (!user.active) throw new Error("ACCOUNT_DEACTIVATED");
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          active: user.active,
          emailVerified: user.emailVerified,
        } as never;
      },
    }),
    ...oauthProviders,
  ],
  callbacks: {
    async signIn({ account, user, profile }) {
      // Auto-verify email for all trusted OAuth providers
      const trustedProviders = ["google", "facebook", "apple"];
      if (account?.provider && trustedProviders.includes(account.provider) && user.email) {
        await prisma.user.updateMany({
          where: { email: user.email, emailVerified: null },
          data: { emailVerified: new Date() },
        });
        // Save avatar from OAuth if user has no image
        const pic = (profile as { picture?: string; photos?: { value: string }[] })?.picture
          ?? user.image;
        if (pic) {
          await prisma.user.updateMany({
            where: { email: user.email, image: null },
            data: { image: typeof pic === "string" ? pic : null },
          });
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        const u = user as { id: string; role?: string; active?: boolean; emailVerified?: Date | null };
        token.id = u.id;
        token.role = u.role;
        token.active = u.active ?? true;
        token.emailVerified = u.emailVerified ?? null;
      }
      if (account) {
        token.provider = account.provider;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (session.user as any).active = token.active ?? true;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (session.user as any).emailVerified = token.emailVerified ?? null;
      }
      return session;
    },
  },
};
