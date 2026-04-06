// app/api/debug/route.js — TEMPORARY, DELETE AFTER DEBUG
import { NextResponse } from "next/server";

export async function GET() {
  const DSN_RAW = process.env.UNIPILE_DSN || "";
  const DSN = DSN_RAW.startsWith("http") ? DSN_RAW : `https://${DSN_RAW}`;
  const API_KEY = process.env.UNIPILE_API_KEY || "";
  const ACCOUNT_ID = process.env.UNIPILE_ACCOUNT_ID || "";

  const envStatus = {
    UNIPILE_DSN_RAW: DSN_RAW || "MISSING",
    UNIPILE_DSN_resolved: DSN || "MISSING",
    UNIPILE_API_KEY: API_KEY ? `set (${API_KEY.slice(0, 6)}...)` : "MISSING",
    UNIPILE_ACCOUNT_ID: ACCOUNT_ID || "MISSING",
    OPENAI_API_KEY: process.env.OPENAI_API_KEY ? `set (${process.env.OPENAI_API_KEY.slice(0, 7)}...)` : "MISSING",
  };

  if (!DSN || !API_KEY || !ACCOUNT_ID) {
    return NextResponse.json({ error: "Missing env vars", envStatus });
  }

  const headers = { "X-API-KEY": API_KEY, accept: "application/json" };

  // Test 1: own profile (sanity check that the connection works)
  let ownProfileResult;
  try {
    const r = await fetch(`${DSN}/api/v1/users/profile?account_id=${ACCOUNT_ID}`, { headers });
    const text = await r.text();
    ownProfileResult = { status: r.status, body: tryParse(text) };
  } catch (e) {
    ownProfileResult = { error: e.message };
  }

  // Test 2: lookup a known public profile (williamhgates)
  let profileResult;
  try {
    const url = `${DSN}/api/v1/users/williamhgates?account_id=${ACCOUNT_ID}&linkedin_sections=*`;
    const r = await fetch(url, { headers });
    const text = await r.text();
    profileResult = { status: r.status, url, body: tryParse(text) };
  } catch (e) {
    profileResult = { error: e.message };
  }

  // Test 3: alternate path format
  let profileResult2;
  try {
    const url = `${DSN}/api/v1/users/profile/williamhgates?account_id=${ACCOUNT_ID}&linkedin_sections=*`;
    const r = await fetch(url, { headers });
    const text = await r.text();
    profileResult2 = { status: r.status, url, body: tryParse(text) };
  } catch (e) {
    profileResult2 = { error: e.message };
  }

  return NextResponse.json({
    envStatus,
    test_own_profile: ownProfileResult,
    test_profile_v1_users: profileResult,
    test_profile_v1_users_profile: profileResult2,
  });
}

function tryParse(text) {
  try { return JSON.parse(text); } catch { return text; }
}
