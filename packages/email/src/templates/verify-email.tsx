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

interface VerifyEmailProps {
  name: string;
  url: string;
}

export function VerifyEmailEmail({ name, url }: VerifyEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Verify your email address</Preview>
      <Body style={{ backgroundColor: "#f6f9fc", fontFamily: "sans-serif" }}>
        <Container style={{ maxWidth: "560px", margin: "0 auto", padding: "40px 0" }}>
          <Heading style={{ fontSize: "24px", color: "#1a1a1a" }}>
            Verify your email, {name}
          </Heading>
          <Section>
            <Text style={{ fontSize: "16px", color: "#444", lineHeight: "1.6" }}>
              Thanks for signing up. Click the button below to verify your email address and activate your account.
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
              Verify email address
            </Button>
            <Text style={{ fontSize: "14px", color: "#888", marginTop: "24px" }}>
              This link expires in 1 hour. If you did not create an account, you can safely ignore this email.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default VerifyEmailEmail;
