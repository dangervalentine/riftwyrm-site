import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Prose from "@/components/Prose";
import { site } from "@/components/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${site.name} handles your data.`,
  alternates: { canonical: "/privacy" },
};

/** Stated as narrowly as the app behaves: progress on the device, the
 * player's own choice to use Google Play Games or Apple Game Center, the
 * shared leaderboard the game sends finished games to while signed in to one
 * of them (dragon-hunter specs/042), and on the website the beta sign-up form
 * (app/beta). Nothing here may claim collection the game or the site does not
 * do, and nothing it does may go unsaid. */
const EFFECTIVE = "November 6, 2026";

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
          progress on your device. If you sign in to Google Play Games or Apple Game Center, the
          game also sends the games you finish to our own leaderboard service, so players on
          Android, iPhone and iPad can share one leaderboard. We do not sell or share your data. The
          beta sign-up on this website keeps the email address you give it so we can invite you to
          test the game.
        </p>

        <h2>Information stored on your device</h2>
        <p>
          The game saves your progress on your device: what you have unlocked, your play records,
          your achievements and your settings. Apart from the game records described under{" "}
          <a href="#leaderboard">Shared leaderboard</a>, sent only while you are signed in, this
          information stays on your device and is not sent to us.
        </p>

        <h2>What we do not do</h2>
        <ul>
          <li>The game shows no ads.</li>
          <li>The game contains no analytics and no tracking.</li>
          <li>We do not sell your data or share it with anyone for advertising.</li>
          <li>The game has no account system of its own; you never create an account with us.</li>
          <li>
            Signed out, the game sends no data to any server of ours. Signed in, it sends only what{" "}
            <a href="#leaderboard">Shared leaderboard</a> lists.
          </li>
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
          they show developers in aggregate, such as leaderboard entries, and what the game sends us
          for the shared leaderboard below.
        </p>

        <h2 id="leaderboard">Shared leaderboard</h2>
        <p>
          While you are signed in to Google Play Games or Apple Game Center, the game sends each
          game you finish to our own leaderboard service, run by us on our own server, so that
          players on Android, iPhone and iPad can share one leaderboard. Games finished before you
          signed in are sent once when you do.
        </p>
        <ul>
          <li>
            <strong>What is sent:</strong> which platform you play on; your Google Play Games or Game
            Center player ID; your display name on that platform; and, for each finished game, its
            result, score, difficulty, dragon, the rules and options played, how far the game got,
            the time played, and when it started and ended.
          </li>
          <li>
            <strong>How we know it is you:</strong> each time, the game asks Google or Apple for a
            proof that you are signed in, and our service checks it with them. We do not keep the
            proof.
          </li>
          <li>
            <strong>Who sees it:</strong> other players see your display name, your platform, and
            the score, dragon, rules, time and date of your best wins on the leaderboard. Your player
            ID, your losses and your other games are shown to no one.
          </li>
          <li>
            <strong>What it is used for:</strong> showing the leaderboard and keeping your game
            records. It is not sold, not shared with anyone else, and not used for advertising.
          </li>
          <li>
            <strong>How long it is kept:</strong> until you ask us to remove it, or the service is
            shut down. Backup copies of the database are kept for up to 30 days for recovery.
          </li>
          <li>
            <strong>Removing it:</strong> email {mail} with your display name and platform, and we
            will delete everything the service holds about you. Signing out stops anything new from
            being sent.
          </li>
        </ul>
        <p>
          The connection to the service is encrypted. Google&rsquo;s and Apple&rsquo;s own
          leaderboards keep receiving your wins too, under their own privacy policies.
        </p>

        <h2 id="beta">Beta sign-ups on this website</h2>
        <p>
          If you sign up on the <Link href="/beta">beta page</Link>, we keep what you enter: your
          name if you give one, and the email address of your Apple ID, your Google account, or
          both, with the date you signed up. It is stored on our own server, not with a form or
          mailing-list service.
        </p>
        <ul>
          <li>
            We use it only to invite you to test the game. An Apple ID is passed straight to
            Apple&rsquo;s TestFlight when you sign up, and Apple sends you the invitation; for a Google
            account, we email you the links to join our Google Group for testers and Google
            Play&rsquo;s testing program. Only we can see the group&rsquo;s members. Apple and Google handle it there under their own privacy policies.
          </li>
          <li>We do not use it for marketing, and we do not sell or share it with anyone else.</li>
          <li>
            To be removed from the list, email {mail}. We delete it, and remove you from the test
            groups, once you ask or once the beta ends.
          </li>
        </ul>

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
            <strong>Shared leaderboard:</strong> email {mail} with your display name and platform,
            and we will delete your records and remove you from the leaderboard.
          </li>
          <li>
            <strong>Beta sign-ups:</strong> email {mail} and we will delete your sign-up.
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
