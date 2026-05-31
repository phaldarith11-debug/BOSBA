const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM = process.env.EMAIL_FROM ?? "BOSBA <noreply@bosba.com>";
const APP_URL = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

async function send(payload: EmailPayload) {
  if (RESEND_API_KEY) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` },
      body: JSON.stringify({ from: FROM, ...payload }),
    });
    if (!res.ok) console.error("[email] Resend error:", await res.text());
    return res.ok;
  }
  console.log("\n━━━━━━━━━━━━ EMAIL (DEV — no RESEND_API_KEY) ━━━━━━━━━━━━");
  console.log(`To: ${payload.to}\nSubject: ${payload.subject}`);
  console.log(payload.html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim());
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  return true;
}

export function sendVerificationEmail(email: string, otp: string) {
  return send({
    to: email,
    subject: `${otp} — Verify your BOSBA account`,
    html: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#fff;">
      <img src="${APP_URL}/icon.png" alt="BOSBA" style="height:36px;margin-bottom:20px;" />
      <h2 style="color:#e51b1b;font-size:22px;margin:0 0 8px;">Verify your email</h2>
      <p style="color:#475569;margin:0 0 24px;">Enter this 6-digit code to activate your BOSBA account:</p>
      <div style="background:#fef2f2;border:2px solid #fecaca;border-radius:16px;padding:28px;text-align:center;margin-bottom:24px;">
        <span style="font-size:44px;font-weight:900;letter-spacing:14px;color:#e51b1b;">${otp}</span>
      </div>
      <p style="color:#94a3b8;font-size:13px;margin:0 0 24px;">Expires in <strong>15 minutes</strong>. Didn't create an account? You can ignore this email.</p>
      <hr style="border:none;border-top:1px solid #f1f5f9;margin:0 0 16px;" />
      <p style="color:#cbd5e1;font-size:11px;margin:0;">BOSBA · Cambodia's Online Store · <a href="${APP_URL}" style="color:#e51b1b;">${APP_URL}</a></p>
    </div>`,
  });
}

export function sendPasswordResetEmail(email: string, token: string) {
  const url = `${APP_URL}/reset-password?token=${token}`;
  return send({
    to: email,
    subject: "Reset your BOSBA password",
    html: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#fff;">
      <img src="${APP_URL}/icon.png" alt="BOSBA" style="height:36px;margin-bottom:20px;" />
      <h2 style="color:#e51b1b;font-size:22px;margin:0 0 8px;">Reset your password</h2>
      <p style="color:#475569;margin:0 0 24px;">Click the button below to create a new password for your BOSBA account:</p>
      <a href="${url}" style="display:inline-block;background:#e51b1b;color:#fff;font-weight:700;padding:14px 28px;border-radius:12px;text-decoration:none;font-size:15px;margin-bottom:24px;">Reset Password →</a>
      <p style="color:#94a3b8;font-size:13px;margin:0 0 8px;">This link expires in <strong>1 hour</strong>. If you didn't request a reset, ignore this email.</p>
      <p style="color:#94a3b8;font-size:12px;word-break:break-all;">Link: <a href="${url}" style="color:#e51b1b;">${url}</a></p>
      <hr style="border:none;border-top:1px solid #f1f5f9;margin:24px 0 16px;" />
      <p style="color:#cbd5e1;font-size:11px;margin:0;">BOSBA · Cambodia's Online Store</p>
    </div>`,
  });
}
