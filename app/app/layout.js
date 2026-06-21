import Providers from "./providers";

export const metadata = {
  title: "z-dash",
  description: "Cohort dashboard",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
