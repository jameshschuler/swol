import { Button } from '#/components/ui/button'
import { GoogleLogo } from './GoogleLogo'

export function GoogleSignInButton({
  disabled,
  onClick,
}: {
  disabled: boolean
  onClick: () => void
}) {
  return (
    <Button
      type="button"
      variant="neutral"
      className="w-full"
      disabled={disabled}
      onClick={onClick}
    >
      <GoogleLogo />
      Continue with Google
    </Button>
  )
}
