// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "APEX — AI Race Engineer",
  description:
    "Voice-powered live agent for F1 telemetry. Talk to live race data, build custom widgets, and get answers mid-race.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-apex-dark text-white min-h-screen">
        {children}
      </body>
    </html>
  );
}
