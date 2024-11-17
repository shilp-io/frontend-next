import type { Metadata } from "next";
import localFont from "next/font/local";
import "@/styles/globals.css";
import { Providers } from '@/components/providers';

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

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
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
