import type { Metadata } from "next";
import { Press_Start_2P, VT323 } from "next/font/google";
import "./globals.css";

// Step 10.2 — one chunky display font for headings/HUD labels, one
// readable-but-still-pixel font for body copy and buttons. Exposed as CSS
// variables (globals.css wires them to --font-display / --font-pixel) so
// every component can reach them via the font-display / font-pixel
// Tailwind utilities instead of importing fonts themselves.
const displayFont = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-press-start",
  display: "swap",
});

const pixelFont = VT323({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-vt323",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Campus Compass",
  description: "Interactive campus map for Arcadia University",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${displayFont.variable} ${pixelFont.variable}`}>
      <body>{children}</body>
    </html>
  );
}
