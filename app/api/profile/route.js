// app/api/profile/route.js
import { NextResponse } from "next/server";

const UNIPILE_API_KEY = process.env.UNIPILE_API_KEY;
const UNIPILE_DSN_RAW = process.env.UNIPILE_DSN || "";
const UNIPILE_DSN = UNIPILE_DSN_RAW.startsWith("http") ? UNIPILE_DSN_RAW : `https://${UNIPILE_DSN_RAW}`;
const UNIPILE_ACCOUNT_ID = process.env.UNIPILE_ACCOUNT_ID;

// Extract LinkedIn username from URL
function extractUsername(url) {
  const match = url.match(/linkedin\.com\/in\/([^/?#]+)/);
  return match ? match[1] : null;
}

export async function POST(req) {
  try {
    const { profileUrl } = await req.json();

    if (!profileUrl || !profileUrl.includes("linkedin.com")) {
      return NextResponse.json({ error: "URL LinkedIn invalide" }, { status: 400 });
    }

    const username = extractUsername(profileUrl);
    if (!username) {
      return NextResponse.json({ error: "Impossible d'extraire le username LinkedIn" }, { status: 400 });
    }

    console.log("[profile] Fetching profile for username:", username);
    console.log("[profile] Env check — DSN:", UNIPILE_DSN, "| ACCOUNT_ID:", UNIPILE_ACCOUNT_ID, "| API_KEY set:", !!UNIPILE_API_KEY);

    if (!UNIPILE_DSN || !UNIPILE_API_KEY || !UNIPILE_ACCOUNT_ID) {
      return NextResponse.json(
        { error: `Variables d'environnement manquantes : ${!UNIPILE_DSN ? "UNIPILE_DSN " : ""}${!UNIPILE_API_KEY ? "UNIPILE_API_KEY " : ""}${!UNIPILE_ACCOUNT_ID ? "UNIPILE_ACCOUNT_ID" : ""}`.trim() },
        { status: 500 }
      );
    }

    const headers = {
      "X-API-KEY": UNIPILE_API_KEY,
      "accept": "application/json",
    };

    // 1. Fetch profile
    const profileUrl_ = `${UNIPILE_DSN}/api/v1/users/${username}?account_id=${UNIPILE_ACCOUNT_ID}&linkedin_sections=*`;
    console.log("[profile] Profile URL:", profileUrl_);
    const profileRes = await fetch(profileUrl_, { headers });

    if (!profileRes.ok) {
      const errText = await profileRes.text();
      console.error("[profile] Unipile profile error:", profileRes.status, errText);
      return NextResponse.json(
        { error: "Impossible de récupérer ce profil LinkedIn", unipileStatus: profileRes.status, detail: errText },
        { status: profileRes.status >= 400 && profileRes.status < 500 ? profileRes.status : 502 }
      );
    }

    const profile = await profileRes.json();
    console.log("[profile] Unipile profile response:", JSON.stringify(profile, null, 2));

    // 2. Fetch recent posts (non-blocking)
    let recentPosts = [];
    try {
      const postsUrl = `${UNIPILE_DSN}/api/v1/users/${username}/posts?account_id=${UNIPILE_ACCOUNT_ID}&limit=3`;
      console.log("[profile] Posts URL:", postsUrl);
      const postsRes = await fetch(postsUrl, { headers });
      if (postsRes.ok) {
        const postsData = await postsRes.json();
        console.log("[profile] Unipile posts response:", JSON.stringify(postsData, null, 2));
        recentPosts = (postsData.items || postsData || []).slice(0, 3).map((p) => ({
          text: p.text || p.content || "",
          likes: p.reaction_counter ?? p.reactions_count ?? p.likes_count ?? 0,
          comments: p.comment_counter ?? p.comments_count ?? 0,
          date: p.parsed_datetime || p.created_at || p.date || "",
        }));
      } else {
        const errText = await postsRes.text();
        console.log("[profile] Posts fetch failed (non-blocking):", postsRes.status, errText);
      }
    } catch (e) {
      console.log("[profile] Could not fetch posts (non-blocking):", e.message);
    }

    // 3. Build clean profile object
    const cleanProfile = {
      firstName: profile.first_name || profile.firstName || "",
      lastName: profile.last_name || profile.lastName || "",
      headline: profile.headline || "",
      company: profile.current_company?.name || profile.company || "",
      location: profile.location || profile.region || "",
      about: profile.summary || profile.about || profile.description || "",
      recentPosts,
      recentComments: [],
    };

    console.log("[profile] Clean profile:", JSON.stringify(cleanProfile, null, 2));
    return NextResponse.json(cleanProfile);
  } catch (err) {
    console.error("[profile] API error:", err);
    return NextResponse.json({ error: err.message || "Erreur serveur" }, { status: 500 });
  }
}
