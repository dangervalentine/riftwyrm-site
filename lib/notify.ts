import nodemailer from "nodemailer";
import { site } from "../components/site.ts";
import type { Signup } from "./beta.ts";

/**
 * Beta mail, sent through Gmail the way NextQuest sends its mail:
 * smtp.gmail.com on 587 with STARTTLS, signed in with an app password.
 *
 *   GMAIL_USER          the Gmail address it sends from
 *   GMAIL_APP_PASSWORD  an app password for that account (myaccount.google.com/apppasswords)
 *   BETA_NOTIFY_TO      where sign-up notes go (optional; defaults to GMAIL_USER)
 *
 * With GMAIL_USER or GMAIL_APP_PASSWORD unset, nothing is sent and sign-ups
 * are still kept. Every message is plain text, so nothing a visitor typed can
 * become markup or a header. Free of the "@/" alias so scripts can import it.
 */
function mailer() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) return null;
  const transport = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    requireTLS: true,
    auth: { user, pass },
  });
  return { user, transport };
}

/** The note to the developer about a new sign-up. */
export async function notifySignup(s: Signup, total: number, notes: string[] = []): Promise<void> {
  const m = mailer();
  if (!m) return;
  const platforms = [s.apple && "iPhone/iPad", s.google && "Android"].filter(Boolean).join(" + ");
  await m.transport.sendMail({
    from: `${site.name} beta <${m.user}>`,
    to: process.env.BETA_NOTIFY_TO || m.user,
    subject: `${site.name} beta: new sign-up (${platforms})`,
    text: [
      `Name:            ${s.name || "(not given)"}`,
      `Apple ID:        ${s.apple || "-"}`,
      `Google account:  ${s.google || "-"}`,
      `Signed up:       ${s.at}`,
      "",
      ...notes,
      ...(notes.length ? [""] : []),
      `${total} sign-up${total === 1 ? "" : "s"} so far. Run \`npm run beta-export\` on the host for the TestFlight and Google Play lists.`,
    ].join("\n"),
  });
}

/**
 * The Android tester's invitation: join the Google Group with the account
 * they gave, then opt in on Google Play. Returns false when mail is not set up
 * (nothing sent); throws when sending fails.
 */
export async function sendAndroidInvite(to: string, name: string): Promise<boolean> {
  const m = mailer();
  if (!m) return false;
  const first = name.split(/\s+/).filter(Boolean)[0];
  await m.transport.sendMail({
    from: `${site.name} <${m.user}>`,
    replyTo: site.email,
    to,
    subject: `Your ${site.name} Android beta invitation`,
    text: [
      first ? `Hi ${first},` : "Hi,",
      "",
      `Thanks for signing up to test ${site.name} on Android. Two steps, both while signed in to Google as ${to}:`,
      "",
      `1. Join the tester group (click "Join group"):`,
      `   ${site.androidBeta.group}`,
      "",
      `2. Then become a tester on Google Play and install ${site.name} from there:`,
      `   ${site.androidBeta.optIn}`,
      "",
      "If step 2 says the app isn't available yet, give it a few minutes after joining the group and try again.",
      "",
      `Questions, or something not working? Just reply to this email.`,
      "",
      `${site.developer}`,
      `${site.url}`,
    ].join("\n"),
  });
  return true;
}
