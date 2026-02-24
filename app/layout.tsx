import type { Metadata } from "next";
import "./globals.css"; // Aapki css file ka path
import LoginPage from "./login/page";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <LoginPage />
        {children}
      </body>
    </html>
  );
}