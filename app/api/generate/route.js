// app/api/generate/route.js
import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT = `Tu es un expert en prospection LinkedIn B2B francophone. Tu génères des messages de prospection ultra-personnalisés.

RÈGLES STRICTES :
- Messages en texte brut UNIQUEMENT — pas de tirets, pas de bullet points, pas de gras, pas de formatage
- Sauts de ligne pour aérer
- Maximum 100 mots par message
- Vouvoiement systématique
- Chaque message doit mentionner un élément SPÉCIFIQUE du profil du prospect
- Le CTA doit être une question ouverte, pas un lien
- JAMAIS de "J'espère que vous allez bien" ni de "Je me permets de"

RÈGLE ABSOLUE — NE JAMAIS DÉNIGRER LE PROSPECT :
C'est la règle la plus importante. Tu ne dois JAMAIS :
- Pointer un manque, une faiblesse ou un problème chez le prospect ("vous êtes absents sur LinkedIn", "zéro présence", "vous êtes nuls en prospection", "votre page n'a que X abonnés")
- Faire un diagnostic non-sollicité négatif de leur activité ("votre acquisition repose sur le bouche-à-oreille, c'est risqué")
- Comparer négativement avec leurs concurrents ("vos concurrents font mieux que vous")
- Utiliser un ton condescendant ou paternaliste ("vous laissez des clients sur la table", "vous perdez de l'argent")
- Sous-entendre que leur entreprise a un problème à résoudre

À LA PLACE, tu dois :
- Valoriser ce que le prospect fait déjà bien (un post, un projet, une expertise, une croissance)
- Montrer de la curiosité sincère sur leur approche
- Proposer un échange d'égal à égal entre experts, pas un sauveur qui vient corriger leurs erreurs
- Parler de ce que TU fais et des résultats obtenus, sans jamais sous-entendre que le prospect échoue
- Créer de la valeur dans le message lui-même (un insight, une donnée, une perspective)

Le ton général doit être : "Je vous respecte, je trouve votre travail intéressant, et je pense qu'on pourrait s'apporter mutuellement."

IMPORTANT : Pour chaque ton demandé, génère exactement 3 messages différents avec des approches variées.

RECOMMANDATION LIDMEO :
Parmi TOUS les messages générés, choisis LE meilleur. Celui qui a le plus de chances d'obtenir une réponse. Critères :
1. La personnalisation est chirurgicale (référence ultra-précise au profil)
2. Le lien entre le signal du prospect et l'offre de l'expéditeur est naturel (pas forcé)
3. Le CTA est irrésistible (question qui donne envie de répondre)
4. Le ton inspire la crédibilité et l'expertise
Indique-le dans le champ "recommended" du JSON.

Retourne UNIQUEMENT un JSON valide sans markdown ni backticks :
{"recommended":{"tone_id":"...","tone_name":"...","message_index":0,"reason":"explication courte de pourquoi c'est le meilleur message pour ce prospect"},"tones":[{"tone_id":"...","tone_name":"...","messages":[{"text":"...","hook":"description courte de l'approche utilisée","signal":"quel élément du profil a été utilisé"}]}]}`;

export async function POST(req) {
  try {
    const { profile, userInfo, tones } = await req.json();

    if (!profile || !userInfo || !tones || tones.length === 0) {
      return NextResponse.json({ error: "Données manquantes" }, { status: 400 });
    }

    // Build the profile context string
    const postsContext = (profile.recentPosts || [])
      .map((p, i) => `- Post ${i + 1} : "${p.text?.slice(0, 300)}" (${p.likes} likes, ${p.comments} commentaires, ${p.date})`)
      .join("\n");

    const commentsContext = (profile.recentComments || [])
      .map((c, i) => `- Commentaire ${i + 1} : "${c}"`)
      .join("\n");

    const userPrompt = `Génère des messages de prospection LinkedIn personnalisés.

PROFIL PROSPECT (données Unipile) :
- Prénom : ${profile.firstName}
- Nom : ${profile.lastName}
- Headline : ${profile.headline}
- Entreprise : ${profile.company}
- Localisation : ${profile.location}
- À propos : ${profile.about?.slice(0, 500) || "Non renseigné"}
${postsContext ? `- Posts récents :\n${postsContext}` : "- Aucun post récent trouvé"}
${commentsContext ? `- Commentaires récents :\n${commentsContext}` : ""}

MON CONTEXTE (expéditeur) :
- Prénom : ${userInfo.name || "Lilian"}
- Offre : ${userInfo.offer}
- Cible : ${userInfo.target}
- Proposition de valeur : ${userInfo.valueProposition}

STYLES DE MESSAGES SÉLECTIONNÉS :
${tones.map((t) => `- ${t.id} (${t.name}): ${t.tagline}`).join("\n")}

Pour chaque ton, génère 3 messages avec des approches différentes (rebond sur un post, observation profil, question directe, etc). Varie les signaux utilisés.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-5.4-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 4000,
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

    return NextResponse.json(parsed);
  } catch (err) {
    console.error("[generate] API error:", err);
    return NextResponse.json(
      { error: "Erreur lors de la génération des messages" },
      { status: 500 }
    );
  }
}
