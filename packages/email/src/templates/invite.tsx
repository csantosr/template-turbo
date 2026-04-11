import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface InviteEmailProps {
  name: string;
  inviterName: string;
  role: string;
  url: string;
}

export function InviteEmail({ name, inviterName, role, url }: InviteEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>You've been invited to join the app</Preview>
      <Body style={{ backgroundColor: "#f6f9fc", fontFamily: "sans-serif" }}>
        <Container style={{ maxWidth: "560px", margin: "0 auto", padding: "40px 0" }}>
          <Heading style={{ fontSize: "24px", color: "#1a1a1a" }}>
            You've been invited
          </Heading>
          <Section>
            <Text style={{ fontSize: "16px", color: "#444", lineHeight: "1.6" }}>
              Hi {name}, {inviterName} has invited you to join the app as{" "}
              <strong>{role}</strong>. Set a password to activate your account.
            </Text>
            <Button
              href={url}
              style={{
                backgroundColor: "#0070f3",
                color: "#fff",
                padding: "12px 24px",
                borderRadius: "6px",
                textDecoration: "none",
                display: "inline-block",
              }}
            >
              Set your password
            </Button>
            <Text style={{ fontSize: "14px", color: "#888" }}>
              This link expires in 24 hours. If you weren't expecting this invite,
              you can safely ignore this email.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default InviteEmail;
