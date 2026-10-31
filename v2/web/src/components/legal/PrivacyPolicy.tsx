import { ContactEmail } from './ContactEmail'
import { LegalPage } from './LegalPage'
import { LegalSection } from './LegalSection'

export function PrivacyPolicy() {
  return (
    <LegalPage title="Privacy Policy">
      <p>
        Swol is a workout tracker. This page explains what Swol stores about
        you, why, and how to get it deleted.
      </p>
      <LegalSection title="What we collect">
        <ul>
          <li>
            <span className="font-heading">Account details:</span> your email
            address and a password, which is stored hashed. If you sign in with
            Google, we receive your name, email address and profile picture from
            your Google account.
          </li>
          <li>
            <span className="font-heading">What you log:</span> workout sessions
            and check-ins with their times, session notes, milestones (exercise,
            weight, reps and date), goals, custom exercises and your weight
            unit.
          </li>
          <li>
            <span className="font-heading">On your device:</span> your sign-in
            session and theme choice are kept in your browser's local storage.
          </li>
        </ul>
        <p>
          We don't use analytics, advertising or tracking cookies. Our hosting
          provider keeps short-lived server logs, such as IP addresses and
          request times, to keep the service running.
        </p>
      </LegalSection>
      <LegalSection title="How we use it">
        <p>
          Only to run Swol: to sign you in, save what you log, and show you your
          history, stats, goals and achievements. We don't sell your data or
          share it with anyone for marketing.
        </p>
      </LegalSection>
      <LegalSection title="Google user data">
        <p>
          If you sign in with Google, we only use your name, email address and
          profile picture to create and identify your account. Swol's use of
          information received from Google APIs adheres to the{' '}
          <a
            href="https://developers.google.com/terms/api-services-user-data-policy"
            className="underline"
          >
            Google API Services User Data Policy
          </a>
          , including the Limited Use requirements.
        </p>
      </LegalSection>
      <LegalSection title="Where it's stored">
        <p>
          Your account and data are stored with Supabase, which provides our
          database and sign-in. The app and its API are hosted on Render. Both
          only process data on our behalf to run the service.
        </p>
      </LegalSection>
      <LegalSection title="Deleting your data">
        <p>
          Email <ContactEmail /> from the address on your account and ask us to
          delete it. We'll delete your account and everything you've logged
          within 30 days and confirm when it's done.
        </p>
      </LegalSection>
      <LegalSection title="Children">
        <p>Swol is not meant for children under 13.</p>
      </LegalSection>
      <LegalSection title="Changes">
        <p>
          If this policy changes, we'll update this page and the date at the
          top.
        </p>
      </LegalSection>
      <LegalSection title="Contact">
        <p>
          Questions about your privacy? Email <ContactEmail />.
        </p>
      </LegalSection>
    </LegalPage>
  )
}
