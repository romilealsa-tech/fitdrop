// Transactional email via Resend (https://resend.com) — plain fetch, no SDK.
// Env vars (in .env.local AND in Vercel):
//   RESEND_API_KEY   — from resend.com → API Keys (keep secret, no NEXT_PUBLIC_)
//   EMAIL_FROM       — optional override. Default sender is drivers@shopfitdrop.com
//                      (domain verified in Resend via GoDaddy DNS).
// If RESEND_API_KEY is missing, emails are skipped (logged) and nothing breaks.

import { SITE_URL } from "./seo"

const FROM = process.env.EMAIL_FROM || "FitDrop <drivers@shopfitdrop.com>"

export async function sendEmail({ to, subject, html, text }: { to: string; subject: string; html: string; text: string }) {
  const key = process.env.RESEND_API_KEY
  if (!key) {
    console.warn(`[email] RESEND_API_KEY not set — skipped "${subject}" to ${to}`)
    return { sent: false, reason: "not_configured" as const }
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: FROM, to: [to], subject, html, text }),
    })
    if (!res.ok) {
      const body = await res.text()
      console.error(`[email] Resend error ${res.status}: ${body}`)
      return { sent: false, reason: "provider_error" as const, detail: body }
    }
    return { sent: true as const }
  } catch (err: any) {
    console.error("[email] send failed:", err?.message)
    return { sent: false, reason: "network_error" as const }
  }
}

const esc = (s: string) => s.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!))

// Dark, simple layout that renders well in Gmail / Apple Mail / Outlook
function layout(title: string, body: string) {
  return `<!doctype html><html><body style="margin:0;background:#0D0D0F;font-family:Helvetica,Arial,sans-serif;color:#E8E8EA">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0D0D0F;padding:32px 16px"><tr><td align="center">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#1C1C1E;border:1px solid #2B2B2E;border-radius:16px;padding:32px">
      <tr><td style="font-size:22px;font-weight:700;letter-spacing:4px;color:#E8E8EA;padding-bottom:24px">FitDrop</td></tr>
      <tr><td style="font-size:20px;font-weight:700;color:#E8E8EA;padding-bottom:12px">${title}</td></tr>
      <tr><td style="font-size:15px;line-height:1.6;color:#b5b5b8">${body}</td></tr>
      <tr><td style="font-size:12px;color:#6b6b6b;padding-top:28px;border-top:1px solid #2B2B2E">FitDrop · Same-day fashion delivery in Manhattan · <a href="${SITE_URL}" style="color:#7EC8B8">shopfitdrop.com</a></td></tr>
    </table>
  </td></tr></table></body></html>`
}

export function driverApprovedEmail(name: string) {
  const first = esc(name.split(" ")[0] || name)
  const link = `${SITE_URL}/driver`
  return {
    subject: "You're approved to drive with FitDrop 🎉",
    html: layout(`Welcome to the fleet, ${first}!`, `
      <p style="margin:0 0 16px">Your application to drive with FitDrop has been <strong style="color:#7EC8B8">approved</strong>. Here's how to start getting deliveries:</p>
      <ol style="margin:0 0 20px;padding-left:20px">
        <li style="margin-bottom:8px">Open the driver app on your phone: <a href="${link}" style="color:#7EC8B8">${link}</a></li>
        <li style="margin-bottom:8px">Sign in with the <strong>same email</strong> you applied with.</li>
        <li style="margin-bottom:8px">Turn on the <strong>Available</strong> switch.</li>
        <li>Allow <strong>notifications</strong> and <strong>location</strong> so you get new orders and customers can follow their delivery.</li>
      </ol>
      <p style="margin:0 0 24px"><a href="${link}" style="display:inline-block;background:#7EC8B8;color:#0D0D0F;text-decoration:none;font-weight:700;padding:12px 24px;border-radius:999px">Open the driver app</a></p>
      <p style="margin:0">Welcome aboard!<br>— The FitDrop team</p>`),
    text: `Hi ${name.split(" ")[0]}, your FitDrop driver application was approved!\n\n1. Open ${link} on your phone\n2. Sign in with the same email you applied with\n3. Turn on "Available"\n4. Allow notifications and location\n\nWelcome aboard! — The FitDrop team`,
  }
}

export function driverRejectedEmail(name: string) {
  const first = esc(name.split(" ")[0] || name)
  return {
    subject: "Update on your FitDrop driver application",
    html: layout(`Thanks for applying, ${first}`, `
      <p style="margin:0 0 16px">Thank you for your interest in driving with FitDrop. After reviewing your application, we're not able to move forward at this time.</p>
      <p style="margin:0 0 16px">This can depend on the areas and schedules we need right now, and it may change as FitDrop grows. You're welcome to apply again in the future.</p>
      <p style="margin:0">— The FitDrop team</p>`),
    text: `Hi ${name.split(" ")[0]}, thank you for applying to drive with FitDrop. After reviewing your application, we're not able to move forward at this time. This may change as FitDrop grows, and you're welcome to apply again in the future. — The FitDrop team`,
  }
}
