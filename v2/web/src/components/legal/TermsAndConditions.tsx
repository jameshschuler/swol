import { Link } from '@tanstack/react-router'
import { ContactEmail } from './ContactEmail'
import { LegalPage } from './LegalPage'
import { LegalSection } from './LegalSection'

export function TermsAndConditions() {
  return (
    <LegalPage title="Terms & Conditions">
      <p>
        These terms cover your use of Swol, a workout tracker. By creating an
        account or using Swol, you agree to them.
      </p>
      <LegalSection title="Not medical advice">
        <p>
          Swol helps you record your training. It doesn't give medical, health
          or training advice. Talk to a doctor before starting a new exercise
          program, and lift within your limits. You train at your own risk.
        </p>
      </LegalSection>
      <LegalSection title="Your account">
        <ul>
          <li>Give a real email address and keep your password private.</li>
          <li>You're responsible for what happens under your account.</li>
          <li>You must be at least 13 years old to use Swol.</li>
        </ul>
      </LegalSection>
      <LegalSection title="Your data">
        <p>
          What you log is yours. We only use it to run Swol, as described in our{' '}
          <Link to="/privacy" className="underline">
            Privacy Policy
          </Link>
          . You can ask us to delete your account at any time.
        </p>
      </LegalSection>
      <LegalSection title="Fair use">
        <p>
          Don't try to break, overload or get unauthorized access to Swol or
          other people's accounts. We may suspend accounts that do.
        </p>
      </LegalSection>
      <LegalSection title="The service">
        <p>
          Swol is provided as is, without warranties of any kind. We may change
          or stop features, and the service may sometimes be unavailable. Keep
          your own copy of anything you can't afford to lose.
        </p>
      </LegalSection>
      <LegalSection title="Liability">
        <p>
          To the extent the law allows, Swol and its maker aren't liable for any
          injury, data loss or other damage that comes from using the app.
        </p>
      </LegalSection>
      <LegalSection title="Changes">
        <p>
          We may update these terms. If we do, we'll change the date at the top
          of this page. Using Swol after that means you accept the new terms.
        </p>
      </LegalSection>
      <LegalSection title="Contact">
        <p>
          Questions about these terms? Email <ContactEmail />.
        </p>
      </LegalSection>
    </LegalPage>
  )
}
