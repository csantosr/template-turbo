import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Section,
  Text,
} from "@react-email/components";
import type { ReactNode } from "react";

interface EmailLayoutProps {
  children: ReactNode;
  preview: string;
  logoUrl?: string;
}

const LOGO_DATA_URI =
  "data:image/png;base64,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";

const BRUTALIST_STYLES = {
  container: {
    maxWidth: "560px",
    margin: "0 auto",
    padding: "40px 0",
    backgroundColor: "#fafafa",
    fontFamily: "monospace",
  },
  card: {
    border: "2px solid #000",
    boxShadow: "4px 4px 0 0 #000",
    backgroundColor: "#ffffff",
    padding: "40px",
  },
  logo: {
    display: "block",
    margin: "0 auto 32px auto",
    width: "120px",
    height: "auto",
  },
  heading: {
    fontSize: "20px",
    fontWeight: "700",
    textTransform: "uppercase" as const,
    letterSpacing: "0.1em",
    color: "#000",
    margin: "0 0 24px 0",
  },
  text: {
    fontSize: "14px",
    lineHeight: "1.6",
    color: "#444",
    margin: "0 0 16px 0",
  },
  mutedText: {
    fontSize: "12px",
    lineHeight: "1.6",
    color: "#888",
    margin: "24px 0 16px 0",
  },
  button: {
    display: "inline-block",
    padding: "12px 24px",
    backgroundColor: "#ffffff",
    color: "#000000",
    textDecoration: "none",
    textTransform: "uppercase" as const,
    letterSpacing: "0.1em",
    fontSize: "12px",
    fontWeight: "700",
    border: "2px solid #222222",
    boxShadow: "4px 4px 0 0 #222222",
  },
  footer: {
    marginTop: "32px",
    paddingTop: "24px",
    borderTop: "2px solid #000",
  },
};

export function EmailLayout({ children, preview, logoUrl = LOGO_DATA_URI }: EmailLayoutProps) {
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: "#fafafa", fontFamily: "monospace" }}>
        <Container style={BRUTALIST_STYLES.container as Record<string, string>}>
          <Section style={BRUTALIST_STYLES.card as Record<string, string>}>
            <Img
              src={logoUrl}
              alt="template"
              width="120"
              style={BRUTALIST_STYLES.logo as Record<string, string>}
            />
            {children}
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export function EmailHeading({ children }: { children: React.ReactNode }) {
  return <Heading style={BRUTALIST_STYLES.heading as Record<string, string>}>{children}</Heading>;
}

export function EmailText({
  children,
  muted = false,
}: {
  children: React.ReactNode;
  muted?: boolean;
}) {
  return (
    <Text
      style={muted ? BRUTALIST_STYLES.mutedText : (BRUTALIST_STYLES.text as Record<string, string>)}
    >
      {children}
    </Text>
  );
}

export function EmailButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} style={BRUTALIST_STYLES.button as Record<string, string>}>
      {children}
    </a>
  );
}

export function EmailDivider() {
  return <Hr style={{ borderColor: "#000", borderWidth: "2px", margin: "24px 0" }} />;
}

export function EmailFooter({ children }: { children: React.ReactNode }) {
  return <Section style={BRUTALIST_STYLES.footer as Record<string, string>}>{children}</Section>;
}

export { BRUTALIST_STYLES };
