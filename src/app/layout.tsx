// src/app/layout.tsx
import { Metadata } from "next";
import ClientLayout from "./ClientLayout";

export const metadata: Metadata = {
  title: {
    template: "%s | RE",
    default: "Atom | Requirements Engineering",
  },
  description:
    "AI-powered requirements engineering tool for analyzing and validating engineering requirements against regulatory documents.",
  keywords: [
    "requirements engineering",
    "regulatory compliance",
    "AI analysis",
    "engineering requirements",
    "document analysis",
  ],
  authors: [
    {
      name: "Shilp.io",
      url: "https://your-company.com",
    },
  ],
  creator: "Shilp.io",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClientLayout>{children}</ClientLayout>;
}