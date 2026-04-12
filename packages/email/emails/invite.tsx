import { Section } from "@react-email/components";
import { EmailButton, EmailHeading, EmailLayout, EmailText } from "./email-layout";

interface InviteEmailProps {
  name: string;
  inviterName: string;
  role: string;
  url: string;
}

export function InviteEmail({ name, inviterName, role, url }: InviteEmailProps) {
  return (
    <EmailLayout preview="You&apos;ve been invited to join the app">
      <EmailHeading>You&apos;ve been invited</EmailHeading>
      <Section>
        <EmailText>
          Hi {name}, {inviterName} has invited you to join the app as <strong>{role}</strong>. Set a
          password to activate your account.
        </EmailText>
        <EmailButton href={url}>Set your password</EmailButton>
        <EmailText muted>
          This link expires in 24 hours. If you weren&apos;t expecting this invite, you can safely
          ignore this email.
        </EmailText>
      </Section>
    </EmailLayout>
  );
}

export default InviteEmail;
