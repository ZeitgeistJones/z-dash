export const metadata = {
  title: "z-dash",
  description: "Cohort dashboard",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
