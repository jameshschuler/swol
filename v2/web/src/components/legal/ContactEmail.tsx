import { contactEmail } from './legal-constants'

export function ContactEmail() {
  return (
    <a href={`mailto:${contactEmail}`} className="font-heading underline">
      {contactEmail}
    </a>
  )
}
