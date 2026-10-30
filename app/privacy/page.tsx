import type { Metadata } from "next";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Prose from "@/components/Prose";
import { site } from "@/components/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${site.name} handles your data.`,
  alternates: { canonical: "/privacy" },
};

/** Stated as narrowly as the app behaves: progress on the device, and the
 * player's own choice to use Google Play Games or Apple Game Center. Nothing
 * here may claim collection the game does not do. */
const EFFECTIVE = "October 29, 2026";

export default function Privacy() {
  const mail = <a href={`mailto:${site.email}`}>{site.email}</a>;
  return (
    <>
      <Header />
      <Prose>
        <h1>Privacy Policy</h1>
        <p className="lede">Effective {EFFECTIVE}</p>

        <p>
          This policy explains how {site.name} (&ldquo;the game&rdquo;), made by {site.developer}{" "}
          (&ldquo;we&rdquo;, &ldquo;us&rdquo;), handles information. In short: the game keeps your
          progress on your device, and we do not collect, sell or share your personal data.
        </p>

        <h2>Information stored on your device</h2>
        <p>
          The game saves your progress on your device: what you have unlocked, your play records,
          your achievements and your settings. This information stays on your device and is not
          sent to us.
        </p>

        <h2>What we do not do</h2>
        <ul>
          <li>The game shows no ads.</li>
          <li>The game contains no analytics and no tracking.</li>
          <li>We do not sell your data or share it with anyone for advertising.</li>
          <li>The game has no account system of its own; you never create an account with us.</li>
          <li>We run no server that receives player data.</li>
        </ul>

        <h2>Optional: Google Play Games and Apple Game Center</h2>
        <p>
          If you choose to, you can connect the game to your platform&rsquo;s game service. This is
          up to you, and the game works without it.
        </p>
        <h3>Android: Google Play Games</h3>
        <p>
          If you sign in with Google Play Games, the game stores its saved progress in Google Play
          Games&rsquo; saved games, in your Google account, and reports your achievements and
          leaderboard scores to Google Play Games. This data is handled by Google under the{" "}
          <a href="https://policies.google.com/privacy">Google Privacy Policy</a>.
        </p>
        <h3>iPhone and iPad: Apple Game Center</h3>
        <p>
          If you use Apple Game Center, your saved progress syncs through Game Center and iCloud,
          and your achievements and leaderboard scores are reported to Game Center. This data is
          handled by Apple under the{" "}
          <a href="https://www.apple.com/legal/privacy/">Apple Privacy Policy</a>.
        </p>
        <h3>Leaderboards</h3>
        <p>
          Leaderboards show your Google Play Games gamertag or Game Center alias, together with
          your score, to other players.
        </p>
        <h3>What we can see</h3>
        <p>
          We do not receive or have access to the data you keep with Google or Apple, beyond what
          they show developers in aggregate, such as leaderboard entries.
        </p>

        <h2>Children</h2>
        <p>
          The game is intended for players aged 13 and over. It is not directed at children under
          13, and we do not knowingly collect personal information from them.
        </p>

        <h2 id="deleting">Deleting your data</h2>
        <ul>
          <li>
            <strong>On your device:</strong> uninstall the game, or clear its app data (on Android,
            Settings &rarr; Apps &rarr; {site.name} &rarr; Storage &rarr; Clear storage).
          </li>
          <li>
            <strong>Google Play Games:</strong> you can delete your Play Games data from the Google
            Play Games settings and through your{" "}
            <a href="https://myaccount.google.com/data-and-privacy">Google Account&rsquo;s Data
            &amp; privacy page</a>.
          </li>
          <li>
            <strong>Apple Game Center and iCloud:</strong> you can manage or delete your data in
            Settings on your device (Game Center, and iCloud &rarr; Manage Storage) and through{" "}
            <a href="https://privacy.apple.com/">Apple&rsquo;s Data and Privacy page</a>.
          </li>
          <li>
            <strong>Need help?</strong> Email {mail} and we will walk you through it.
          </li>
        </ul>

        <h2>Changes to this policy</h2>
        <p>
          If this policy changes, the new version will be posted on this page with a new
          effective date.
        </p>

        <h2>Contact</h2>
        <p>
          Questions about this policy can be sent to {site.developer} at {mail}.
        </p>
      </Prose>
      <Footer />
    </>
  );
}
