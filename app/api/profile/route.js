// app/api/profile/route.js
import { NextResponse } from "next/server";

const UNIPILE_API_KEY = process.env.UNIPILE_API_KEY;
const UNIPILE_DSN = process.env.UNIPILE_DSN;

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

    const headers = {
      "X-API-KEY": UNIPILE_API_KEY,
      "Content-Type": "application/json",
    };

    // 1. Fetch profile
    const profileRes = await fetch(
      `${UNIPILE_DSN}/api/v1/users/${username}?linkedin_sections=*`,
      { headers }
    );

    if (!profileRes.ok) {
      const errText = await profileRes.text();
      console.error("Unipile profile error:", profileRes.status, errText);
      return NextResponse.json({ error: "Erreur lors de la récupération du profil" }, { status: 500 });
    }

    const profile = await profileRes.json();

    // 2. Fetch recent posts (try to get last 3)
    let recentPosts = [];
    try {
      const postsRes = await fetch(
        `${UNIPILE_DSN}/api/v1/users/${username}/posts?limit=3`,
        { headers }
      );
      if (postsRes.ok) {
        const postsData = await postsRes.json();
        recentPosts = (postsData.items || postsData || []).slice(0, 3).map((p) => ({
          text: p.text || p.content || "",
          likes: p.reactions_count || p.likes_count || 0,
          comments: p.comments_count || 0,
          date: p.created_at || p.date || "",
        }));
      }
    } catch (e) {
      console.log("Could not fetch posts:", e.message);
    }

    // 3. Build clean profile object
    const cleanProfile = {
      firstName: profile.first_name || profile.firstName || "",
      lastName: profile.last_name || profile.lastName || "",
      headline: profile.headline || "",
      company: profile.company || profile.current_company?.name || "",
      location: profile.location || "",
      about: profile.summary || profile.about || "",
      recentPosts,
      // If no posts found, provide empty array
      recentComments: [], // Unipile doesn't always expose comments easily
    };

    return NextResponse.json(cleanProfile);
  } catch (err) {
    console.error("Profile API error:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
