// app/api/generate/route.js
import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const TONE_STYLE_GUIDE = {
  direct: "Conserve la structure de base mais avec des phrases plus courtes, plus franches, plus droites au but. Pas de détour inutile.",
  consultif: "Conserve la structure de base mais ajoute une lecture métier ou un angle expert. Le ton doit être posé, crédible et utile.",
  curieux: "Conserve la structure de base mais ouvre davantage la porte à l'échange. Le ton doit être conversationnel, sincère et orienté question.",
  social_proof: "Conserve la structure de base mais mets davantage en avant des résultats, cas clients ou preuves sociales fournis. N'invente jamais un chiffre absent.",
  detendu: "Conserve la structure de base mais rends la formulation plus humaine, plus naturelle, légèrement plus orale, sans familiarité forcée."
};

const SYSTEM_PROMPT = `Tu es un expert en prospection B2B et en personnalisation de messages LinkedIn.
Ta mission : générer exactement 3 messages LinkedIn d'ouverture personnalisés pour chaque ton demandé.

IMPORTANT :
- Le prompt de base doit rester très proche des messages fournis par l'utilisateur
- Tu adaptes les formulations au prospect ET au ton demandé
- Tu ne changes jamais l'intention commerciale de base
- Tu ne crées pas un message radicalement différent du modèle : tu l'adaptes
- Tu n'ajoutes jamais un élément de contexte vendeur absent des données fournies

RÈGLES ABSOLUES :
- Ne jamais inventer une information absente
- Si une information manque, tu reformules sans l'inventer
- Retourner UNIQUEMENT un JSON strict et valide, rien d'autre
- Aucun markdown, aucune balise, aucun commentaire
- N'invente jamais des phrases comme "avec mon associé", "on vient de lancer", "on l'a déjà implanté", "plusieurs clients", "startup", "cas clients" si ce n'est pas explicitement fourni

UTILISATION DES POSTS LINKEDIN :
Évalue d'abord si un post est exploitable. Un post est exploitable UNIQUEMENT si au moins une condition est vraie :
- Le prospect parle d'un problème de croissance, d'acquisition client, de débordement ou de manque de temps
- Le prospect évoque sa vie de fondateur ou dirigeant d'agence
- Le prospect partage une réflexion sur la prospection, le business dev ou les clients

Si un post est exploitable :
- Le message LinkedIn d'ouverture DOIT commencer par une référence directe et spécifique à ce post
- Ne cite jamais le post mot pour mot
- N'utilise jamais "j'ai vu ton post" ou "j'ai vu votre post"
- Utilise plutôt des formulations comme "dans l'un de tes derniers posts tu parlais de...", "tu évoquais récemment...", "vous mentionniez il y a peu..."
- L'accroche doit créer un lien logique naturel et direct avec l'offre
- Le reste du message doit suivre la structure du message de base avec une transition fluide

Si aucun post n'est exploitable :
- Ignore complètement les posts
- Reviens au message de base sans ajouter de référence artificielle

RÈGLES DE PERSONNALISATION :
- Tu pars toujours des messages de base fournis
- Tu conserves le ton commercial, la structure et l'intention des messages de base
- Tu adaptes en priorité grâce à : poste > entreprise > industrie > keywords
- Tutoiement ou vouvoiement selon le profil :
  - fondateur startup, freelance, agence indépendante, petite structure entrepreneuriale : plutôt tu
  - dirigeant grand compte, direction corporate, doute : vous
- Si un prénom, rôle ou nom d'entreprise manque, reformule naturellement sans l'inventer

FORMULATIONS INTERDITES :
- "J'ai vu ton profil"
- "J'ai vu votre profil"
- "Je me permets de vous contacter"
- "Je me permets de revenir vers vous"
- "Votre parcours est inspirant"
- "Je pense que cela pourrait vous intéresser"
- "J'espère que tu vas bien"
- "J'espère que vous allez bien"
- "J'ai vu ton post"
- "J'ai vu votre post"

STYLE :
- Français naturel, professionnel mais pas rigide
- Pas robotique, pas survendeur
- Phrases courtes et directes
- Texte brut avec \\n uniquement
- Pas de tirets dans les messages, pas de formatage, pas d'emoji

CONTRAINTES :
- Chaque message doit faire maximum 350 caractères
- Pour chaque ton, génère exactement 3 messages différents
- Les 3 messages doivent rester proches du message de base avec des variations utiles d'angle ou de signal
- Si un post est exploitable, au moins 1 des 3 messages doit commencer par une référence claire à ce post
- Évite de répéter exactement la même accroche sur les 3 messages
- Si une promesse, une preuve sociale, un contexte fondateur ou une formulation n'est pas dans les données fournies par l'utilisateur, tu ne l'ajoutes pas

RECOMMANDATION :
Parmi tous les messages générés, choisis le meilleur.
Critères :
1. Personnalisation précise
2. Lien naturel entre le signal et l'offre
3. Clarté du CTA
4. Respect du style demandé sans s'éloigner du message de base

FORMAT DE SORTIE :
{
  "recommended": {
    "tone_id": "",
    "tone_name": "",
    "message_index": "0",
    "reason": ""
  },
  "tones": [
    {
      "tone_id": "",
      "tone_name": "",
      "messages": [
        {
          "text": "",
          "hook": "",
          "signal": ""
        },
        {
          "text": "",
          "hook": "",
          "signal": ""
        },
        {
          "text": "",
          "hook": "",
          "signal": ""
        }
      ]
    }
  ]
}`;

function asString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function parseIndex(value) {
  const parsed = Number.parseInt(asString(value), 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

function normalizeMessage(rawMessage = {}) {
  return {
    text: asString(rawMessage.text),
    hook: asString(rawMessage.hook),
    signal: asString(rawMessage.signal),
  };
}

function normalizeToneBundle(tone, rawTone = {}) {
  const rawMessages = Array.isArray(rawTone.messages) ? rawTone.messages : [];

  return {
    tone_id: asString(rawTone.tone_id) || tone.id,
    tone_name: asString(rawTone.tone_name) || tone.name,
    messages: Array.from({ length: 3 }, (_, index) => normalizeMessage(rawMessages[index] || {})),
  };
}

function normalizeResponse(parsed, tones) {
  const rawTones = Array.isArray(parsed?.tones) ? parsed.tones : [];

  const normalizedTones = tones.map((tone) => {
    const match =
      rawTones.find((item) => asString(item?.tone_id) === tone.id) ||
      rawTones.find((item) => asString(item?.tone_name) === tone.name) ||
      {};

    return normalizeToneBundle(tone, match);
  });

  const fallbackTone = normalizedTones[0] || { tone_id: "", tone_name: "" };
  const recommendedToneId = asString(parsed?.recommended?.tone_id);
  const recommendedTone =
    normalizedTones.find((tone) => tone.tone_id === recommendedToneId) || fallbackTone;

  return {
    recommended: {
      tone_id: recommendedTone.tone_id || "",
      tone_name: recommendedTone.tone_name || "",
      message_index: parseIndex(parsed?.recommended?.message_index),
      reason: asString(parsed?.recommended?.reason) || "Ce ton garde le meilleur équilibre entre personnalisation, clarté et fidélité au message de base.",
    },
    tones: normalizedTones,
  };
}

export async function POST(req) {
  try {
    const { profile, userInfo, tones } = await req.json();

    if (!profile || !userInfo || !tones || tones.length === 0) {
      return NextResponse.json({ error: "Données manquantes" }, { status: 400 });
    }

    if (!asString(userInfo.baseLinkedinMessage)) {
      return NextResponse.json({ error: "Le message LinkedIn de base est obligatoire" }, { status: 400 });
    }

    // Build the profile context string
    const postsContext = (profile.recentPosts || [])
      .map((p, i) => `- Post ${i + 1} : "${p.text?.slice(0, 500) || ""}" (${p.likes || 0} likes, ${p.comments || 0} commentaires, ${p.date || ""})`)
      .join("\n");

    const commentsContext = (profile.recentComments || [])
      .map((c, i) => `- Commentaire ${i + 1} : "${c}"`)
      .join("\n");

    const firstName = asString(profile.firstName);
    const role = asString(profile.headline);
    const company = asString(profile.company);
    const target = asString(userInfo.target);
    const valueProposition = asString(userInfo.valueProposition);
    const offer = asString(userInfo.offer);
    const linkedinBaseMessage = asString(userInfo.baseLinkedinMessage);

    const userPrompt = `Adapte les messages de base ci-dessous au prospect et aux tons demandés.

PROFIL PROSPECT (données Unipile) :
- firstName : ${firstName}
- lastName : ${asString(profile.lastName)}
- headline : ${role}
- company : ${company}
- location : ${asString(profile.location)}
- about : ${asString(profile.about).slice(0, 1200)}
${postsContext ? `- recentPosts :\n${postsContext}` : "- recentPosts : aucun"}
${commentsContext ? `- recentComments :\n${commentsContext}` : "- recentComments : aucun"}

CONTEXTE EXPÉDITEUR :
- name : ${asString(userInfo.name)}
- offer : ${offer}
- target : ${target}
- valueProposition : ${valueProposition}

MESSAGE DE BASE LINKEDIN FOURNI PAR L'UTILISATEUR (à adapter strictement) :
${linkedinBaseMessage}

TONS À PRODUIRE :
${tones.map((tone) => `- ${tone.id} (${tone.name}) : ${tone.tagline} | Consigne de style : ${TONE_STYLE_GUIDE[tone.id] || "Garde le style de base tout en respectant le ton demandé."}`).join("\n")}

Consigne finale :
- Produis exactement 3 messages d'ouverture LinkedIn par ton demandé
- Chaque ton doit garder la même ossature commerciale de base, avec une expression adaptée au style
- Si un post n'est pas exploitable, ignore-le complètement
- Les champs hook et signal doivent être courts, lisibles et utiles pour l'interface
- Adapte exclusivement à partir du message de base fourni et des données profil
- recommended.reason doit être court et concret`;

    const completion = await openai.chat.completions.create({
      model: "gpt-5.4-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      max_completion_tokens: 4000,
      temperature: 0.8,
    });

    const raw = completion.choices[0]?.message?.content || "";
    console.log("[generate] Model used:", completion.model);
    console.log("[generate] Raw OpenAI response:", raw);
    const clean = raw.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(clean);
    } catch (parseErr) {
      console.error("[generate] JSON parse failed. Raw content:", raw);
      return NextResponse.json(
        { error: "La réponse de l'IA n'est pas un JSON valide" },
        { status: 502 }
      );
    }

    return NextResponse.json(normalizeResponse(parsed, tones));
  } catch (err) {
    console.error("[generate] API error:", err);
    return NextResponse.json(
      { error: "Erreur lors de la génération des messages" },
      { status: 500 }
    );
  }
}
