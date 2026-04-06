# Lidmeo — Générateur de messages LinkedIn

Outil gratuit de génération de messages de prospection LinkedIn personnalisés.
Déployable sur Vercel en 5 minutes.

## Architecture

```
app/
├── layout.js              ← HTML wrapper + fonts
├── page.js                ← Server component (wrapper)
├── page-client.jsx        ← Client component (tout le UI)
├── api/
│   ├── profile/route.js   ← Scraping profil LinkedIn via Unipile
│   └── generate/route.js  ← Génération messages via GPT-5.4-mini
```

## Déploiement sur Vercel

### 1. Push sur GitHub

```bash
cd lidmeo-tool
git init
git add .
git commit -m "Initial commit - Lidmeo message generator"
git remote add origin https://github.com/TON-USERNAME/lidmeo-tool.git
git push -u origin main
```

### 2. Importer sur Vercel

1. Va sur https://vercel.com/new
2. Importe le repo GitHub
3. Framework preset : **Next.js** (détecté automatiquement)
4. Ajoute les **Environment Variables** :

| Variable | Valeur |
|----------|--------|
| `OPENAI_API_KEY` | Ta clé API OpenAI (sk-...) |
| `UNIPILE_API_KEY` | Ta clé API Unipile |
| `UNIPILE_DSN` | Ton DSN Unipile (https://apiX.unipile.com:XXXXX) |

5. Clique **Deploy**

### 3. Domaine custom (optionnel)

Dans les settings du projet Vercel → Domains → Ajoute `tool.lidmeo.com`
Puis ajoute un CNAME dans ton DNS : `tool` → `cname.vercel-dns.com`

## Développement local

```bash
npm install
# Remplis .env.local avec tes clés
npm run dev
```

Ouvre http://localhost:3000

## Notes techniques

- **Unipile** : L'API route `/api/profile` scrape le profil LinkedIn via ton compte Unipile connecté.
  Adapte les champs du JSON si ta version d'Unipile retourne des clés différentes.

- **GPT-5.4-mini** : Utilisé via le SDK OpenAI officiel. Le modèle string est `gpt-5.4-mini`.
  Si tu veux changer de modèle, modifie `app/api/generate/route.js` ligne ~90.

- **Limite 10 profils** : Gérée côté client uniquement (state React).
  Pour une vraie limite, branche Supabase et track par IP ou email.

- **Fallback** : Si l'API échoue, des messages génériques sont affichés.
  En prod, tu voudras logger les erreurs et afficher un message plus propre.
