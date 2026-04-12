export const BRANDING = {
  name: "template",
  logo: {
    full: "/logo.svg",
    fullDark: "/logo-dark.svg",
    icon: "/logo-icon.svg",
    iconDark: "/logo-icon-dark.svg",
  },
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
} as const;
