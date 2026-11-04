import nodemailer from "nodemailer";
import { site } from "@/components/site";
import type { Signup } from "./beta";

/**
 * Emails a new beta sign-up through Gmail, the way NextQuest sends its mail:
 * smtp.gmail.com on 587 with STARTTLS, signed in with an app password.
 *
 *   GMAIL_USER          the Gmail address it sends from
 *   GMAIL_APP_PASSWORD  an app password for that account (myaccount.google.com/apppasswords)
 *   BETA_NOTIFY_TO      where the note goes (optional; defaults to GMAIL_USER)
 *
 * With GMAIL_USER or GMAIL_APP_PASSWORD unset, nothing is sent and sign-ups
 * are still kept. The note is plain text, so nothing a visitor typed can
 * become markup or a header.
 */
export async function notifySignup(s: Signup, total: number): Promise<void> {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) return;

  const platforms = [s.apple && "iPhone/iPad", s.google && "Android"].filter(Boolean).join(" + ");
  const transport = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    requireTLS: true,
    auth: { user, pass },
  });
  await transport.sendMail({
    from: `${site.name} beta <${user}>`,
    to: process.env.BETA_NOTIFY_TO || user,
    subject: `${site.name} beta: new sign-up (${platforms})`,
    text: [
      `Name:            ${s.name || "(not given)"}`,
      `Apple ID:        ${s.apple || "-"}`,
      `Google account:  ${s.google || "-"}`,
      `Signed up:       ${s.at}`,
      "",
      `${total} sign-up${total === 1 ? "" : "s"} so far. Run \`npm run beta-export\` on the host for the TestFlight and Google Play lists.`,
    ].join("\n"),
  });
}
