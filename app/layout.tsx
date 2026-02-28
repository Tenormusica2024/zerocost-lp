import type { Metadata } from "next";
import { Bricolage_Grotesque, DM_Sans } from "next/font/google";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  title: "zerocost — Free OpenAI-Compatible LLM Router",
  description:
    "Route your AI requests across Groq, Cerebras, and HuggingFace free tiers. Auto-failover when rate limits hit. OpenAI-compatible API. Always free.",
  openGraph: {
    title: "zerocost — Free OpenAI-Compatible LLM Router",
    description:
      "Route your AI requests across Groq, Cerebras, and HuggingFace free tiers. Auto-failover when rate limits hit.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${bricolage.variable} ${dmSans.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
