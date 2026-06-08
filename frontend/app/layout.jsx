import './globals.css';

export const metadata = {
  title: 'Smart Task Escalation Engine',
  description: 'Automated task escalation and manager notifications',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
