import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Task Board",
  description: "Quản lý công việc, phân chia task theo trạng thái",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="vi"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="relative min-h-full flex flex-col overflow-x-hidden bg-neutral-50 dark:bg-neutral-950">
        <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
          <div className="animate-blob absolute -top-32 -left-24 h-96 w-96 rounded-full bg-violet-300/40 blur-3xl dark:bg-violet-700/20" />
          <div className="animate-blob-slow absolute top-1/3 -right-24 h-96 w-96 rounded-full bg-fuchsia-300/30 blur-3xl dark:bg-fuchsia-700/15" />
          <div className="animate-blob absolute bottom-0 left-1/4 h-80 w-80 rounded-full bg-sky-300/30 blur-3xl dark:bg-sky-700/15" />
        </div>
        {children}
      </body>
    </html>
  );
}
