"use server";

import { addSignup, type Signup } from "@/lib/beta";
import { notifySignup } from "@/lib/notify";
import { inviteTester, splitName, testflightConfig } from "@/lib/testflight";

export type BetaState =
  | { status: "idle" }
  /** testflight: whether the Apple ID is already in the TestFlight group. */
  | { status: "done"; apple: string; google: string; testflight: boolean }
  | {
      status: "error";
      message: string;
      field?: "platform" | "apple" | "google";
      /** What was sent, put back in the form (React clears it after a submit). */
      values: BetaValues;
    };

export type BetaValues = { name: string; ios: boolean; android: boolean; apple: string; google: string };

/** Loose on purpose: the stores check the address; this catches typos. */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function field(form: FormData, name: string, max = 254): string {
  const v = form.get(name);
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

export async function joinBeta(_prev: BetaState, form: FormData): Promise<BetaState> {
  // The hidden "website" box is left empty by people and filled in by bots.
  // A bot is told it succeeded and nothing is kept.
  if (field(form, "website")) return { status: "done", apple: "", google: "", testflight: false };

  const ios = form.get("ios") === "on";
  const android = form.get("android") === "on";
  const name = field(form, "name", 100);
  const apple = ios ? field(form, "apple").toLowerCase() : "";
  const google = android ? field(form, "google").toLowerCase() : "";
  const values = { name, ios, android, apple: field(form, "apple"), google: field(form, "google") };

  if (!ios && !android) {
    return { status: "error", field: "platform", message: "Choose iPhone or iPad, Android, or both.", values };
  }
  if (ios && !EMAIL.test(apple)) {
    return { status: "error", field: "apple", message: "Enter the email address of your Apple ID.", values };
  }
  if (android && !EMAIL.test(google)) {
    return { status: "error", field: "google", message: "Enter the email address of your Google account.", values };
  }

  const signup: Signup = { at: new Date().toISOString(), name, apple, google };
  let total: number | null;
  try {
    total = await addSignup(signup);
  } catch (e) {
    console.error("beta sign-up could not be saved", e);
    return { status: "error", message: "Something went wrong saving that. Please try again in a little while.", values };
  }
  // The sign-up is already kept, so from here a failure is logged and mailed,
  // never shown: the visitor is on the list either way.
  let invited = false;
  if (total !== null) {
    const notes: string[] = [];
    if (apple) {
      const tf = await testflight(apple, name);
      invited = tf.ok;
      notes.push(`TestFlight: ${tf.note}`);
    }
    if (google) notes.push("Android: add them to the Play closed testing list, then email them the opt-in link.");
    await notifySignup(signup, total, notes).catch((e) => console.error("beta sign-up email failed", e));
  }
  return { status: "done", apple, google, testflight: invited };
}

/** Adds the Apple ID to the TestFlight group and says how it went. */
async function testflight(email: string, name: string): Promise<{ ok: boolean; note: string }> {
  const cfg = testflightConfig();
  if (!cfg) return { ok: false, note: "not set up on the server; run npm run testflight -- sync once it is." };
  try {
    const r = await inviteTester(cfg, { email, ...splitName(name) });
    return {
      ok: true,
      note: r === "added" ? "added to the group; Apple sends the invitation." : "was already a tester; added to the group.",
    };
  } catch (e) {
    console.error("TestFlight invite failed", e);
    return { ok: false, note: `FAILED (${e instanceof Error ? e.message : e}); run npm run testflight -- sync to retry.` };
  }
}
