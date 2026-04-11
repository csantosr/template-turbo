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

interface ResetPasswordEmailProps {
  url: string;
  name?: string;
}

export function ResetPasswordEmail({ url, name }: ResetPasswordEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Reset your password</Preview>
      <Body style={{ backgroundColor: "#f6f9fc", fontFamily: "sans-serif" }}>
        <Container style={{ maxWidth: "560px", margin: "0 auto", padding: "40px 0" }}>
          <Heading style={{ fontSize: "24px", color: "#1a1a1a" }}>
            Reset your password
          </Heading>
          <Section>
            <Text style={{ fontSize: "16px", color: "#444", lineHeight: "1.6" }}>
              {name ? `Hi ${name}, click` : "Click"} the button below to reset
              your password. This link expires in 1 hour.
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
              Reset password
            </Button>
            <Text style={{ fontSize: "14px", color: "#888" }}>
              If you didn't request this, you can safely ignore this email.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default ResetPasswordEmail;
