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
Ta mission : générer, pour chaque ton demandé, un pack complet de prospection composé de :
- 1 message LinkedIn d'ouverture
- 1 relance LinkedIn
- 1 email
- 1 résumé commercial du prospect
- 5 champs de contexte profil

IMPORTANT :
- Le prompt de base doit rester très proche des messages fournis par l'utilisateur
- Tu adaptes les formulations au prospect ET au ton demandé
- Tu ne changes jamais l'intention commerciale de base
- Tu ne crées pas un message radicalement différent du modèle : tu l'adaptes

RÈGLES ABSOLUES :
- Ne jamais inventer une information absente
- Si une information structurée manque pour un champ dédié, retourne ""
- Toutes les valeurs JSON doivent être des chaînes de caractères
- Retourner UNIQUEMENT un JSON strict et valide, rien d'autre
- Aucun markdown, aucune balise, aucun commentaire

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

CONTRAINTES PAR CHAMP :
- internal_message : max 350 caractères
- relance_linkedin : max 200 caractères
- message_mail : entre 500 et 1200 caractères, sujet inclus dans la chaîne si pertinent
- resume_profil : résumé stratégique commercial en 2 à 4 phrases

RECOMMANDATION :
Parmi les tons générés, choisis celui dont l'internal_message a le plus de chances d'obtenir une réponse.
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
    "reason": ""
  },
  "tones": [
    {
      "tone_id": "",
      "tone_name": "",
      "internal_message": "",
      "relance_linkedin": "",
      "message_mail": "",
      "resume_profil": "",
      "linkedinHeadline": "",
      "linkedinJobTitle": "",
      "companyIndustry": "",
      "linkedinDescription": "",
      "linkedinSkillsLabel": ""
    }
  ]
}`;

function asString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeToneBundle(tone, rawTone = {}) {
  return {
    tone_id: asString(rawTone.tone_id) || tone.id,
    tone_name: asString(rawTone.tone_name) || tone.name,
    internal_message: asString(rawTone.internal_message),
    relance_linkedin: asString(rawTone.relance_linkedin),
    message_mail: asString(rawTone.message_mail),
    resume_profil: asString(rawTone.resume_profil),
    linkedinHeadline: asString(rawTone.linkedinHeadline),
    linkedinJobTitle: asString(rawTone.linkedinJobTitle),
    companyIndustry: asString(rawTone.companyIndustry),
    linkedinDescription: asString(rawTone.linkedinDescription),
    linkedinSkillsLabel: asString(rawTone.linkedinSkillsLabel),
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

    // Build the profile context string
    const postsContext = (profile.recentPosts || [])
      .map((p, i) => `- Post ${i + 1} : "${p.text?.slice(0, 500) || ""}" (${p.likes || 0} likes, ${p.comments || 0} commentaires, ${p.date || ""})`)
      .join("\n");

    const commentsContext = (profile.recentComments || [])
      .map((c, i) => `- Commentaire ${i + 1} : "${c}"`)
      .join("\n");

    const contactName = asString(userInfo.name) || "Lilian";
    const firstName = asString(profile.firstName);
    const role = asString(profile.headline);
    const company = asString(profile.company);
    const target = asString(userInfo.target);
    const valueProposition = asString(userInfo.valueProposition);
    const offer = asString(userInfo.offer);
    const structureContext = company ? `une structure comme ${company}` : "une structure de services B2B";
    const roleCompanyLine = role && company
      ? `Au vu de ton rôle de ${role} chez ${company}, je me suis dit que ça pouvait clairement faire sens pour ${valueProposition}.`
      : role
        ? `Au vu de ton rôle de ${role}, je me suis dit que ça pouvait clairement faire sens pour ${valueProposition}.`
        : company
          ? `Au vu de ce que vous développez chez ${company}, je me suis dit que ça pouvait clairement faire sens pour ${valueProposition}.`
          : `En regardant votre positionnement, je me suis dit que ça pouvait clairement faire sens pour ${valueProposition}.`;
    const emailCompanyLine = company
      ? `Est-ce que c'est un sujet qui te parle en ce moment chez ${company} ?`
      : "Est-ce que c'est un sujet qui te parle en ce moment ?";

    const linkedinBaseMessage = `Hello ${firstName},

Avec mon associé, on vient de lancer une jeune startup.

On a développé ${offer}.

On l'a déjà implanté dans plusieurs structures et ça change vraiment le quotidien.

${roleCompanyLine}

Ça te dirait qu'on prenne 10 minutes pour en discuter ?`;

    const followupBaseMessage = `${firstName}, je reviens vers toi rapidement.
Quand on gère ${structureContext}, la prospection c'est souvent le truc qu'on repousse parce qu'on est la tête dans les projets.
C'est exactement pour ça qu'on a créé cette offre, pour que ça tourne en fond sans que tu aies à t'en occuper.
Est-ce que tu aurais 10 min cette semaine pour que je te montre comment ça marche concrètement ?`;

    const emailBaseMessage = `Objet : ${valueProposition}

Bonjour ${firstName},

La plupart des ${target || "dirigeants de structures B2B"} que je croise s'appuient beaucoup sur leur réseau ou le bouche-à-oreille. Ça fonctionne, jusqu'au moment où il faut relancer l'acquisition sans y passer ses journées.

On a développé ${offer}.

L'idée est simple : ${valueProposition}.

${emailCompanyLine}

${contactName}`;

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
- name : ${contactName}
- offer : ${offer}
- target : ${target}
- valueProposition : ${valueProposition}

OFFRE :
${offer}

MESSAGE DE BASE LINKEDIN (à adapter à chaque prospect) :
${linkedinBaseMessage}

RELANCE DE BASE LINKEDIN (à adapter) :
${followupBaseMessage}

EMAIL DE BASE (à adapter) :
${emailBaseMessage}

TONS À PRODUIRE :
${tones.map((tone) => `- ${tone.id} (${tone.name}) : ${tone.tagline} | Consigne de style : ${TONE_STYLE_GUIDE[tone.id] || "Garde le style de base tout en respectant le ton demandé."}`).join("\n")}

Consigne finale :
- Produis exactement un objet complet par ton demandé
- Chaque ton doit garder la même ossature commerciale de base, avec une expression adaptée au style
- Si un post n'est pas exploitable, ignore-le complètement
- Les champs structurés linkedinHeadline, linkedinJobTitle, companyIndustry, linkedinDescription et linkedinSkillsLabel doivent refléter uniquement des infos présentes ou déductibles avec forte confiance du profil
- Si une donnée structurée n'est pas disponible avec forte confiance, retourne ""
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
