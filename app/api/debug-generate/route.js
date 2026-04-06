// app/api/debug-generate/route.js — TEMPORARY, DELETE AFTER DEBUG
import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function GET() {
  const apiKey = process.env.OPENAI_API_KEY || "";
  if (!apiKey) {
    return NextResponse.json({ error: "OPENAI_API_KEY is MISSING" });
  }

  const openai = new OpenAI({ apiKey });

  const testProfile = {
    firstName: "Bill", lastName: "Gates",
    headline: "Co-chair, Bill & Melinda Gates Foundation",
    company: "Gates Foundation", location: "Seattle, WA",
    about: "Co-chair of the Bill & Melinda Gates Foundation.",
    recentPosts: [],
  };
  const testUserInfo = {
    name: "Lilian", offer: "Prospection LinkedIn automatisée pour agences digitales",
    target: "Fondateurs d'agences digitales de 3 à 12 personnes",
    valueProposition: "3 à 5 RDV qualifiés par semaine sans commercial",
  };

  let raw = "";
  let modelUsed = "";
  let parsed = null;
  let parseError = null;
  let apiError = null;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-5.4-mini",
      messages: [
        { role: "system", content: "Retourne UNIQUEMENT ce JSON valide sans markdown : {\"recommended\":{\"tone_id\":\"direct\",\"tone_name\":\"Direct\",\"reason\":\"test\"},\"tones\":[{\"tone_id\":\"direct\",\"tone_name\":\"Direct\",\"internal_message\":\"Message LinkedIn test.\",\"relance_linkedin\":\"Relance test.\",\"message_mail\":\"Objet : test\\n\\nBonjour Bill,\\n\\nEmail test.\\n\\nLilian\",\"resume_profil\":\"Résumé test.\",\"linkedinHeadline\":\"Co-chair, Bill & Melinda Gates Foundation\",\"linkedinJobTitle\":\"Co-chair\",\"companyIndustry\":\"Foundation\",\"linkedinDescription\":\"Co-chair of the Bill & Melinda Gates Foundation.\",\"linkedinSkillsLabel\":\"philanthropy\"}]}" },
        { role: "user", content: `Profil: ${testProfile.firstName} ${testProfile.lastName}, ${testProfile.headline}. Offre: ${testUserInfo.offer}. Génère un pack complet pour 1 ton direct.` },
      ],
      max_completion_tokens: 500,
      temperature: 0.5,
    });
    modelUsed = completion.model;
    raw = completion.choices[0]?.message?.content || "";
    const clean = raw.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
    try {
      parsed = JSON.parse(clean);
    } catch (e) {
      parseError = e.message;
    }
  } catch (e) {
    apiError = { message: e.message, type: e.constructor?.name, status: e.status };
  }

  return NextResponse.json({
    openai_key_set: `${apiKey.slice(0, 7)}...`,
    model_requested: "gpt-5.4-mini",
    model_used: modelUsed || null,
    api_error: apiError,
    raw_response: raw,
    parse_error: parseError,
    parsed_ok: parsed !== null,
  });
}
