"use client";
import { useState, useRef, useEffect } from "react";

// ─── Lidmeo brand colors ───
const C = {
  blue: "#2563EB",
  blueDark: "#1D4ED8",
  blueLight: "#3B82F6",
  bluePale: "#EFF6FF",
  blueBorder: "#BFDBFE",
  white: "#FFFFFF",
  bg: "#F8FAFC",
  text: "#0F172A",
  textMid: "#475569",
  textLight: "#94A3B8",
  border: "#E2E8F0",
  borderLight: "#F1F5F9",
  green: "#10B981",
  greenBg: "#ECFDF5",
};

// ─── Tone data with 6 concrete examples each (shown as previews) ───
const TONES = [
  {
    id: "direct",
    name: "Direct & Sans filtre",
    emoji: "🎯",
    tagline: "Droit au but. Pas de small talk. Vous dites ce que vous faites et pourquoi ça les concerne.",
    examples: [
      "Salut Marc,\n\nJ'ai vu le travail de WebFactory sur le SEO technique. Solide, surtout le case study pour Dumont Industrie.\n\nOn bosse avec des agences SEO comme la vôtre pour leur générer 3 à 5 RDV qualifiés par semaine via LinkedIn. En automatique.\n\nÇa vaut 15 min d'échange ?",
      "Bonjour Sophie,\n\nVotre agence fait du très bon travail côté branding. J'ai regardé vos dernières réalisations pour Maison Clément. Chapeau.\n\nOn aide les agences de votre taille à ajouter un canal d'acquisition prévisible via LinkedIn. Sans mobiliser d'équipe commerciale.\n\n15 min pour voir si ça fait sens pour BrandPulse ?",
      "Thomas,\n\nJ'ai vu votre post sur la difficulté de scaler une agence dev sans recruter de commercial.\n\nOn a accompagné 3 agences tech à Nantes sur ce sujet le mois dernier. Résultat : 47 rendez-vous qualifiés en 30 jours.\n\nVous voulez savoir comment ?",
      "Bonjour Julie,\n\nCréaStudio, 6 personnes, spécialisée en design UX. Beau positionnement.\n\nOn travaille avec des agences de votre profil pour automatiser leur acquisition LinkedIn. Le résultat : plus de temps sur les projets, moins sur la prospection.\n\nOn s'en parle ?",
      "Bonjour Romain,\n\nBeau parcours chez PixelWave. Le positionnement dev web + mobile à Toulouse est pertinent.\n\nOn aide des agences comme la vôtre à générer un flux régulier de prospects qualifiés via LinkedIn. Automatiquement.\n\n15 min pour vous montrer ?",
      "Bonjour Claire,\n\nDigitalForge a 4 ans et 7 collaborateurs. Belle croissance.\n\nOn accompagne des agences à ce stade pour ajouter LinkedIn comme canal d'acquisition structuré. En complément de ce qui marche déjà.\n\nÇa vous parle ?"
    ]
  },
  {
    id: "consultif",
    name: "Consultif & Expert",
    emoji: "🧠",
    tagline: "Vous apportez un insight sur leur situation avant de proposer quoi que ce soit.",
    examples: [
      "Bonjour Marc,\n\nEn regardant le positionnement de WebFactory, vous êtes très bien placés sur le SEO technique. C'est un créneau solide.\n\nOn accompagne plusieurs agences SEO pour ajouter LinkedIn comme canal d'acquisition. Les résultats sont intéressants.\n\nJe serais curieux de comprendre comment vous gérez votre acquisition aujourd'hui.",
      "Bonjour Sophie,\n\nJ'ai lu votre article sur les tendances branding 2026. Très pertinent, surtout la partie sur l'authenticité de marque.\n\nLes agences qui grandissent le plus vite en ce moment combinent leur expertise métier avec une présence active sur LinkedIn.\n\nVous avez exploré ce levier chez BrandPulse ?",
      "Thomas,\n\nVotre post sur le recrutement en agence tech a généré 67 commentaires. C'est un sujet qui résonne clairement.\n\nUn angle complémentaire qui revient souvent chez les agences dev qu'on accompagne : quand le flux de projets est prévisible, les décisions de recrutement deviennent plus sereines.\n\nComment vous gérez la prévisibilité de votre pipe aujourd'hui ?",
      "Bonjour Romain,\n\nPixelWave a un beau positionnement à Toulouse. J'ai regardé votre portfolio, c'est du travail propre.\n\nUne tendance qu'on observe : les agences dev qui ajoutent LinkedIn à leur mix d'acquisition voient leur pipe se stabiliser en 60 jours.\n\nC'est un sujet que vous avez exploré ?",
      "Bonjour Claire,\n\nDigitalForge est dans les agences les plus qualitatives que j'ai vues à Marseille. Vraiment.\n\nOn travaille avec des agences de votre calibre pour les aider à gagner en visibilité auprès des décideurs via LinkedIn.\n\nVous avez 15 min pour qu'on en parle ?",
      "Nicolas,\n\nVotre post sur les marges en agence est l'un des plus lucides que j'ai lu.\n\nUn angle complémentaire : dans les agences qu'on accompagne, le coût d'acquisition client représente entre 15% et 25% du CA du premier projet. Quand on l'optimise, les marges suivent.\n\nVous avez déjà creusé ce levier chez Synapse ?"
    ]
  },
  {
    id: "curieux",
    name: "Curieux & Conversationnel",
    emoji: "💬",
    tagline: "Vous ouvrez un dialogue sincère, pas un pitch. La curiosité crée la connexion.",
    examples: [
      "Bonjour Marc,\n\nVotre post sur le SEO technique vs contenu m'a fait réfléchir. Chez vos clients, c'est quoi le ratio idéal ?\n\nJe pose la question parce qu'on bosse avec plusieurs agences SEO et les avis divergent complètement.\n\nCurieux d'avoir votre perspective.",
      "Bonjour Sophie,\n\nJe suis tombé sur le rebranding de Maison Clément. Le travail sur la typographie est réussi.\n\nQuestion : comment vous trouvez ce type de clients ? Recommandation, inbound, prospection directe ?\n\nC'est un sujet qu'on creuse beaucoup avec les fondateurs d'agences en ce moment.",
      "Bonjour Julie,\n\nQuestion qui me taraude : en tant que fondatrice d'une agence UX de 6 personnes, c'est quoi votre plus gros casse-tête au quotidien ?\n\nLa production ? Le recrutement ? L'acquisition client ?\n\nJe pose la question à tous les fondateurs d'agences que je croise. Les réponses sont toujours surprenantes.",
      "Bonjour Pierre,\n\nVotre dernier projet WordPress pour la Maison des Artisans est très propre.\n\nQuestion : dans le marché WordPress actuel, comment vous vous positionnez face aux page builders no-code ?\n\nCurieux de votre stratégie.",
      "Bonjour Maxime,\n\nGrowthLab fait du growth pour des PME. J'imagine que vous mesurez tout chez vos clients.\n\nQuestion provocante : est-ce que vous mesurez aussi le ROI de votre propre acquisition client ?\n\nVrai ou faux chez vous ?",
      "Bonjour Camille,\n\nJe tombe sur votre profil et je vois : fondatrice, DA, gestion de projet. Beaucoup de casquettes chez StudioNova.\n\nC'est quoi la casquette que vous aimeriez enlever en premier ?\n\nJe pose souvent cette question aux fondateurs d'agences. La réponse c'est presque toujours la même."
    ]
  },
  {
    id: "social_proof",
    name: "Preuve Sociale & Résultats",
    emoji: "📊",
    tagline: "Des chiffres, des cas concrets, des résultats vérifiables. Laissez les données parler.",
    examples: [
      "Bonjour Marc,\n\nLe mois dernier, une agence SEO de 6 personnes à Lyon nous a contactés. En 30 jours on leur a généré 14 rendez-vous qualifiés.\n\nLeur fondateur m'a dit : \"On a plus de pipe qu'en 6 mois de bouche-à-oreille.\"\n\nVous voulez que je vous montre comment on a fait ?",
      "Bonjour Sophie,\n\nChiffre qui devrait vous intéresser : on a aidé 3 agences branding à générer en moyenne 47 rendez-vous qualifiés en 60 jours. Coût par RDV : 12€. Temps investi par le fondateur : 0.\n\nBrandPulse a le même profil.\n\nÇa vaut 15 min pour en parler ?",
      "Thomas,\n\nOn bosse avec une agence dev à Nantes qui avait le même problème que celui décrit dans votre post. Résultat après 3 mois :\n\n47 rendez-vous qualifiés\n8 clients signés\n0 commercial embauché\n\nVous voulez le même setup ?",
      "Bonjour Claire,\n\nDernière stat de ce matin : sur nos 15 clients agences, le taux de réponse moyen aux messages est de 34%. La moyenne du marché est à 4%.\n\nLa différence : on personnalise chaque message en analysant le profil LinkedIn du prospect.\n\nÇa changerait quoi pour DigitalForge d'avoir 34% de taux de réponse ?",
      "Bonjour Nicolas,\n\nNotre client à Bordeaux (agence web, 8 personnes) a réduit son coût d'acquisition client de 340€ à 89€ en passant sur notre système.\n\nSur 12 mois ça représente plus de 15 000€ d'économies. Et 3x plus de clients.\n\nVous voulez voir le détail ?",
      "Bonjour Émilie,\n\nUne agence content marketing nous a contactés en novembre. 100% de leurs clients venaient du bouche-à-oreille.\n\n4 mois plus tard : 60% des nouveaux clients viennent de LinkedIn. Pipeline rempli pour 3 mois.\n\nVous voulez la même chose ?"
    ]
  },
  {
    id: "detendu",
    name: "Détendu & Humain",
    emoji: "☕",
    tagline: "Comme si vous parliez à un futur pote entrepreneur. Authentique et sans filtre.",
    examples: [
      "Hey Marc,\n\nJe suis tombé sur votre post et votre analogie sur les balises meta m'a fait marrer. Tellement vrai.\n\nBref, je bosse dans la prospection LinkedIn pour les agences. Pas de pitch, juste curieux de savoir comment vous gérez ça chez WebFactory.\n\nUn café virtuel ça vous dit ?",
      "Bonjour Sophie,\n\nBon, je vais pas faire semblant qu'on se connaît. On se connaît pas.\n\nMais j'ai vu le travail de BrandPulse et c'est solide. Et je me suis dit que vous aviez peut-être le même problème que toutes les agences de votre taille : trop occupée à bien bosser pour trouver le prochain client.\n\nSi c'est le cas, on devrait parler. Sinon, bonne continuation !",
      "Bonjour Julie,\n\nJe vais être honnête : j'ai écrit et effacé ce message 3 fois.\n\nLa version corporate disait \"Je me permets de vous contacter car votre profil correspond à notre cible.\" Beurk.\n\nLa version vraie : j'aide des agences UX comme CréaStudio à trouver des clients sans y passer leurs soirées.\n\nVoilà. C'est dit.",
      "Bonjour Romain,\n\nPixelWave, Toulouse, dev web et mobile. J'ai stalké votre profil (pardon) et votre parcours est intéressant.\n\nJe bosse avec des agences dev pour automatiser leur acquisition LinkedIn. Curieux de savoir comment vous gérez ça côté PixelWave ?\n\nSi le sujet vous parle, on se fait un café virtuel.",
      "Bonjour Antoine,\n\nJe sais ce que vous pensez en voyant ce message : \"Encore un mec qui veut me vendre un truc.\"\n\nEt techniquement oui. Mais pas aujourd'hui.\n\nAujourd'hui je voulais juste vous demander : qu'est-ce qui marche le mieux pour trouver des clients quand on est une agence de 8 personnes en 2026 ?\n\nVotre retour m'intéresse sincèrement.",
      "Bonjour Émilie,\n\nContentLab fait du content marketing pour les SaaS. J'adore le positionnement.\n\nJe bosse avec des agences content pour automatiser leur prospection LinkedIn. Ça marche plutôt bien et je me suis dit que ça pourrait vous intéresser.\n\nSi le sujet vous parle, on échange 15 min. Sinon, bonne continuation !"
    ]
  }
];

function App() {
  const [step, setStep] = useState(0);
  const [selectedTones, setSelectedTones] = useState([]);
  const [previewTone, setPreviewTone] = useState(null);
  const [userInfo, setUserInfo] = useState({ name: "", offer: "", target: "", valueProposition: "" });
  const [profileUrl, setProfileUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [messages, setMessages] = useState([]);
  const [recommendation, setRecommendation] = useState(null);
  const [usageCount, setUsageCount] = useState(0);
  const [copied, setCopied] = useState(null);
  const [expandedMsg, setExpandedMsg] = useState(null);
  const [apiError, setApiError] = useState(null);
  const maxFree = 10;
  const topRef = useRef(null);

  useEffect(() => {
    if (topRef.current) topRef.current.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  const toggleTone = (id) => {
    setSelectedTones(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : prev.length < 3 ? [...prev, id] : prev
    );
  };

  const DEMO_FALLBACK = (selectedToneDetails, name) => selectedToneDetails.map(t => ({
    tone_id: t.id,
    tone_name: t.name,
    messages: [
      { text: `Bonjour Thomas,\n\nVotre post sur l'acquisition en agence dev a touché juste. Belle réflexion.\n\n${name || "Chez nous"}, on accompagne des agences de votre profil pour structurer leur acquisition LinkedIn. Les résultats sont encourageants.\n\nVous avez 15 min pour qu'on en parle ?`, hook: "Rebond sur un post récent", signal: "Post LinkedIn" },
      { text: `Bonjour Émilie,\n\nContentLab se positionne sur le content marketing SaaS. Solide positionnement.\n\nOn travaille avec des agences de votre profil pour ajouter LinkedIn comme canal d'acquisition. En moyenne : 4 RDV qualifiés par semaine.\n\nÇa vous intéresse ?`, hook: "Valorisation positionnement + résultat", signal: "Positionnement niche" },
      { text: `Bonjour Marc,\n\nLe travail de WebFactory en SEO technique est impressionnant. J'ai regardé votre portfolio.\n\nOn aide des agences SEO à développer leur acquisition via LinkedIn. Les retours sont très positifs.\n\n15 min pour en parler ?`, hook: "Compliment portfolio + proposition", signal: "Expertise technique visible" }
    ]
  }));

  const generateMessages = async (demoMode = false) => {
    if (usageCount >= maxFree) return;
    setLoading(true);
    setApiError(null);
    setStep(3);

    const selectedToneDetails = TONES.filter(t => selectedTones.includes(t.id));

    if (demoMode) {
      await new Promise(r => setTimeout(r, 1200));
      setRecommendation({
        tone_id: selectedToneDetails[0]?.id || "direct",
        tone_name: selectedToneDetails[0]?.name || "Direct",
        message_index: 0,
        reason: "Ce message combine une valorisation sincère du travail du prospect avec une proposition d'échange d'égal à égal. Le ton est respectueux et le CTA est naturel."
      });
      setMessages(DEMO_FALLBACK(selectedToneDetails, userInfo.name));
      setUsageCount(prev => prev + 1);
      setLoading(false);
      return;
    }

    try {
      // Step 1: Fetch profile via Unipile
      setLoadingStep("Connexion à LinkedIn via Unipile...");
      const profileRes = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileUrl }),
      });

      if (!profileRes.ok) {
        const errData = await profileRes.json().catch(() => ({}));
        throw new Error(errData.error || "Impossible d'analyser ce profil LinkedIn.");
      }
      const profile = await profileRes.json();

      setLoadingStep("Analyse du profil, des posts et commentaires...");
      await new Promise(r => setTimeout(r, 800));

      // Step 2: Generate messages via GPT-5.4-mini
      setLoadingStep("Génération des messages personnalisés...");
      const genRes = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile,
          userInfo,
          tones: selectedToneDetails.map(t => ({
            id: t.id,
            name: t.name,
            tagline: t.tagline,
          })),
        }),
      });

      if (!genRes.ok) {
        const errData = await genRes.json().catch(() => ({}));
        throw new Error(errData.error || "Erreur lors de la génération des messages.");
      }
      const data = await genRes.json();

      setRecommendation(data.recommended || null);
      setMessages(data.tones || []);
      setUsageCount(prev => prev + 1);
    } catch (err) {
      console.error(err);
      setApiError(err.message || "Une erreur inattendue s'est produite.");
      setMessages([]);
      setRecommendation(null);
    }

    setLoading(false);
  };

  const copyMessage = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  // ─── Styles ───
  const S = {
    outer: {
      fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif",
      background: C.white,
      color: C.text,
      minHeight: "100vh",
      maxHeight: "100vh",
      overflow: "auto",
      display: "flex",
      flexDirection: "column"
    },
    nav: {
      padding: "16px 24px",
      borderBottom: `1px solid ${C.border}`,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      background: C.white,
      position: "sticky",
      top: 0,
      zIndex: 10
    },
    logo: {
      fontSize: 18,
      fontWeight: 800,
      color: C.blue,
      letterSpacing: "-0.02em"
    },
    stepBadge: {
      fontSize: 12,
      fontWeight: 600,
      color: C.blue,
      background: C.bluePale,
      padding: "4px 12px",
      borderRadius: 20
    },
    main: { flex: 1, padding: "28px 24px 100px", maxWidth: 680, margin: "0 auto", width: "100%", boxSizing: "border-box" },
    h1: {
      fontSize: 24,
      fontWeight: 800,
      color: C.text,
      letterSpacing: "-0.02em",
      margin: "0 0 6px",
      lineHeight: 1.2
    },
    sub: { fontSize: 14, color: C.textMid, margin: "0 0 28px", lineHeight: 1.5 },
    steps: {
      display: "flex",
      gap: 6,
      marginBottom: 28
    },
    stepDot: (active, done) => ({
      flex: 1,
      height: 3,
      borderRadius: 2,
      background: done ? C.blue : active ? C.blue : C.border,
      opacity: active ? 1 : done ? 0.5 : 0.3
    }),
    // Tone cards
    toneCard: (selected) => ({
      border: `2px solid ${selected ? C.blue : C.border}`,
      borderRadius: 14,
      padding: 0,
      marginBottom: 12,
      overflow: "hidden",
      background: selected ? C.bluePale : C.white,
      cursor: "pointer",
      transition: "all 0.2s"
    }),
    toneTop: {
      padding: "16px 18px",
      display: "flex",
      alignItems: "center",
      gap: 14
    },
    toneCheck: (selected) => ({
      width: 22,
      height: 22,
      borderRadius: 6,
      border: `2px solid ${selected ? C.blue : C.border}`,
      background: selected ? C.blue : "transparent",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: C.white,
      fontSize: 13,
      fontWeight: 700,
      flexShrink: 0,
      transition: "all 0.2s"
    }),
    toneName: { fontSize: 15, fontWeight: 700, color: C.text, margin: 0 },
    toneTagline: { fontSize: 13, color: C.textMid, margin: "2px 0 0", lineHeight: 1.4 },
    previewBtn: (show) => ({
      fontSize: 12,
      fontWeight: 600,
      color: C.blue,
      background: "none",
      border: "none",
      cursor: "pointer",
      padding: "4px 0",
      fontFamily: "inherit",
      marginTop: 4,
      display: "inline-block"
    }),
    previewArea: {
      borderTop: `1px solid ${C.border}`,
      padding: "14px 18px",
      background: C.bg
    },
    previewMsg: {
      fontSize: 12,
      color: C.textMid,
      lineHeight: 1.6,
      whiteSpace: "pre-wrap",
      background: C.white,
      border: `1px solid ${C.border}`,
      borderRadius: 10,
      padding: "12px 14px",
      marginBottom: 8
    },
    // Inputs
    label: { fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 6, display: "block" },
    input: {
      width: "100%",
      padding: "12px 14px",
      border: `1.5px solid ${C.border}`,
      borderRadius: 10,
      fontSize: 14,
      fontFamily: "inherit",
      outline: "none",
      background: C.white,
      color: C.text,
      boxSizing: "border-box",
      marginBottom: 18,
      transition: "border-color 0.2s"
    },
    textarea: {
      width: "100%",
      padding: "12px 14px",
      border: `1.5px solid ${C.border}`,
      borderRadius: 10,
      fontSize: 14,
      fontFamily: "inherit",
      outline: "none",
      background: C.white,
      color: C.text,
      minHeight: 80,
      resize: "vertical",
      boxSizing: "border-box",
      marginBottom: 18,
      lineHeight: 1.5
    },
    // Buttons
    btnPrimary: (disabled) => ({
      width: "100%",
      padding: "14px 24px",
      borderRadius: 10,
      border: "none",
      fontSize: 15,
      fontWeight: 700,
      fontFamily: "inherit",
      cursor: disabled ? "default" : "pointer",
      background: disabled ? C.border : C.blue,
      color: disabled ? C.textLight : C.white,
      transition: "all 0.2s"
    }),
    btnSecondary: {
      padding: "12px 20px",
      borderRadius: 10,
      border: `1.5px solid ${C.border}`,
      background: C.white,
      color: C.textMid,
      fontSize: 14,
      fontWeight: 600,
      cursor: "pointer",
      fontFamily: "inherit"
    },
    btnRow: { display: "flex", gap: 10, marginTop: 8 },
    // Results
    resultCard: {
      background: C.white,
      border: `1px solid ${C.border}`,
      borderRadius: 14,
      marginBottom: 10,
      overflow: "hidden"
    },
    resultHeader: {
      padding: "14px 16px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      cursor: "pointer"
    },
    resultHook: { fontSize: 13, fontWeight: 600, color: C.text, flex: 1 },
    resultBadge: {
      fontSize: 11,
      fontWeight: 600,
      color: C.blue,
      background: C.bluePale,
      padding: "3px 8px",
      borderRadius: 6,
      marginRight: 10,
      flexShrink: 0
    },
    resultBody: {
      padding: "0 16px 16px",
      fontSize: 14,
      lineHeight: 1.7,
      color: C.text,
      whiteSpace: "pre-wrap"
    },
    signalTag: {
      fontSize: 11,
      color: C.textLight,
      background: C.bg,
      padding: "4px 10px",
      borderRadius: 6,
      display: "inline-block",
      marginTop: 10
    },
    copyBtn: (isCopied) => ({
      padding: "8px 16px",
      borderRadius: 8,
      border: `1.5px solid ${isCopied ? C.green : C.border}`,
      background: isCopied ? C.greenBg : C.white,
      color: isCopied ? C.green : C.textMid,
      fontSize: 12,
      fontWeight: 600,
      cursor: "pointer",
      fontFamily: "inherit",
      marginTop: 12
    }),
    // Loading
    loadWrap: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 300, gap: 16 },
    spinner: { width: 36, height: 36, border: `3px solid ${C.border}`, borderTop: `3px solid ${C.blue}`, borderRadius: "50%", animation: "lidmeo-spin 0.8s linear infinite" },
    // Usage bar
    usageBar: {
      background: C.bluePale,
      border: `1px solid ${C.blueBorder}`,
      borderRadius: 10,
      padding: "12px 16px",
      marginBottom: 24,
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    },
    // Profile card in results
    profileCard: {
      background: C.bluePale,
      border: `1px solid ${C.blueBorder}`,
      borderRadius: 14,
      padding: "16px 18px",
      marginBottom: 20
    },
    // Tone section header in results
    toneSection: {
      fontSize: 15,
      fontWeight: 700,
      color: C.blue,
      padding: "18px 0 10px",
      borderBottom: `1px solid ${C.border}`,
      marginBottom: 12,
      display: "flex",
      alignItems: "center",
      gap: 8
    },
    footer: {
      padding: "14px 24px",
      borderTop: `1px solid ${C.border}`,
      textAlign: "center",
      background: C.white
    },
    footerText: { fontSize: 11, color: C.textLight },
    footerLink: { color: C.blue, textDecoration: "none", fontWeight: 600 }
  };

  // ─── STEP 0: Tone Selection ───
  const renderStep0 = () => (
    <div>
      <p style={S.sub}>
        Choisissez 1 à 3 styles de messages. L'IA générera des messages personnalisés dans chaque style choisi.
      </p>
      {TONES.map(tone => {
        const selected = selectedTones.includes(tone.id);
        const showPreview = previewTone === tone.id;
        return (
          <div key={tone.id} style={S.toneCard(selected)}>
            <div style={S.toneTop} onClick={() => toggleTone(tone.id)}>
              <div style={S.toneCheck(selected)}>{selected ? "✓" : ""}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 18 }}>{tone.emoji}</span>
                  <p style={S.toneName}>{tone.name}</p>
                </div>
                <p style={S.toneTagline}>{tone.tagline}</p>
                <button
                  style={S.previewBtn()}
                  onClick={e => { e.stopPropagation(); setPreviewTone(showPreview ? null : tone.id); }}
                >
                  {showPreview ? "Masquer les exemples ↑" : "Voir des exemples ↓"}
                </button>
              </div>
            </div>
            {showPreview && (
              <div style={S.previewArea}>
                {tone.examples.slice(0, 3).map((ex, i) => (
                  <div key={i} style={S.previewMsg}>{ex}</div>
                ))}
                <p style={{ fontSize: 11, color: C.textLight, margin: "8px 0 0", textAlign: "center" }}>
                  +{tone.examples.length - 3} autres exemples dans ce style
                </p>
              </div>
            )}
          </div>
        );
      })}
      <button
        style={S.btnPrimary(selectedTones.length === 0)}
        disabled={selectedTones.length === 0}
        onClick={() => setStep(1)}
      >
        Continuer avec {selectedTones.length} style{selectedTones.length > 1 ? "s" : ""} →
      </button>
    </div>
  );

  // ─── STEP 1: User Info ───
  const renderStep1 = () => {
    const ok = userInfo.offer.trim() && userInfo.target.trim() && userInfo.valueProposition.trim();
    return (
      <div>
        <p style={S.sub}>Ces infos sont saisies une seule fois. Elles servent à personnaliser tous vos messages.</p>
        <label style={S.label}>Votre prénom</label>
        <input style={S.input} placeholder="Ex : Lilian" value={userInfo.name}
          onChange={e => setUserInfo(p => ({ ...p, name: e.target.value }))}
          onFocus={e => e.target.style.borderColor = C.blue} onBlur={e => e.target.style.borderColor = C.border} />

        <label style={S.label}>Que vendez-vous ?</label>
        <textarea style={S.textarea} placeholder="Ex : On automatise la prospection LinkedIn pour les agences digitales. Le client n'a rien à faire, on lui livre des RDV qualifiés." value={userInfo.offer}
          onChange={e => setUserInfo(p => ({ ...p, offer: e.target.value }))}
          onFocus={e => e.target.style.borderColor = C.blue} onBlur={e => e.target.style.borderColor = C.border} />

        <label style={S.label}>Qui est votre cible ?</label>
        <input style={S.input} placeholder="Ex : Fondateurs d'agences digitales de 3 à 12 personnes" value={userInfo.target}
          onChange={e => setUserInfo(p => ({ ...p, target: e.target.value }))}
          onFocus={e => e.target.style.borderColor = C.blue} onBlur={e => e.target.style.borderColor = C.border} />

        <label style={S.label}>Votre proposition de valeur en une phrase</label>
        <input style={S.input} placeholder="Ex : 3 à 5 rendez-vous qualifiés par semaine, sans embaucher de commercial" value={userInfo.valueProposition}
          onChange={e => setUserInfo(p => ({ ...p, valueProposition: e.target.value }))}
          onFocus={e => e.target.style.borderColor = C.blue} onBlur={e => e.target.style.borderColor = C.border} />

        <div style={S.btnRow}>
          <button style={S.btnSecondary} onClick={() => setStep(0)}>← Retour</button>
          <button style={{ ...S.btnPrimary(!ok), flex: 1 }} disabled={!ok} onClick={() => setStep(2)}>
            Continuer →
          </button>
        </div>
      </div>
    );
  };

  // ─── STEP 2: Profile URL ───
  const renderStep2 = () => (
    <div>
      <div style={S.usageBar}>
        <span style={{ fontSize: 13, fontWeight: 600, color: C.blue }}>
          {usageCount}/{maxFree} profils analysés
        </span>
        <span style={{ fontSize: 12, color: C.textLight }}>{maxFree - usageCount} restants</span>
      </div>

      <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 14, padding: 28, textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🔗</div>
        <p style={{ fontSize: 16, fontWeight: 700, margin: "0 0 4px", color: C.text }}>
          Collez l'URL LinkedIn du prospect
        </p>
        <p style={{ fontSize: 13, color: C.textLight, margin: "0 0 20px" }}>
          On analyse le profil complet, les posts récents et les commentaires via Unipile.
        </p>
        <input style={{ ...S.input, textAlign: "center" }}
          placeholder="https://www.linkedin.com/in/nom-du-prospect/"
          value={profileUrl}
          onChange={e => setProfileUrl(e.target.value)}
          onFocus={e => e.target.style.borderColor = C.blue} onBlur={e => e.target.style.borderColor = C.border} />
        <button
          style={S.btnPrimary(!profileUrl.includes("linkedin.com") || usageCount >= maxFree)}
          disabled={!profileUrl.includes("linkedin.com") || usageCount >= maxFree}
          onClick={() => generateMessages(false)}
        >
          Analyser & générer les messages
        </button>
        <button
          style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: C.textLight, marginTop: 12, fontFamily: "inherit", textDecoration: "underline" }}
          onClick={() => generateMessages(true)}
        >
          Tester avec un profil démo
        </button>
      </div>

      {usageCount > 0 && (
        <p style={{ fontSize: 12, color: C.textLight, textAlign: "center", marginTop: 16 }}>
          Votre offre est sauvegardée.{" "}
          <span style={{ color: C.blue, cursor: "pointer", fontWeight: 600 }} onClick={() => setStep(1)}>Modifier</span>
        </p>
      )}
      <div style={{ ...S.btnRow, marginTop: 16 }}>
        <button style={S.btnSecondary} onClick={() => setStep(1)}>← Retour</button>
      </div>
    </div>
  );

  // ─── STEP 3: Results ───
  const renderStep3 = () => {
    const recoMsg = recommendation && messages.length > 0
      ? (() => {
          const tg = messages.find(t => t.tone_id === recommendation.tone_id);
          if (!tg || !tg.messages) return null;
          const m = tg.messages[recommendation.message_index];
          return m ? { ...m, tone_name: recommendation.tone_name, tone_id: recommendation.tone_id } : null;
        })()
      : null;

    if (apiError) {
      return (
        <div>
          <div style={{ background: "#FEF2F2", border: "1.5px solid #FECACA", borderRadius: 14, padding: "24px 20px", textAlign: "center", marginBottom: 24 }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>⚠️</div>
            <p style={{ fontSize: 15, fontWeight: 700, color: "#991B1B", margin: "0 0 6px" }}>
              Impossible d'analyser ce profil
            </p>
            <p style={{ fontSize: 13, color: "#B91C1C", margin: "0 0 16px", lineHeight: 1.5 }}>
              {apiError}
            </p>
            <p style={{ fontSize: 12, color: "#DC2626", margin: 0 }}>
              Vérifiez l'URL et réessayez, ou testez avec un profil démo.
            </p>
          </div>
          <div style={S.btnRow}>
            <button style={S.btnSecondary} onClick={() => { setApiError(null); setStep(2); }}>
              ← Réessayer
            </button>
            <button style={{ ...S.btnPrimary(false), flex: 1 }} onClick={() => { setApiError(null); generateMessages(true); }}>
              Tester avec un profil démo
            </button>
          </div>
        </div>
      );
    }

    return (
      <div>
        <p style={S.sub}>
          {messages.length > 0
            ? `${messages.reduce((a, t) => a + (t.messages?.length || 0), 0)} messages générés dans ${messages.length} style${messages.length > 1 ? "s" : ""}`
            : "Génération en cours..."}
        </p>

        {messages.map((toneGroup, tIdx) => {
          const tone = TONES.find(t => t.id === toneGroup.tone_id);
          return (
            <div key={tIdx}>
              <div style={S.toneSection}>
                <span style={{ fontSize: 18 }}>{tone?.emoji}</span>
                {toneGroup.tone_name}
              </div>
              {(toneGroup.messages || []).map((msg, mIdx) => {
                const key = `${tIdx}-${mIdx}`;
                const isOpen = expandedMsg === key;
                const isReco = recommendation && toneGroup.tone_id === recommendation.tone_id && mIdx === recommendation.message_index;
                return (
                  <div key={key} style={{
                    ...S.resultCard,
                    ...(isReco ? { borderColor: C.blue, background: C.bluePale } : {})
                  }}>
                    <div style={S.resultHeader} onClick={() => setExpandedMsg(isOpen ? null : key)}>
                      {isReco ? (
                        <span style={{
                          fontSize: 11, fontWeight: 700, color: C.white, background: C.blue,
                          padding: "3px 8px", borderRadius: 6, marginRight: 10, flexShrink: 0
                        }}>⭐ RECO</span>
                      ) : (
                        <span style={S.resultBadge}>#{mIdx + 1}</span>
                      )}
                      <span style={S.resultHook}>{msg.hook}</span>
                      <div style={{
                        width: 22, height: 22, borderRadius: 11,
                        background: isOpen ? C.bluePale : C.bg,
                        color: isOpen ? C.blue : C.textLight,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 13, fontWeight: 700, flexShrink: 0
                      }}>{isOpen ? "−" : "+"}</div>
                    </div>
                    {isOpen && (
                      <div style={S.resultBody}>
                        {msg.text}
                        {msg.signal && <div style={S.signalTag}>Signal : {msg.signal}</div>}
                        <div>
                          <button style={S.copyBtn(copied === key)}
                            onClick={e => { e.stopPropagation(); copyMessage(msg.text, key); }}
                          >{copied === key ? "✓ Copié" : "Copier le message"}</button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}

        {recoMsg && messages.length > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 28, marginBottom: 20 }}>
            <div style={{ flex: 1, height: 1, background: C.border }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: C.textLight, whiteSpace: "nowrap" }}>Notre recommandation</span>
            <div style={{ flex: 1, height: 1, background: C.border }} />
          </div>
        )}

        {recoMsg && (
          <div style={{
            background: `linear-gradient(135deg, ${C.bluePale} 0%, #DBEAFE 100%)`,
            border: `2px solid ${C.blue}`,
            borderRadius: 16,
            marginBottom: 24,
            overflow: "hidden"
          }}>
            <div style={{
              background: C.blue,
              padding: "12px 18px",
              display: "flex",
              alignItems: "center",
              gap: 10
            }}>
              <span style={{ fontSize: 18 }}>⭐</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: C.white }}>Recommandation Lidmeo</div>
                <div style={{ fontSize: 11, color: "#BFDBFE", marginTop: 1 }}>Le message avec le meilleur potentiel de réponse pour ce prospect</div>
              </div>
              <div style={{
                background: "#FFFFFF20",
                borderRadius: 8,
                padding: "4px 10px",
                fontSize: 11,
                fontWeight: 700,
                color: C.white
              }}>{recoMsg.tone_name}</div>
            </div>
            <div style={{ padding: "18px 20px", fontSize: 14, lineHeight: 1.75, color: C.text, whiteSpace: "pre-wrap" }}>
              {recoMsg.text}
            </div>
            <div style={{ padding: "0 20px 18px", display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ background: C.white, borderRadius: 10, padding: "10px 14px", display: "flex", gap: 10, alignItems: "flex-start" }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: C.blue, background: C.bluePale, padding: "2px 8px", borderRadius: 4, flexShrink: 0, marginTop: 1 }}>POURQUOI</span>
                <span style={{ fontSize: 12, color: C.textMid, lineHeight: 1.5 }}>{recommendation.reason}</span>
              </div>
              {recoMsg.signal && (
                <div style={{ fontSize: 11, color: C.textLight, display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ color: C.blue }}>●</span> Signal utilisé : {recoMsg.signal}
                </div>
              )}
              <button
                style={{
                  padding: "12px 20px", borderRadius: 10,
                  border: `2px solid ${copied === "reco" ? C.green : C.blue}`,
                  background: copied === "reco" ? C.greenBg : C.white,
                  color: copied === "reco" ? C.green : C.blue,
                  fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                  transition: "all 0.2s", width: "100%"
                }}
                onClick={() => copyMessage(recoMsg.text, "reco")}
              >{copied === "reco" ? "✓ Message copié" : "Copier ce message"}</button>
            </div>
          </div>
        )}

        <div style={{ ...S.btnRow, marginTop: 20 }}>
          <button style={S.btnSecondary} onClick={() => { setMessages([]); setRecommendation(null); setProfileUrl(""); setExpandedMsg(null); setStep(2); }}>
            ← Nouveau profil
          </button>
          {usageCount >= maxFree && (
            <a href="https://lidmeo.com" target="_blank" rel="noopener noreferrer"
              style={{ ...S.btnPrimary(false), flex: 1, textDecoration: "none", textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center" }}>
              Passer à Lidmeo →
            </a>
          )}
        </div>
      </div>
    );
  };

  // ─── Loading ───
  const renderLoading = () => (
    <div style={S.loadWrap}>
      <style>{`@keyframes lidmeo-spin { to { transform: rotate(360deg) } }`}</style>
      <div style={S.spinner} />
      <p style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{loadingStep}</p>
      <p style={{ fontSize: 12, color: C.textLight }}>Environ 15 secondes</p>
    </div>
  );

  const titles = [
    "Choisissez vos styles de messages",
    "Parlez-nous de votre offre",
    "Analysez un profil LinkedIn",
    "Vos messages personnalisés"
  ];

  return (
    <div style={S.outer} ref={topRef}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      <div style={S.nav}>
        <span style={S.logo}>Lidmeo</span>
        <span style={S.stepBadge}>Étape {step + 1}/4</span>
      </div>

      <div style={S.main}>
        <div style={S.steps}>
          {[0, 1, 2, 3].map(i => <div key={i} style={S.stepDot(step === i, i < step)} />)}
        </div>

        <h1 style={S.h1}>{titles[step]}</h1>

        {loading ? renderLoading() :
          step === 0 ? renderStep0() :
          step === 1 ? renderStep1() :
          step === 2 ? renderStep2() :
          renderStep3()}
      </div>

      <div style={S.footer}>
        <p style={S.footerText}>
          Propulsé par <a href="https://lidmeo.com" target="_blank" rel="noopener noreferrer" style={S.footerLink}>Lidmeo</a> — Prospection LinkedIn automatisée pour les agences
        </p>
      </div>
    </div>
  );
}

export default App;
