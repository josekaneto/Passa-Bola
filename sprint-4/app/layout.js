import "./globals.css";
import "aos/dist/aos.css";
import AOSInit from './Components/AOSInit';

export const metadata = {
  title: "Passa a Bola",
  description: "Copa de Futebol Feminino",
  icons: {
    icon: {
        url: '/Logo.svg',
        type: 'image/svg+xml',
      }
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-br">
      <head>
        <link rel="icon" href="/Logo.svg" type="image/svg+xml" />
      </head>
      <body>
        <AOSInit />
        {children}
      </body>
    </html>
  );
}
