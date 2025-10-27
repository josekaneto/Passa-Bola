'use client';

import "./globals.css";
import AOS from "aos";
import "aos/dist/aos.css";
import { useEffect } from "react";

export default function RootLayout({ children }) {

    useEffect(() => {
      AOS.init({ once: true });
    }, []);

  return (
    <html lang="pt-br">
    <body className="overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
