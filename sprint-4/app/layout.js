'use client';

import "./globals.css";
import AOS from "aos";
import "aos/dist/aos.css";
import { useEffect } from "react";
import { WebSocketProvider } from "./Components/WebSocketProvider";

export default function RootLayout({ children }) {

    useEffect(() => {
      AOS.init({ once: true });
    }, []);

  return (
    <html lang="pt-br">
    <head>
      <title>Passa Bola</title>
      <meta charSet="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <link rel="icon" href="/logo.svg" />
    </head>
    <body className="overflow-hidden">
        <WebSocketProvider>
          {children}
        </WebSocketProvider>
      </body>
    </html>
  );
}
