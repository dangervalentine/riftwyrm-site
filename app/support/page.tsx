import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Prose from "@/components/Prose";
import { site } from "@/components/site";

export const metadata: Metadata = {
  title: "Support",
  description: `Help with ${site.name}: saving, syncing and resetting progress.`,
  alternates: { canonical: "/support" },
};

export default function Support() {
  const mail = <a href={`mailto:${site.email}`}>{site.email}</a>;
  return (
    <>
      <Header />
      <Prose>
        <h1>Support</h1>
        <p className="lede">
          Something not working, or a question about the game? Email {mail}. Tell us your device,
          its system version and what happened, and we will get back to you.
        </p>

        <h2>Frequently asked questions</h2>

        <h3>Where is my progress saved?</h3>
        <p>
          On your device. Your unlocks, play records, achievements and settings are kept by the
          game itself. If you sign in to Google Play Games (Android) or use Game Center (iPhone and
          iPad), a copy of your progress is also kept with that service.
        </p>

        <h3>How does syncing work?</h3>
        <ul>
          <li>
            <strong>Android:</strong> sign in with Google Play Games and your progress follows your
            Google account from one Android device to another.
          </li>
          <li>
            <strong>iPhone and iPad:</strong> with Game Center (and iCloud) on, your progress syncs
            between your Apple devices.
          </li>
          <li>
            <strong>Between Android and iOS:</strong> progress does not sync between Android and
            iPhone or iPad. The two platforms keep separate saves.
          </li>
        </ul>

        <h3>How do I reset my progress?</h3>
        <p>
          Uninstalling the game, or clearing its app data, removes the progress stored on that
          device. If you use Google Play Games or Game Center, the copy kept there can be removed
          through your Google or Apple account settings; see{" "}
          <Link href="/privacy#deleting">Deleting your data</Link> in the privacy policy. If you would like
          help, email {mail}.
        </p>

        <h3>Does the game collect my data?</h3>
        <p>
          No. There are no ads, no analytics and no tracking. The{" "}
          <Link href="/privacy">privacy policy</Link> has the details.
        </p>
      </Prose>
      <Footer />
    </>
  );
}
