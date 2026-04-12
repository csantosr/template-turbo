import { Section, Text } from "@react-email/components";
import {
  BRUTALIST_STYLES,
  EmailButton,
  EmailDivider,
  EmailFooter,
  EmailHeading,
  EmailLayout,
  EmailText,
} from "./email-layout";

interface WelcomeEmailProps {
  name: string;
  appUrl?: string;
}

const FEATURES = [
  { label: "AUTH", desc: "Email/password, OAuth, and session management out of the box" },
  { label: "API", desc: "End-to-end type-safe APIs with tRPC" },
  { label: "UI", desc: "Brutalist shadcn/ui components ready to customize" },
];

export function WelcomeEmail({ name, appUrl = "http://localhost:3000" }: WelcomeEmailProps) {
  return (
    <EmailLayout preview={`Welcome to template, ${name}!`}>
      <EmailHeading>Welcome, {name}!</EmailHeading>
      <Section>
        <EmailText>You&apos;re in. Here&apos;s what you get:</EmailText>
        {FEATURES.map((f) => (
          <Section
            key={f.label}
            style={{
              marginBottom: "16px",
              paddingLeft: "16px",
              borderLeft: "2px solid #000",
            }}
          >
            <Text
              style={{
                fontSize: "12px",
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: "#000",
                margin: "0 0 4px 0",
              }}
            >
              {f.label}
            </Text>
            <Text style={{ fontSize: "14px", color: "#444", margin: 0, lineHeight: "1.4" }}>
              {f.desc}
            </Text>
          </Section>
        ))}
        <EmailButton href={appUrl}>Go to dashboard</EmailButton>
      </Section>

      <EmailDivider />

      <Section style={{ marginBottom: "24px" }}>
        <EmailText muted>
          Need help? Reply to this email or open an issue on GitHub. We read everything.
        </EmailText>
      </Section>

      <EmailFooter>
        <EmailText muted>— The template team</EmailText>
      </EmailFooter>
    </EmailLayout>
  );
}

export default WelcomeEmail;
