import { Section } from "@react-email/components";
import { EmailButton, EmailHeading, EmailLayout, EmailText } from "./email-layout";

interface ResetPasswordEmailProps {
  url: string;
  name?: string;
}

export function ResetPasswordEmail({ url, name }: ResetPasswordEmailProps) {
  return (
    <EmailLayout preview="Reset your password">
      <EmailHeading>Reset your password</EmailHeading>
      <Section>
        <EmailText>
          {name ? `Hi ${name}, click` : "Click"} the button below to reset your password. This link
          expires in 1 hour.
        </EmailText>
        <EmailButton href={url}>Reset password</EmailButton>
        <EmailText muted>
          If you didn&apos;t request this, you can safely ignore this email.
        </EmailText>
      </Section>
    </EmailLayout>
  );
}

export default ResetPasswordEmail;
