import Script from "next/script";
import "./globals.css";

export const metadata = {
  title: "Casino Manager",
  description: "Casino Manager",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body>
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="beforeInteractive"
        />
        {children}
      </body>
    </html>
  );
}
