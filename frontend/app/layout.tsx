// app/layout.tsx
import { GeistSans } from "geist/font/sans"; 
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/next";
import { Toaster } from 'react-hot-toast'; 
import "./globals.css";
import { Providers } from "../src/contexts/Providers";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Providers>
          {children}
          <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#333",
              color: "#fff",
              zIndex: 99999,
            },
          }}
        />
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}