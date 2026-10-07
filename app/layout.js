import "./globals.css";
import SessionProviderWrapper from "../components/SessionProviderWrapper.jsx";

export const metadata = {
  title: "Module 11 — App Router",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <SessionProviderWrapper>{children}</SessionProviderWrapper>
      </body>
    </html>
  );
}
