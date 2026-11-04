import type { Metadata } from "next";
import Link from "next/link";
import BetaForm from "@/components/BetaForm";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Prose from "@/components/Prose";
import { site } from "@/components/site";

export const metadata: Metadata = {
  title: "Join the beta",
  description: `Get sneak previews of ${site.name}: sign up to test beta builds on iPhone, iPad or Android.`,
  alternates: { canonical: "/beta" },
};

export default function Beta() {
  return (
    <>
      <Header />
      <Prose>
        <h1>Join the beta</h1>
        <p className="lede">
          Play new builds of {site.name} before anyone else, and help shape them. Leave the
          address your device uses for its store and you will be invited when a test build is
          ready.
        </p>
        <ul>
          <li>
            <strong>iPhone and iPad:</strong> {site.name} is out now. Sign up here if you would
            like sneak previews of beta builds through Apple&rsquo;s TestFlight app (we need the
            email address of your Apple ID), or{" "}
            <a href={site.stores.appStore}>download it from the App Store</a> if you would rather
            play the released game.
          </li>
          <li>
            <strong>Android:</strong> testing runs through Google Play, so we need the email
            address of the Google account on your device.
          </li>
        </ul>

        <div className="my-10">
          <BetaForm />
        </div>

        <p className="text-sm text-muted">
          Your address is used only to invite you to the beta and is not shared or sold; see{" "}
          <Link href="/privacy#beta">Beta sign-ups</Link> in the privacy policy. To be taken off
          the list, email <a href={`mailto:${site.email}`}>{site.email}</a>.
        </p>
      </Prose>
      <Footer />
    </>
  );
}
