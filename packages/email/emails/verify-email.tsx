import { Section } from "@react-email/components";
import { EmailButton, EmailHeading, EmailLayout, EmailText } from "./email-layout";

interface VerifyEmailProps {
  name: string;
  url: string;
}

export function VerifyEmailEmail({ name, url }: VerifyEmailProps) {
  return (
    <EmailLayout preview="Verify your email address">
      <EmailHeading>Verify your email, {name}</EmailHeading>
      <Section>
        <EmailText>
          Thanks for signing up. Click the button below to verify your email address and activate
          your account.
        </EmailText>
        <EmailButton href={url}>Verify email address</EmailButton>
        <EmailText muted>
          This link expires in 1 hour. If you did not create an account, you can safely ignore this
          email.
        </EmailText>
      </Section>
    </EmailLayout>
  );
}

export default VerifyEmailEmail;
