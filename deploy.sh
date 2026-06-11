#!/usr/bin/env bash
set -e

echo "📦 Build du frontend..."
cd fleet-mgt-frontend
npm run build

echo "🚀 Déploiement sur Cloudflare Pages..."
npx wrangler pages deploy dist --project-name fleet-citg --branch main

echo "✅ Déployé sur https://fleet-citg.pages.dev"
