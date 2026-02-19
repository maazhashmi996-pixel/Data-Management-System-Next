import type { Metadata } from "next";
import "./globals.css"; // Aapki css file ka path

export const metadata: Metadata = {
  title: "Data Management System",
  description: "Student Enrollment Portal",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}