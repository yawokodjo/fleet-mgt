#!/usr/bin/env bash
set -e

# Charge le token Cloudflare depuis .env.deploy s'il existe
if [ -f "$(dirname "$0")/.env.deploy" ]; then
  export $(grep -v '^#' "$(dirname "$0")/.env.deploy" | xargs)
fi

if [ -z "$CLOUDFLARE_API_TOKEN" ]; then
  echo "❌ CLOUDFLARE_API_TOKEN non défini. Crée un fichier .env.deploy avec :"
  echo "   CLOUDFLARE_API_TOKEN=ton_token"
  exit 1
fi

echo "📦 Build du frontend..."
cd "$(dirname "$0")/fleet-mgt-frontend"
npm run build

echo "🚀 Déploiement sur Cloudflare Pages..."
npx wrangler pages deploy dist --project-name fleet-citg --branch main

echo "✅ Déployé sur https://fleet-citg.pages.dev"
