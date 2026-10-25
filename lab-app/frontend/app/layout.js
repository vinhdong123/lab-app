import "./globals.css";

export const metadata = {
  title: "Lab Todo",
  description: "Next.js + FastAPI, container hóa với Docker",
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
