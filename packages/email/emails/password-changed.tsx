import { Section } from "@react-email/components";
import {
  EmailButton,
  EmailDivider,
  EmailFooter,
  EmailHeading,
  EmailLayout,
  EmailText,
} from "./email-layout";

interface PasswordChangedEmailProps {
  name?: string;
  secureUrl: string;
}

export function PasswordChangedEmail({ name, secureUrl }: PasswordChangedEmailProps) {
  return (
    <EmailLayout preview="Your password was changed">
      <EmailHeading>Your password was changed</EmailHeading>
      <Section>
        <EmailText>
          {name ? `Hi ${name},` : "Hello,"} your account password was recently changed. If this was
          you, no further action is needed.
        </EmailText>
        <EmailDivider />
        <EmailText>
          If you did <strong>not</strong> make this change, your account may be compromised. Click
          the button below to secure your account immediately:
        </EmailText>
        <EmailButton href={secureUrl}>Secure my account</EmailButton>
        <EmailText muted>
          This will sign out all sessions and send you a link to reset your password.
        </EmailText>
      </Section>
      <EmailFooter>
        <EmailText muted>
          If the button above doesn&apos;t work, copy and paste this URL into your browser:
          <br />
          {secureUrl}
        </EmailText>
      </EmailFooter>
    </EmailLayout>
  );
}

export default PasswordChangedEmail;
