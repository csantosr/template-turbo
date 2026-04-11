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

interface WelcomeEmailProps {
  name: string;
  appUrl?: string;
}

export function WelcomeEmail({ name, appUrl = "http://localhost:3000" }: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to the app, {name}!</Preview>
      <Body style={{ backgroundColor: "#f6f9fc", fontFamily: "sans-serif" }}>
        <Container style={{ maxWidth: "560px", margin: "0 auto", padding: "40px 0" }}>
          <Heading style={{ fontSize: "24px", color: "#1a1a1a" }}>
            Welcome, {name}!
          </Heading>
          <Section>
            <Text style={{ fontSize: "16px", color: "#444", lineHeight: "1.6" }}>
              Thanks for signing up. Click the button below to get started.
            </Text>
            <Button
              href={appUrl}
              style={{
                backgroundColor: "#0070f3",
                color: "#fff",
                padding: "12px 24px",
                borderRadius: "6px",
                textDecoration: "none",
                display: "inline-block",
              }}
            >
              Get started
            </Button>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default WelcomeEmail;
