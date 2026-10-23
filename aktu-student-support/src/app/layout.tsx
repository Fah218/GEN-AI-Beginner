import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AKTU Student Support AI Chatbot | Dr. A.P.J. Abdul Kalam Technical University",
  description: "Official advisory AI chatbot for AKTU engineering students. Instant guidance on B.Tech syllabus, grace marks, carry-over examination rules, academic calendars, and circulars.",
  keywords: [
    "AKTU",
    "AKTU AI Chatbot",
    "B.Tech Syllabus",
    "AKTU Grace Marks",
    "AKTU Carry-over Papers",
    "OneView",
    "AKTU ERP",
    "Academic Calendar"
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} dark antialiased`}>
      <body className="min-h-screen bg-[#0b101b] text-slate-100 flex flex-col font-sans">
        {children}
      </body>
    </html>
  );
}
