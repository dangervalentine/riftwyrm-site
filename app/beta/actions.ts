"use server";

import { addSignup } from "@/lib/beta";

export type BetaState =
  | { status: "idle" }
  | { status: "done"; platforms: string }
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
  if (field(form, "website")) return { status: "done", platforms: "" };

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

  try {
    await addSignup({ at: new Date().toISOString(), name, apple, google });
  } catch (e) {
    console.error("beta sign-up could not be saved", e);
    return { status: "error", message: "Something went wrong saving that. Please try again in a little while.", values };
  }
  return {
    status: "done",
    platforms: ios && android ? "iPhone or iPad and Android" : ios ? "iPhone or iPad" : "Android",
  };
}
