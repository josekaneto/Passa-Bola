import "./globals.css";
import "aos/dist/aos.css";
import AOSInit from './Components/AOSInit';

export const metadata = {
  title: "Passa a Bola",
  description: "Copa de Futebol Feminino",
  icons: {
    icon: [
      {
        url: '/logo.ico',
        sizes: 'any',
      },
      {
        url: '/logo.svg',
        type: 'image/svg+xml',
      }
    ],
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-br">
      <head>
        <link rel="icon" href="/logo.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="overflow-hidden">
        <AOSInit />
        {children}
      </body>
    </html>
  );
}
