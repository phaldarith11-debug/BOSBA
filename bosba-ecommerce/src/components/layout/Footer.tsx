import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Phone, Mail, MapPin } from "lucide-react";

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}

function TelegramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  );
}

export type FooterQuickLink = { label: string; href: string };

export function Footer({ quickLinks }: { quickLinks?: FooterQuickLink[] }) {
  const t = useTranslations("footer");

  const socialLinks = [
    { icon: FacebookIcon, href: "#", label: "Facebook" },
    { icon: InstagramIcon, href: "#", label: "Instagram" },
    { icon: TelegramIcon, href: "#", label: "Telegram" },
  ];

  const defaultShopLinks = [
    { label: t("allProducts"), href: "/products" },
    { label: "Electronics",   href: "/products?category=electronics" },
    { label: "Fashion",       href: "/products?category=fashion" },
    { label: t("featured"),   href: "/products?featured=true" },
  ];
  // CMS-managed "footer" menu when published; otherwise the built-in shop links.
  const shopLinks: FooterQuickLink[] =
    quickLinks && quickLinks.length > 0 ? quickLinks : defaultShopLinks;

  const accountLinks = [
    { label: "Login",        href: "/login" },
    { label: "Register",     href: "/register" },
    { label: t("myOrders"),  href: "/orders" },
    { label: "Wishlist",     href: "/wishlist" },
  ];

  return (
    <footer className="bg-gray-950 text-gray-400 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand column */}
          <div>
            <span className="text-2xl font-black text-white tracking-tight">BOSBA</span>
            <p className="text-sm leading-relaxed mt-3 mb-5 max-w-xs">{t("description")}</p>
            <div className="flex gap-2">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 hover:bg-red-600 hover:text-white transition-all duration-200"
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
              {t("shop")}
            </h4>
            <ul className="space-y-2.5 text-sm">
              {shopLinks.map(({ label, href }) => {
                const cls =
                  "inline-block hover:text-white hover:translate-x-1 transition-all duration-150";
                return (
                  <li key={href}>
                    {href.startsWith("/") ? (
                      <Link href={href} className={cls}>
                        {label}
                      </Link>
                    ) : (
                      <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
                        {label}
                      </a>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
              {t("account")}
            </h4>
            <ul className="space-y-2.5 text-sm">
              {accountLinks.map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="inline-block hover:text-white hover:translate-x-1 transition-all duration-150"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
              {t("contact")}
            </h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-red-500 flex-shrink-0" />
                <span>+855 12 345 678</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-red-500 flex-shrink-0" />
                <span>hello@bosba.com</span>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                <span>Phnom Penh, Cambodia</span>
              </li>
            </ul>

            {/* Payment badges */}
            <div className="mt-5">
              <p className="text-xs text-gray-600 mb-2">{t("accepts")}</p>
              <div className="flex gap-1.5 flex-wrap">
                {["ABA", "ACLEDA", "Wing", "COD"].map((p) => (
                  <span
                    key={p}
                    className="bg-gray-800 text-gray-300 text-xs font-medium px-2.5 py-1 rounded-lg"
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-600">
          <p>{t("rights", { year: new Date().getFullYear() })}</p>
          <div className="flex gap-5">
            <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="#" className="hover:text-white transition-colors">Help Center</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
