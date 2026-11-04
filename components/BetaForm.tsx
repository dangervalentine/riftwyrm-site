"use client";

import { useActionState } from "react";
import { joinBeta, type BetaState } from "@/app/beta/actions";

const input =
  "mt-1.5 block w-full rounded-md border border-line bg-well px-3 py-2.5 text-parchment placeholder:text-faint " +
  "focus:border-brass focus:outline-none aria-[invalid=true]:border-danger";

/**
 * The sign-up form. It works without JavaScript: the server action runs on a
 * plain post, and each platform's email box is shown by CSS when its box is
 * ticked (.beta-form in globals.css), not by script.
 */
export default function BetaForm() {
  const [state, action, pending] = useActionState<BetaState, FormData>(joinBeta, { status: "idle" });

  if (state.status === "done") {
    return (
      <div role="status" className="space-y-3 rounded-lg border border-line bg-stone p-6">
        <p className="font-display text-xl font-semibold text-parchment">You&rsquo;re on the list.</p>
        {state.apple && (
          <p className="text-muted">
            <strong className="text-parchment">iPhone and iPad:</strong>{" "}
            {state.testflight
              ? "you have been added to the TestFlight beta. Apple will email your invitation to "
              : "you will be added to the TestFlight beta, and Apple will email your invitation to "}
            <span className="text-parchment">{state.apple}</span>
            {state.testflight ? "" : " shortly"}. Open it on your device to install the test build
            with TestFlight.
          </p>
        )}
        {state.google && (
          <p className="text-muted">
            <strong className="text-parchment">Android:</strong>{" "}
            {state.androidMailed
              ? "you have been added to the Android test. An email with the link to join it is on its way to "
              : "you will be added to the Android test, and an email with the link to join it will be sent to "}
            <span className="text-parchment">{state.google}</span>
            {state.androidMailed ? "" : " shortly"}. Check your spam folder if it hasn&rsquo;t arrived.
          </p>
        )}
        {!state.apple && !state.google && (
          <p className="text-muted">The invitation will come to the address you gave.</p>
        )}
      </div>
    );
  }

  const v = state.status === "error" ? state.values : undefined;
  const bad = (f: string) => state.status === "error" && state.field === f;
  const err = (f: string) =>
    bad(f) ? (
      <p id={`${f}-error`} className="mt-1.5 text-sm text-danger">
        {state.status === "error" && state.message}
      </p>
    ) : null;

  return (
    // Keyed by each answer so a failed try puts back what was typed.
    <form key={JSON.stringify(v)} action={action} className="beta-form space-y-6" noValidate>
      <div>
        <label htmlFor="name" className="font-semibold text-parchment">
          Name <span className="font-normal text-muted">(optional)</span>
        </label>
        <input id="name" name="name" autoComplete="name" maxLength={100} defaultValue={v?.name} className={input} />
      </div>

      <fieldset aria-describedby={bad("platform") ? "platform-error" : undefined}>
        <legend className="font-semibold text-parchment">What will you play on?</legend>
        <div className="mt-2 flex flex-wrap gap-x-8 gap-y-2">
          <label className="flex items-center gap-2.5">
            <input type="checkbox" id="ios" name="ios" defaultChecked={v?.ios} className="size-4 accent-brass" />
            iPhone or iPad
          </label>
          <label className="flex items-center gap-2.5">
            <input type="checkbox" id="android" name="android" defaultChecked={v?.android} className="size-4 accent-brass" />
            Android
          </label>
        </div>
        {err("platform")}
      </fieldset>

      <div className="beta-ios">
        <label htmlFor="apple" className="font-semibold text-parchment">Apple ID email</label>
        <p className="text-sm text-muted">
          The address you sign in to the App Store with. TestFlight sends the invitation there.
        </p>
        <input
          id="apple"
          name="apple"
          type="email"
          inputMode="email"
          autoComplete="email"
          maxLength={254}
          defaultValue={v?.apple}
          aria-invalid={bad("apple")}
          aria-describedby={bad("apple") ? "apple-error" : undefined}
          className={input}
        />
        {err("apple")}
      </div>

      <div className="beta-android">
        <label htmlFor="google" className="font-semibold text-parchment">Google account email</label>
        <p className="text-sm text-muted">
          The account you use Google Play with on your Android device (usually a Gmail address).
        </p>
        <input
          id="google"
          name="google"
          type="email"
          inputMode="email"
          autoComplete="email"
          maxLength={254}
          defaultValue={v?.google}
          aria-invalid={bad("google")}
          aria-describedby={bad("google") ? "google-error" : undefined}
          className={input}
        />
        {err("google")}
      </div>

      {/* For bots only: hidden from people and from screen readers. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="website">Leave this empty</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      {state.status === "error" && !state.field && (
        <p role="alert" className="text-danger">{state.message}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-brass px-6 py-3 font-semibold text-on-brass transition-colors hover:bg-brass-bright disabled:opacity-60"
      >
        {pending ? "Sending…" : "Join the beta"}
      </button>
    </form>
  );
}
