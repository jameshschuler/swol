import { Link } from '@tanstack/react-router'

export function LegalLinks() {
  return (
    <nav className="flex justify-center gap-4 text-sm">
      <Link to="/privacy" className="underline">
        Privacy Policy
      </Link>
      <Link to="/terms-conditions" className="underline">
        Terms & Conditions
      </Link>
    </nav>
  )
}
