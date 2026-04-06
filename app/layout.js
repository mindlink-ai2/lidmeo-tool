// app/layout.js
export const metadata = {
  title: "Générateur de messages LinkedIn | Lidmeo",
  description:
    "Générez des messages de prospection LinkedIn personnalisés et ultra-ciblés. Gratuit pour 10 profils.",
  openGraph: {
    title: "Générateur de messages LinkedIn | Lidmeo",
    description:
      "Collez un profil LinkedIn → recevez des messages personnalisés prêts à envoyer.",
    url: "https://tool.lidmeo.com",
    siteName: "Lidmeo",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <style>{`
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'DM Sans', system-ui, sans-serif; background: #F8FAFC; }
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  );
}
