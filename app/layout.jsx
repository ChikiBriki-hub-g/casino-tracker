import Script from "next/script";
import "./globals.css";

export const metadata = {
    title: "Casino Tracker",
    description: "Casino Tracker",
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
