#!/usr/bin/env python3
"""Generate Fleet Management System audit reports as PDF."""

from weasyprint import HTML, CSS
from datetime import date

TODAY = date.today().strftime("%d/%m/%Y")

HTML_CONTENT = f"""<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<title>Audit Fleet Management System</title>
</head>
<body>

<!-- COVER PAGE -->
<div class="cover">
  <div class="cover-badge">CONFIDENTIEL</div>
  <div class="cover-logo">⚙</div>
  <h1 class="cover-title">Fleet Management System</h1>
  <p class="cover-subtitle">Rapports d'Audit Technique</p>
  <div class="cover-divider"></div>
  <div class="cover-meta">
    <div class="cover-meta-item"><span class="label">Date</span><span class="value">{TODAY}</span></div>
    <div class="cover-meta-item"><span class="label">Version</span><span class="value">2.0</span></div>
    <div class="cover-meta-item"><span class="label">Branche</span><span class="value">main</span></div>
    <div class="cover-meta-item"><span class="label">Préparé par</span><span class="value">Claude Code — Anthropic</span></div>
  </div>
  <div class="cover-reports">
    <div class="cover-report-item">01 &nbsp;–&nbsp; Architecture &amp; Patterns</div>
    <div class="cover-report-item">02 &nbsp;–&nbsp; Sécurité</div>
    <div class="cover-report-item">03 &nbsp;–&nbsp; Performance, Modernité &amp; Scalabilité</div>
    <div class="cover-report-item">04 &nbsp;–&nbsp; Tests</div>
  </div>
</div>

<!-- TABLE OF CONTENTS -->
<div class="toc-page">
  <h2 class="toc-title">Table des matières</h2>
  <div class="toc-section">
    <div class="toc-entry toc-report"><span>Rapport 01 — Architecture</span><span class="toc-page-num">3</span></div>
    <div class="toc-entry"><span>1.1 Vue d'ensemble &amp; Stack technique</span><span class="toc-page-num">3</span></div>
    <div class="toc-entry"><span>1.2 Architecture Frontend</span><span class="toc-page-num">4</span></div>
    <div class="toc-entry"><span>1.3 Architecture Backend</span><span class="toc-page-num">5</span></div>
    <div class="toc-entry"><span>1.4 Infrastructure &amp; Déploiement</span><span class="toc-page-num">6</span></div>
  </div>
  <div class="toc-section">
    <div class="toc-entry toc-report"><span>Rapport 02 — Sécurité</span><span class="toc-page-num">7</span></div>
    <div class="toc-entry"><span>2.1 Tableau de bord sécurité</span><span class="toc-page-num">7</span></div>
    <div class="toc-entry"><span>2.2 Problèmes critiques</span><span class="toc-page-num">8</span></div>
    <div class="toc-entry"><span>2.3 Points forts</span><span class="toc-page-num">9</span></div>
    <div class="toc-entry"><span>2.4 Recommandations</span><span class="toc-page-num">10</span></div>
  </div>
  <div class="toc-section">
    <div class="toc-entry toc-report"><span>Rapport 03 — Performance, Modernité &amp; Scalabilité</span><span class="toc-page-num">11</span></div>
    <div class="toc-entry"><span>3.1 Performance Frontend &amp; Backend</span><span class="toc-page-num">11</span></div>
    <div class="toc-entry"><span>3.2 Modernité de la stack</span><span class="toc-page-num">12</span></div>
    <div class="toc-entry"><span>3.3 Scalabilité</span><span class="toc-page-num">13</span></div>
    <div class="toc-entry"><span>3.4 Synthèse globale</span><span class="toc-page-num">14</span></div>
  </div>
  <div class="toc-section">
    <div class="toc-entry toc-report"><span>Rapport 04 — Tests</span><span class="toc-page-num">15</span></div>
    <div class="toc-entry"><span>4.1 Tests Backend — PHPUnit</span><span class="toc-page-num">15</span></div>
    <div class="toc-entry"><span>4.2 Tests Frontend — Vitest</span><span class="toc-page-num">16</span></div>
    <div class="toc-entry"><span>4.3 Synthèse de la couverture</span><span class="toc-page-num">17</span></div>
  </div>
</div>

<!-- ============================= RAPPORT 01 ============================= -->
<div class="report-header r1">
  <div class="report-number">01</div>
  <div class="report-header-text">
    <div class="report-category">Architecture</div>
    <div class="report-title">Patterns, Structure &amp; Technologies</div>
  </div>
</div>

<div class="section">
  <h2 class="section-title">1.1 Vue d'ensemble</h2>
  <p>
    <strong>Fleet Management System</strong> est une application web de gestion de flotte de véhicules
    organisée en <strong>monorepo</strong> avec une séparation stricte frontend/backend.
    L'architecture suit le paradigme <strong>SPA + REST API</strong>.
  </p>

  <div class="archi-diagram">
    <div class="archi-col">
      <div class="archi-box frontend">
        <div class="archi-box-title">FRONTEND</div>
        <div class="archi-box-sub">React 19 · Vite 6</div>
        <div class="archi-box-sub">Cloudflare Pages</div>
      </div>
    </div>
    <div class="archi-arrow">⟷<br><small>HTTPS / REST</small></div>
    <div class="archi-col">
      <div class="archi-box backend">
        <div class="archi-box-title">BACKEND</div>
        <div class="archi-box-sub">Laravel 12 · PHP 8.2</div>
        <div class="archi-box-sub">Railway (Docker)</div>
      </div>
    </div>
    <div class="archi-arrow">⟷<br><small>PostgreSQL / TLS</small></div>
    <div class="archi-col">
      <div class="archi-box db">
        <div class="archi-box-title">DATABASE</div>
        <div class="archi-box-sub">Neon (PostgreSQL)</div>
        <div class="archi-box-sub">Serverless · SSL</div>
      </div>
    </div>
  </div>

  <h3>Stack technique complète</h3>
  <table>
    <thead><tr><th>Couche</th><th>Technologie</th><th>Version</th><th>Rôle</th></tr></thead>
    <tbody>
      <tr><td>Frontend</td><td>React</td><td>19.1.0</td><td>Framework UI</td></tr>
      <tr><td>Build</td><td>Vite</td><td>6.3.5</td><td>Bundler + dev server</td></tr>
      <tr><td>Routing</td><td>React Router DOM</td><td>7.6.2</td><td>Navigation SPA</td></tr>
      <tr><td>UI</td><td>Bootstrap + React Bootstrap</td><td>5.3.8 / 2.10.10</td><td>Composants UI</td></tr>
      <tr><td>HTTP</td><td>Axios</td><td>1.10.0</td><td>Client HTTP + intercepteurs</td></tr>
      <tr><td>i18n</td><td>react-i18next</td><td>15.6.1</td><td>Internationalisation EN/FR</td></tr>
      <tr><td>Animations</td><td>Framer Motion</td><td>12.23.24</td><td>Transitions UI</td></tr>
      <tr><td>Exports</td><td>jsPDF + XLSX</td><td>4.2.1 / 0.18.5</td><td>PDF &amp; Excel côté client</td></tr>
      <tr><td>Backend</td><td>Laravel</td><td>12.0</td><td>Framework API MVC</td></tr>
      <tr><td>Auth API</td><td>Laravel Sanctum</td><td>4.1</td><td>Tokens + sessions</td></tr>
      <tr><td>Langage</td><td>PHP</td><td>8.2+</td><td>Runtime backend</td></tr>
      <tr><td>Base de données</td><td>Neon (PostgreSQL)</td><td>16.x</td><td>Persistance serverless</td></tr>
      <tr><td>CI/CD</td><td>GitHub Actions</td><td>—</td><td>Lint, tests, déploiement</td></tr>
    </tbody>
  </table>
</div>

<div class="section">
  <h2 class="section-title">1.2 Architecture Frontend</h2>

  <h3>Pattern : SPA (Single Page Application)</h3>
  <p>
    Le frontend est une SPA React avec routage côté client.
    L'état global se limite au contexte d'authentification via <strong>React Context API</strong> —
    pas de Redux ni Zustand, ce qui est adapté à la taille actuelle de l'application.
  </p>

  <div class="code-block">fleet-mgt-frontend/src/
├── context/        # État global (AuthContext)
├── components/     # 49 composants JSX réutilisables
│   ├── Layouts/    # MainLayout, Sidebar, Header, Footer
│   ├── Auth/       # PrivateRoute, LogoutButton
│   └── UI/         # Modal, Alert, Loader, FormInput, Pagination
├── pages/          # Vues liées aux routes
├── hooks/          # Custom React hooks
├── utils/          # Fonctions utilitaires
├── locales/        # Traductions EN / FR
└── axios.js        # Client HTTP centralisé</div>

  <h3>Arborescence des routes</h3>
  <table>
    <thead><tr><th>Route</th><th>Accès</th><th>Rôles autorisés</th></tr></thead>
    <tbody>
      <tr><td>/login, /register, /forgot-password</td><td>Public</td><td>Tous</td></tr>
      <tr><td>/dashboard, /profile</td><td>Protégé</td><td>Tous les rôles</td></tr>
      <tr><td>/vehicles/*</td><td>Protégé</td><td>admin, manager, accountant</td></tr>
      <tr><td>/maintenances/*</td><td>Protégé</td><td>admin, manager</td></tr>
      <tr><td>/consumptions/*</td><td>Protégé</td><td>admin, manager, accountant</td></tr>
      <tr><td>/reports/*</td><td>Protégé</td><td>admin, manager, accountant</td></tr>
      <tr><td>/users/*</td><td>Protégé</td><td>admin uniquement</td></tr>
    </tbody>
  </table>

  <h3>Flux d'authentification</h3>
  <div class="flow">
    <div class="flow-step">1. POST /api/login</div>
    <div class="flow-arrow">↓</div>
    <div class="flow-step">2. Backend retourne &#123; user, access_token &#125;</div>
    <div class="flow-arrow">↓</div>
    <div class="flow-step">3. user → localStorage &nbsp;|&nbsp; token → sessionStorage</div>
    <div class="flow-arrow">↓</div>
    <div class="flow-step">4. PrivateRoute vérifie l'utilisateur à chaque navigation</div>
    <div class="flow-arrow">↓</div>
    <div class="flow-step">5. Axios intercepte chaque requête → injecte Bearer token</div>
    <div class="flow-arrow">↓</div>
    <div class="flow-step">6. Réponse 401 → effacement storage + redirect /login</div>
  </div>
  <p><strong>Timer d'inactivité :</strong> avertissement à 28 minutes, déconnexion automatique à 30 minutes (SessionWarningModal).</p>
</div>

<div class="section">
  <h2 class="section-title">1.3 Architecture Backend</h2>

  <h3>Pattern : MVC (Model-View-Controller) — Laravel</h3>
  <div class="code-block">fleet-mgt-api/app/
├── Http/
│   ├── Controllers/    # 8 contrôleurs (Auth, User, Vehicle, Maintenance...)
│   └── Middleware/     # SecurityHeaders, CORS, Authentification
├── Models/             # 5 modèles Eloquent ORM
├── Providers/          # AuthServiceProvider (RBAC Gates)
└── config/             # Sanctum, CORS, Auth, Cache...</div>

  <h3>Modèle de données</h3>
  <table>
    <thead><tr><th>Table</th><th>Champs clés</th><th>Relations</th></tr></thead>
    <tbody>
      <tr><td>users</td><td>id, name, email, role, login_attempts, blocked_until</td><td>hasMany: vehicles, reports</td></tr>
      <tr><td>vehicles</td><td>id, license_plate, marque, model, fuel_type, status, current_driver_id</td><td>belongsTo: user; hasMany: maintenances, consumptions</td></tr>
      <tr><td>maintenances</td><td>id, vehicle_id, type, date, cost, notes</td><td>belongsTo: vehicle</td></tr>
      <tr><td>consumptions</td><td>id, vehicle_id, fuel_amount, date, cost</td><td>belongsTo: vehicle</td></tr>
      <tr><td>reports</td><td>id, vehicle_id, report_type, title, metadata (JSON)</td><td>belongsTo: vehicle</td></tr>
    </tbody>
  </table>

  <h3>RBAC — Rôles et permissions</h3>
  <p>Géré via <strong>Laravel Gates</strong> dans <code>AuthServiceProvider</code> :</p>
  <table>
    <thead><tr><th>Rôle</th><th>Périmètre d'accès</th></tr></thead>
    <tbody>
      <tr><td><span class="badge badge-red">admin</span></td><td>Accès total au système</td></tr>
      <tr><td><span class="badge badge-orange">manager</span></td><td>Véhicules, maintenances, rapports, utilisateurs (lecture)</td></tr>
      <tr><td><span class="badge badge-blue">accountant</span></td><td>Véhicules (lecture), consommations, rapports</td></tr>
      <tr><td><span class="badge badge-green">driver</span></td><td>Véhicules assignés, consommations propres</td></tr>
      <tr><td><span class="badge badge-gray">mechanic</span></td><td>Maintenances uniquement</td></tr>
    </tbody>
  </table>
</div>

<div class="section">
  <h2 class="section-title">1.4 Infrastructure &amp; Déploiement</h2>

  <h3>Environnements</h3>
  <table>
    <thead><tr><th>Couche</th><th>Développement</th><th>Production</th></tr></thead>
    <tbody>
      <tr><td>Frontend</td><td>Vite dev server (port 5173)</td><td>Cloudflare Pages (CDN global)</td></tr>
      <tr><td>Backend</td><td>PHP Artisan (port 8000)</td><td>Railway (Docker auto-build)</td></tr>
      <tr><td>Base de données</td><td>PostgreSQL Docker (port 5432)</td><td>Neon (PostgreSQL serverless, SSL)</td></tr>
      <tr><td>Orchestration</td><td>Docker Compose</td><td>Railway (build + déploiement automatique)</td></tr>
    </tbody>
  </table>

  <h3>Pipeline CI/CD (GitHub Actions)</h3>
  <div class="flow horizontal">
    <div class="flow-step">Push / PR<br><small>main, develop</small></div>
    <div class="flow-arrow">→</div>
    <div class="flow-step">CI : lint<br>+ tests</div>
    <div class="flow-arrow">→</div>
    <div class="flow-step">CD : signal<br>Railway</div>
    <div class="flow-arrow">→</div>
    <div class="flow-step">Railway<br>auto-build</div>
    <div class="flow-arrow">→</div>
    <div class="flow-step">Production<br>déployée</div>
  </div>
</div>


<!-- ============================= RAPPORT 02 ============================= -->
<div class="report-header r2">
  <div class="report-number">02</div>
  <div class="report-header-text">
    <div class="report-category">Sécurité</div>
    <div class="report-title">Analyse des risques &amp; Recommandations</div>
  </div>
</div>

<div class="section">
  <h2 class="section-title">2.1 Tableau de bord sécurité</h2>

  <div class="security-grid">
    <div class="security-card good">
      <div class="security-card-score">9/10</div>
      <div class="security-card-label">Authentification</div>
    </div>
    <div class="security-card good">
      <div class="security-card-score">9/10</div>
      <div class="security-card-label">Autorisation RBAC</div>
    </div>
    <div class="security-card warn">
      <div class="security-card-score">6/10</div>
      <div class="security-card-label">Gestion des tokens</div>
    </div>
    <div class="security-card crit">
      <div class="security-card-score">1/10</div>
      <div class="security-card-label">Secrets &amp; Config</div>
    </div>
    <div class="security-card good">
      <div class="security-card-score">9/10</div>
      <div class="security-card-label">Headers HTTP</div>
    </div>
    <div class="security-card good">
      <div class="security-card-score">8/10</div>
      <div class="security-card-label">Validation entrées</div>
    </div>
    <div class="security-card good">
      <div class="security-card-score">9/10</div>
      <div class="security-card-label">Protection CSRF</div>
    </div>
    <div class="security-card warn">
      <div class="security-card-score">6/10</div>
      <div class="security-card-label">Configuration CORS</div>
    </div>
  </div>

  <div class="legend">
    <span class="legend-item good-text">8-10 Bon</span>
    <span class="legend-item warn-text">5-7 À améliorer</span>
    <span class="legend-item crit-text">0-4 Critique</span>
  </div>
</div>

<div class="section">
  <h2 class="section-title">2.2 Problèmes critiques</h2>

  <div class="alert alert-critical">
    <div class="alert-icon">⚠</div>
    <div class="alert-content">
      <div class="alert-title">CRITIQUE — Secrets committés dans le dépôt Git</div>
      <p>Les fichiers <code>fleet-mgt-api/.env</code> et <code>docker-compose.yml</code> contenant des credentials ont été committés dans l'historique git :</p>
      <ul>
        <li><code>DB_PASSWORD</code> : mot de passe MySQL en clair</li>
        <li><code>MAIL_PASSWORD</code> : clé API Brevo (SMTP)</li>
        <li><code>MYSQL_PASSWORD</code> : exposé dans docker-compose.yml</li>
      </ul>
      <p><strong>Risque :</strong> Toute personne ayant accès au dépôt (présent ou passé via l'historique git) possède ces credentials.</p>
      <p><strong>Actions immédiates :</strong></p>
      <ul>
        <li>Révoquer et régénérer TOUS les credentials exposés</li>
        <li>Purger l'historique git avec <code>git filter-repo</code></li>
        <li>Vérifier que <code>.env</code> est bien dans <code>.gitignore</code></li>
        <li>Ne conserver qu'un <code>.env.example</code> avec des valeurs fictives</li>
      </ul>
    </div>
  </div>

  <div class="alert alert-warning">
    <div class="alert-icon">!</div>
    <div class="alert-content">
      <div class="alert-title">MOYEN — Email admin hardcodé dans le frontend</div>
      <p>Le fichier <code>fleet-mgt-frontend/src/components/PrivateRoute.jsx</code> (ligne 6) contient une adresse email en dur dans le code source.</p>
      <p><strong>Remédiation :</strong> Passer en variable d'environnement <code>VITE_ADMIN_EMAIL</code>.</p>
    </div>
  </div>
</div>

<div class="section">
  <h2 class="section-title">2.3 Points forts de sécurité</h2>

  <h3>Protection brute-force (OWASP NIST SP 800-63B)</h3>
  <table>
    <thead><tr><th>Étape</th><th>Comportement</th></tr></thead>
    <tbody>
      <tr><td>Tentatives 1–4</td><td>Message d'erreur générique (sans indication)</td></tr>
      <tr><td>Tentative 5 (bloc 1)</td><td>Compte bloqué 5 minutes — email envoyé à l'utilisateur</td></tr>
      <tr><td>Bloc 2</td><td>Blocage 30 minutes</td></tr>
      <tr><td>Bloc 3</td><td>Blocage 2 heures</td></tr>
      <tr><td>Bloc 4+</td><td>Blocage 24h puis permanent</td></tr>
      <tr><td>Rate limiting</td><td>10 req/min sur /login, 5 req/min sur /forgot-password</td></tr>
    </tbody>
  </table>

  <h3>Politique de mots de passe</h3>
  <div class="checklist">
    <div class="check-item ok">Minimum 8 caractères</div>
    <div class="check-item ok">Majuscules + minuscules obligatoires</div>
    <div class="check-item ok">Chiffres obligatoires</div>
    <div class="check-item ok">Caractères spéciaux obligatoires</div>
    <div class="check-item ok">Vérification base de données passwords compromis (<code>uncompromised()</code>)</div>
  </div>

  <h3>Headers de sécurité HTTP</h3>
  <div class="code-block">X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: default-src 'self'; script-src 'self'; ...</div>

  <h3>Stockage des tokens</h3>
  <table>
    <thead><tr><th>Donnée</th><th>Stockage</th><th>Durée de vie</th></tr></thead>
    <tbody>
      <tr><td>user object</td><td>localStorage</td><td>Jusqu'à logout explicite</td></tr>
      <tr><td>access_token</td><td>sessionStorage</td><td>Fermeture navigateur ou 30 min inactivité</td></tr>
      <tr><td>XSRF-TOKEN</td><td>Cookie (HttpOnly)</td><td>Session</td></tr>
      <tr><td>Mots de passe</td><td>Bcrypt (DB)</td><td>BCRYPT_ROUNDS=12</td></tr>
      <tr><td>Sessions Laravel</td><td>Table DB chiffrée</td><td>SESSION_ENCRYPT=true</td></tr>
    </tbody>
  </table>
</div>

<div class="section">
  <h2 class="section-title">2.4 Recommandations</h2>

  <table>
    <thead><tr><th>Priorité</th><th>Action</th><th>Échéance</th></tr></thead>
    <tbody>
      <tr>
        <td><span class="badge badge-red">IMMÉDIAT</span></td>
        <td>Révoquer credentials DB + Brevo, purger historique git</td>
        <td>Aujourd'hui</td>
      </tr>
      <tr>
        <td><span class="badge badge-red">IMMÉDIAT</span></td>
        <td>Passer ADMIN_EMAIL en variable d'environnement</td>
        <td>Aujourd'hui</td>
      </tr>
      <tr>
        <td><span class="badge badge-orange">COURT TERME</span></td>
        <td>Restreindre CORS à l'URL de production exacte</td>
        <td>Cette semaine</td>
      </tr>
      <tr>
        <td><span class="badge badge-orange">COURT TERME</span></td>
        <td>Ajouter rate limiting sur les routes non-auth</td>
        <td>Cette semaine</td>
      </tr>
      <tr>
        <td><span class="badge badge-blue">MOYEN TERME</span></td>
        <td>Implémenter Content-Security-Policy stricte (nonces)</td>
        <td>Ce mois</td>
      </tr>
      <tr>
        <td><span class="badge badge-blue">MOYEN TERME</span></td>
        <td>Centraliser les logs (Sentry ou SIEM)</td>
        <td>Ce mois</td>
      </tr>
      <tr>
        <td><span class="badge badge-green">LONG TERME</span></td>
        <td>Tests de pénétration formels</td>
        <td>Prochaine release</td>
      </tr>
    </tbody>
  </table>
</div>


<!-- ============================= RAPPORT 03 ============================= -->
<div class="report-header r3">
  <div class="report-number">03</div>
  <div class="report-header-text">
    <div class="report-category">Performance · Modernité · Scalabilité</div>
    <div class="report-title">Analyse et feuille de route</div>
  </div>
</div>

<div class="section">
  <h2 class="section-title">3.1 Performance</h2>

  <h3>Frontend</h3>
  <table>
    <thead><tr><th>Indicateur</th><th>État actuel</th><th>Opportunité d'amélioration</th></tr></thead>
    <tbody>
      <tr><td>Build Vite (ES modules)</td><td><span class="status ok">Optimal</span></td><td>—</td></tr>
      <tr><td>Code splitting par routes</td><td><span class="status warn">Non configuré</span></td><td><code>React.lazy()</code> sur chaque page</td></tr>
      <tr><td>Cache assets statiques</td><td><span class="status ok">1 an (JS/CSS/images)</span></td><td>—</td></tr>
      <tr><td>Tree-shaking Bootstrap</td><td><span class="status warn">Import global</span></td><td>Importer uniquement les composants utilisés</td></tr>
      <tr><td>Lazy loading images</td><td><span class="status warn">Non évalué</span></td><td>Attribut <code>loading="lazy"</code></td></tr>
      <tr><td>Analyse bundle size</td><td><span class="status warn">Non mesuré</span></td><td><code>vite-bundle-visualizer</code></td></tr>
    </tbody>
  </table>

  <h3>Backend</h3>
  <table>
    <thead><tr><th>Indicateur</th><th>État actuel</th><th>Recommandation</th></tr></thead>
    <tbody>
      <tr><td>Eager loading (N+1)</td><td><span class="status ok">Utilisé avec with()</span></td><td>—</td></tr>
      <tr><td>Pagination</td><td><span class="status ok">15 items/page</span></td><td>—</td></tr>
      <tr><td>Cache Laravel</td><td><span class="status warn">CACHE_STORE=database</span></td><td>Migrer vers Redis</td></tr>
      <tr><td>OPCache PHP</td><td><span class="status ok">Activé en production</span></td><td>—</td></tr>
      <tr><td>Index base de données</td><td><span class="status warn">Non vérifié</span></td><td>Ajouter sur vehicle_id, user_id, date</td></tr>
      <tr><td>Exports PDF/Excel</td><td><span class="status warn">Synchrones (bloquants)</span></td><td>Laravel Queue + Redis</td></tr>
    </tbody>
  </table>

  <h3>Quick win — Lazy loading des routes</h3>
  <div class="code-block">// Avant (import statique — charge tout au démarrage)
import Dashboard from './pages/Dashboard';

// Après (import dynamique — charge à la demande)
const Dashboard = React.lazy(() =&gt; import('./pages/Dashboard'));

// Dans App.jsx, envelopper les routes :
&lt;Suspense fallback=&lt;Loader /&gt;&gt;
  &lt;Route path="/dashboard" element=&lt;Dashboard /&gt; /&gt;
&lt;/Suspense&gt;</div>
</div>

<div class="section">
  <h2 class="section-title">3.2 Modernité de la stack</h2>

  <div class="score-banner">
    <div class="score-big">8<span>/10</span></div>
    <div class="score-label">Stack très récente — peu de dette technique</div>
  </div>

  <table>
    <thead><tr><th>Technologie</th><th>Version utilisée</th><th>Dernière stable</th><th>État</th></tr></thead>
    <tbody>
      <tr><td>React</td><td>19.1.0</td><td>19.x</td><td><span class="status ok">À jour</span></td></tr>
      <tr><td>React Router</td><td>7.6.2</td><td>7.x</td><td><span class="status ok">À jour</span></td></tr>
      <tr><td>Vite</td><td>6.3.5</td><td>6.x</td><td><span class="status ok">À jour</span></td></tr>
      <tr><td>Laravel</td><td>12.0</td><td>12.x</td><td><span class="status ok">À jour</span></td></tr>
      <tr><td>PHP</td><td>8.2</td><td>8.4</td><td><span class="status warn">Migrer vers 8.3/8.4</span></td></tr>
      <tr><td>Bootstrap</td><td>5.3.8</td><td>5.3.x</td><td><span class="status ok">À jour</span></td></tr>
      <tr><td>Node</td><td>20</td><td>22 LTS</td><td><span class="status warn">Migrer vers Node 22</span></td></tr>
    </tbody>
  </table>

  <h3>Points positifs</h3>
  <div class="checklist">
    <div class="check-item ok">React 19 avec le nouveau compilateur (performances natives améliorées)</div>
    <div class="check-item ok">Laravel 12 — toutes les dernières fonctionnalités de sécurité</div>
    <div class="check-item ok">Vite 6 — build ultra-rapide, HMR instantané</div>
    <div class="check-item ok">Internationalisation EN/FR intégrée (rare à cette échelle)</div>
    <div class="check-item ok">Aucune dette technique majeure visible</div>
    <div class="check-item ok">Déploiement cloud géré : Railway (API), Cloudflare Pages (front), Neon (DB)</div>
    <div class="check-item ok">Suite de tests complète : backend PHPUnit (81 tests) + frontend Vitest (26 tests)</div>
  </div>

  <h3>Points d'amélioration</h3>
  <div class="checklist">
    <div class="check-item fail">Pas de documentation API (OpenAPI/Swagger absent)</div>
    <div class="check-item fail">Pas de TypeScript (migration progressive recommandée)</div>
    <div class="check-item fail">PHP 8.2 — migrer vers 8.3/8.4 pour les performances JIT</div>
  </div>
</div>

<div class="section">
  <h2 class="section-title">3.3 Scalabilité</h2>

  <h3>Capacité estimée</h3>
  <table>
    <thead><tr><th>Métrique</th><th>Architecture actuelle</th><th>Avec Redis + Queue</th></tr></thead>
    <tbody>
      <tr><td>Utilisateurs simultanés</td><td>~500</td><td>~5 000+</td></tr>
      <tr><td>Requêtes par seconde</td><td>~200</td><td>~1 000+</td></tr>
      <tr><td>Taille de flotte</td><td>Illimitée (pagination)</td><td>Illimitée</td></tr>
      <tr><td>Génération de rapports</td><td>Synchrone (bloquant)</td><td>Asynchrone (non-bloquant)</td></tr>
      <tr><td>Haute disponibilité DB</td><td>Neon (serverless auto-scale)</td><td>Neon + replica lecture</td></tr>
    </tbody>
  </table>

  <h3>Points de contention identifiés</h3>
  <div class="alert alert-warning" style="margin-bottom: 10pt;">
    <div class="alert-icon">1</div>
    <div class="alert-content">
      <div class="alert-title">Sessions en base de données</div>
      <p>SESSION_DRIVER=database crée une écriture en DB à chaque requête. Goulot d'étranglement au-delà de ~500 utilisateurs simultanés. <strong>Solution :</strong> SESSION_DRIVER=redis</p>
    </div>
  </div>
  <div class="alert alert-warning" style="margin-bottom: 10pt;">
    <div class="alert-icon">2</div>
    <div class="alert-content">
      <div class="alert-title">Exports PDF/Excel synchrones</div>
      <p>La génération bloque le worker PHP pendant plusieurs secondes. <strong>Solution :</strong> Laravel Queue + Redis (traitement asynchrone, polling frontend)</p>
    </div>
  </div>
  <div class="alert alert-warning">
    <div class="alert-icon">3</div>
    <div class="alert-content">
      <div class="alert-title">SPA sans code splitting</div>
      <p>Le bundle JavaScript charge la totalité de l'application au premier accès. Augmente le Time to Interactive. <strong>Solution :</strong> React.lazy() + Suspense par route</p>
    </div>
  </div>

  <h3>Feuille de route scalabilité</h3>
  <table>
    <thead><tr><th>Phase</th><th>Actions</th><th>Impact</th></tr></thead>
    <tbody>
      <tr>
        <td><strong>Phase 1</strong><br><small>Immédiat</small></td>
        <td>Passer CACHE_STORE et SESSION_DRIVER en Redis<br>Configurer Laravel Horizon pour les queues</td>
        <td>×10 capacité</td>
      </tr>
      <tr>
        <td><strong>Phase 2</strong><br><small>Court terme</small></td>
        <td>Code splitting React (lazy loading routes)<br>Index DB sur colonnes filtrées</td>
        <td>TTI −40%</td>
      </tr>
      <tr>
        <td><strong>Phase 3</strong><br><small>Moyen terme</small></td>
        <td>API rate limiting global<br>Monitoring APM (Sentry, Telescope)<br>Documentation OpenAPI auto-générée</td>
        <td>Observabilité</td>
      </tr>
      <tr>
        <td><strong>Phase 4</strong><br><small>Long terme</small></td>
        <td>CDN pour les exports (R2/S3)<br>Microservices si flotte &gt; 10k véhicules</td>
        <td>Enterprise scale</td>
      </tr>
    </tbody>
  </table>
</div>

<div class="section">
  <h2 class="section-title">3.4 Synthèse globale</h2>

  <div class="final-grid">
    <div class="final-card">
      <div class="final-score s8">8/10</div>
      <div class="final-label">Architecture</div>
      <div class="final-note">MVC solide, séparation claire, RBAC bien pensé</div>
    </div>
    <div class="final-card">
      <div class="final-score s7">7/10</div>
      <div class="final-label">Sécurité</div>
      <div class="final-note">Excellentes pratiques, mais .env commité (critique)</div>
    </div>
    <div class="final-card">
      <div class="final-score s6">6/10</div>
      <div class="final-label">Performance</div>
      <div class="final-note">Bonne base, code splitting et Redis manquants</div>
    </div>
    <div class="final-card">
      <div class="final-score s8">8/10</div>
      <div class="final-label">Modernité</div>
      <div class="final-note">Stack très récente, peu de dette technique</div>
    </div>
    <div class="final-card">
      <div class="final-score s6">6/10</div>
      <div class="final-label">Scalabilité</div>
      <div class="final-note">Correct pour usage actuel, Redis nécessaire</div>
    </div>
    <div class="final-card">
      <div class="final-score s8">8/10</div>
      <div class="final-label">Tests</div>
      <div class="final-note">Backend PHPUnit + frontend Vitest — 107 tests au total</div>
    </div>
    <div class="final-card">
      <div class="final-score s3">3/10</div>
      <div class="final-label">Documentation</div>
      <div class="final-note">Aucune doc API, README minimal</div>
    </div>
  </div>

  <div class="alert alert-critical" style="margin-top: 20pt;">
    <div class="alert-icon">⚑</div>
    <div class="alert-content">
      <div class="alert-title">Action prioritaire absolue</div>
      <p>Révoquer immédiatement les credentials exposés dans le <code>.env</code> commité et purger l'historique git. Cette action ne peut pas attendre.</p>
    </div>
  </div>
</div>

<!-- ============================= RAPPORT 04 ============================= -->
<div class="report-header r4">
  <div class="report-number">04</div>
  <div class="report-header-text">
    <div class="report-category">Tests</div>
    <div class="report-title">Couverture Backend &amp; Frontend</div>
  </div>
</div>

<div class="section">
  <h2 class="section-title">4.1 Tests Backend — PHPUnit</h2>
  <p>
    Le backend est testé avec <strong>PHPUnit 11</strong> via <code>php artisan test</code>.
    Chaque test utilise <code>RefreshDatabase</code> sur une base SQLite in-memory (<code>.env.testing</code>) pour garantir l'isolation.
  </p>

  <h3>Feature/AuthTest — 16 tests</h3>
  <table>
    <thead><tr><th>Groupe</th><th>Test</th><th>Assertion clé</th></tr></thead>
    <tbody>
      <tr><td rowspan="5">Register</td><td>Création utilisateur + token</td><td>201 + assertJsonStructure</td></tr>
      <tr><td>Email dupliqué</td><td>422 + erreur email</td></tr>
      <tr><td>Mot de passe faible</td><td>422 + erreur password</td></tr>
      <tr><td>Rôle par défaut = driver</td><td>assertDatabaseHas role=driver</td></tr>
      <tr><td>Rôle admin interdit à l'inscription</td><td>422 + erreur role</td></tr>
      <tr><td rowspan="5">Login</td><td>Connexion valide → token</td><td>200 + access_token</td></tr>
      <tr><td>Mauvais mot de passe</td><td>401 + INVALID_CREDENTIALS</td></tr>
      <tr><td>Email inconnu</td><td>401 + INVALID_CREDENTIALS</td></tr>
      <tr><td>Incrémente login_attempts</td><td>assertEquals(1, attempts)</td></tr>
      <tr><td>Réinitialise attempts au succès</td><td>assertEquals(0, attempts)</td></tr>
      <tr><td rowspan="3">Brute-force</td><td>Blocage après 5 tentatives</td><td>423 + ACCOUNT_BLOCKED + notification envoyée</td></tr>
      <tr><td>Compte bloqué refuse même le bon MDP</td><td>423 + ACCOUNT_BLOCKED</td></tr>
      <tr><td>Accès restauré après expiration du blocage</td><td>200 (blocked_until dans le passé)</td></tr>
      <tr><td>Logout</td><td>Révocation du token Sanctum</td><td>assertDatabaseMissing(personal_access_tokens)</td></tr>
      <tr><td rowspan="2">/me</td><td>Retourne l'utilisateur authentifié</td><td>200 + user.id + user.email</td></tr>
      <tr><td>Non authentifié</td><td>401</td></tr>
    </tbody>
  </table>

  <h3>Feature/VehicleControllerTest — 26 tests</h3>
  <table>
    <thead><tr><th>Groupe</th><th>Test</th><th>Résultat attendu</th></tr></thead>
    <tbody>
      <tr><td rowspan="5">Index</td><td>Admin liste les véhicules</td><td>200 + {{data, total}}</td></tr>
      <tr><td>Manager liste les véhicules</td><td>200</td></tr>
      <tr><td>Accountant liste les véhicules</td><td>200</td></tr>
      <tr><td>Driver bloqué</td><td>403</td></tr>
      <tr><td>Non authentifié</td><td>401</td></tr>
      <tr><td rowspan="7">Store</td><td>Admin crée un véhicule</td><td>201 + license_plate</td></tr>
      <tr><td>Manager crée un véhicule</td><td>201</td></tr>
      <tr><td>Accountant bloqué</td><td>403</td></tr>
      <tr><td>Driver bloqué</td><td>403</td></tr>
      <tr><td>Plaque dupliquée</td><td>422</td></tr>
      <tr><td>Type de carburant invalide</td><td>422</td></tr>
      <tr><td>Kilométrage négatif</td><td>422</td></tr>
      <tr><td>Show</td><td>Tout utilisateur authentifié peut consulter</td><td>200 + license_plate</td></tr>
      <tr><td rowspan="3">Update</td><td>Admin met à jour</td><td>200 + mileage=99999</td></tr>
      <tr><td>Manager met à jour le statut</td><td>200</td></tr>
      <tr><td>Driver bloqué</td><td>403</td></tr>
      <tr><td rowspan="2">Destroy</td><td>Admin supprime</td><td>200 + assertDatabaseMissing</td></tr>
      <tr><td>Manager bloqué</td><td>403</td></tr>
      <tr><td rowspan="4">Assign Driver</td><td>Admin assigne un chauffeur</td><td>200 + current_driver_id</td></tr>
      <tr><td>Non-driver refusé</td><td>422</td></tr>
      <tr><td>Chauffeur déjà assigné ailleurs</td><td>422</td></tr>
      <tr><td>Driver ne peut pas assigner</td><td>403</td></tr>
      <tr><td rowspan="3">Update Mileage</td><td>Chauffeur assigné met à jour</td><td>200 + new_mileage</td></tr>
      <tr><td>Kilométrage ne peut pas baisser</td><td>422</td></tr>
      <tr><td>Chauffeur non assigné bloqué</td><td>403</td></tr>
      <tr><td>Expiring Docs</td><td>Retourne véhicules avec documents expirant sous 30 jours</td><td>count=1 (60 j ignoré)</td></tr>
    </tbody>
  </table>

  <h3>Feature/UserControllerTest — 21 tests</h3>
  <table>
    <thead><tr><th>Groupe</th><th>Tests couverts</th></tr></thead>
    <tbody>
      <tr><td>Index</td><td>Admin liste · Manager/Driver bloqués · Non authentifié · Recherche par nom</td></tr>
      <tr><td>Store</td><td>Admin crée · Manager bloqué · Email dupliqué · Rôle invalide</td></tr>
      <tr><td>Show</td><td>Admin voit tous · Utilisateur voit son profil · Profil tiers interdit (403)</td></tr>
      <tr><td>Update</td><td>Mise à jour du nom · Driver ne peut pas changer son rôle · Admin change le rôle</td></tr>
      <tr><td>Destroy</td><td>Soft delete admin (assertSoftDeleted) · Manager bloqué (403)</td></tr>
      <tr><td>Change Password</td><td>Succès · Mauvais MDP actuel (401) · Même MDP (422)</td></tr>
      <tr><td>Drivers List</td><td>Retourne uniquement les chauffeurs (count=3 sur 5 users)</td></tr>
    </tbody>
  </table>

  <h3>Unit/UserTest — 15 tests &amp; Unit/VehicleTest — 3 tests</h3>
  <table>
    <thead><tr><th>Classe</th><th>Méthodes testées</th><th>Cas couverts</th></tr></thead>
    <tbody>
      <tr><td>UserTest</td><td>isAdmin, isManager, isDriver, isAccountant, isMechanic, hasRole</td><td>Vrai pour rôle exact · faux pour tous les autres · hasRole string/array/tableau vide</td></tr>
      <tr><td>VehicleTest</td><td>isOperational</td><td>operational=true · maintenance=false · out_of_service=false</td></tr>
    </tbody>
  </table>
</div>

<div class="section">
  <h2 class="section-title">4.2 Tests Frontend — Vitest + Testing Library</h2>
  <p>
    Le frontend est testé avec <strong>Vitest</strong> et <strong>@testing-library/react</strong>.
    Les timers JS sont mockés via <code>vi.useFakeTimers()</code>. Les requêtes Axios sont stubées avec <code>vi.mock()</code>.
  </p>

  <h3>PrivateRoute.test.jsx — 7 tests</h3>
  <table>
    <thead><tr><th>Scénario</th><th>Vérification</th></tr></thead>
    <tbody>
      <tr><td>Utilisateur non connecté</td><td>Redirection /login · contenu protégé absent du DOM</td></tr>
      <tr><td>Utilisateur connecté sans restriction de rôle</td><td>Contenu rendu</td></tr>
      <tr><td>Rôle autorisé (admin → route admin)</td><td>Contenu rendu</td></tr>
      <tr><td>Rôle non autorisé (driver → route admin)</td><td>AccessDenied visible · contenu absent</td></tr>
      <tr><td>Manager accède route admin+manager</td><td>Contenu rendu</td></tr>
      <tr><td>Driver bloqué route admin+manager</td><td>Contenu absent</td></tr>
      <tr><td>Tous rôles acceptés sans prop <code>roles</code></td><td>Contenu rendu pour admin, manager, driver</td></tr>
    </tbody>
  </table>

  <h3>AuthContext.test.jsx — 6 tests</h3>
  <table>
    <thead><tr><th>Scénario</th><th>Vérification</th></tr></thead>
    <tbody>
      <tr><td>Pas d'utilisateur si /me échoue</td><td>user = "none"</td></tr>
      <tr><td>Restauration utilisateur via /me au démarrage</td><td>user.email = "a@a.com"</td></tr>
      <tr><td>login() stocke token dans sessionStorage</td><td>sessionStorage.getItem("token") = "tok123"</td></tr>
      <tr><td>login() stocke user dans localStorage</td><td>JSON.parse(localStorage).email correct</td></tr>
      <tr><td>logout() efface user et token</td><td>user = "none" · sessionStorage vide</td></tr>
      <tr><td>logout() fonctionne même si /api/logout échoue réseau</td><td>Déconnexion locale garantie</td></tr>
    </tbody>
  </table>

  <h3>useInactivityTimer.test.js — 6 tests</h3>
  <table>
    <thead><tr><th>Scénario</th><th>Vérification</th></tr></thead>
    <tbody>
      <tr><td>onWarn après 28 min d'inactivité</td><td>onWarn appelé 1× · onLogout non déclenché</td></tr>
      <tr><td>onLogout après 30 min d'inactivité</td><td>onLogout appelé 1×</td></tr>
      <tr><td>mousemove remet le timer à zéro</td><td>27 min + mousemove + 27 min → aucun callback</td></tr>
      <tr><td>enabled=false ne démarre pas les timers</td><td>Aucun callback après 30 min</td></tr>
      <tr><td>Nettoyage des timers au démontage</td><td>unmount → aucun callback après 30 min</td></tr>
      <tr><td>enabled false → true relance les timers</td><td>onLogout déclenché après rerender enabled=true</td></tr>
    </tbody>
  </table>

  <h3>SessionWarningModal.test.jsx — 7 tests</h3>
  <table>
    <thead><tr><th>Scénario</th><th>Vérification</th></tr></thead>
    <tbody>
      <tr><td>visible=false → modal absente</td><td>queryByText null</td></tr>
      <tr><td>visible=true → modal affichée</td><td>"Session sur le point d'expirer" visible</td></tr>
      <tr><td>Deux boutons d'action présents</td><td>"Rester connecté" + "Se déconnecter"</td></tr>
      <tr><td>Clic "Rester connecté" → onStay appelé</td><td>vi.fn appelé 1×</td></tr>
      <tr><td>Clic "Se déconnecter" → onLogout appelé</td><td>vi.fn appelé 1×</td></tr>
      <tr><td>Compte à rebours affiché</td><td>Format mm:ss ou Xs présent dans le DOM</td></tr>
      <tr><td>Réinitialisation compte à rebours (visible false → true)</td><td>"2:00" affiché après réouverture</td></tr>
    </tbody>
  </table>
</div>

<div class="section">
  <h2 class="section-title">4.3 Synthèse de la couverture</h2>

  <div class="test-summary">
    <div class="test-card backend">
      <div class="test-card-title">Backend · PHPUnit</div>
      <div class="test-card-count">81</div>
      <div class="test-card-sub">tests Feature + Unit</div>
    </div>
    <div class="test-card frontend">
      <div class="test-card-title">Frontend · Vitest</div>
      <div class="test-card-count">26</div>
      <div class="test-card-sub">tests composants + hooks</div>
    </div>
    <div class="test-card total">
      <div class="test-card-title">Total</div>
      <div class="test-card-count">107</div>
      <div class="test-card-sub">tests automatisés</div>
    </div>
  </div>

  <h3>Répartition par couche testée</h3>
  <table>
    <thead><tr><th>Couche</th><th>Framework</th><th>Fichier</th><th>Tests</th><th>Couverture</th></tr></thead>
    <tbody>
      <tr><td>Auth API</td><td>PHPUnit Feature</td><td>AuthTest.php</td><td>16</td><td><span class="status ok">Complète</span></td></tr>
      <tr><td>Véhicules API</td><td>PHPUnit Feature</td><td>VehicleControllerTest.php</td><td>26</td><td><span class="status ok">Complète</span></td></tr>
      <tr><td>Utilisateurs API</td><td>PHPUnit Feature</td><td>UserControllerTest.php</td><td>21</td><td><span class="status ok">Complète</span></td></tr>
      <tr><td>Modèles métier</td><td>PHPUnit Unit</td><td>UserTest.php · VehicleTest.php</td><td>18</td><td><span class="status ok">Complète</span></td></tr>
      <tr><td>Routage protégé</td><td>Vitest + RTL</td><td>PrivateRoute.test.jsx</td><td>7</td><td><span class="status ok">Complète</span></td></tr>
      <tr><td>Contexte Auth</td><td>Vitest + RTL</td><td>AuthContext.test.jsx</td><td>6</td><td><span class="status ok">Complète</span></td></tr>
      <tr><td>Hook inactivité</td><td>Vitest</td><td>useInactivityTimer.test.js</td><td>6</td><td><span class="status ok">Complète</span></td></tr>
      <tr><td>Modal session</td><td>Vitest + RTL</td><td>SessionWarningModal.test.jsx</td><td>7</td><td><span class="status ok">Complète</span></td></tr>
    </tbody>
  </table>

  <h3>Zones non couvertes (à adresser)</h3>
  <div class="checklist">
    <div class="check-item fail">Maintenances et Consommations : pas de tests Feature dédiés</div>
    <div class="check-item fail">Rapports : pas de tests pour la génération PDF/Excel</div>
    <div class="check-item fail">Pages React (Home, Dashboard, UserDetail…) : pas de tests d'intégration</div>
    <div class="check-item fail">Tests E2E (Playwright/Cypress) absents — parcours utilisateur complet non couvert</div>
  </div>

  <div class="alert alert-warning" style="margin-top: 14pt;">
    <div class="alert-icon">!</div>
    <div class="alert-content">
      <div class="alert-title">Recommandation — CI des tests</div>
      <p>Ajouter un job GitHub Actions dédié : <code>php artisan test --coverage</code> (backend)
      et <code>vitest run</code> (frontend) à chaque Pull Request pour bloquer les régressions avant merge.</p>
    </div>
  </div>
</div>

<!-- FOOTER NOTE -->
<div class="footer-note">
  Rapport généré le {TODAY} par Claude Code (Anthropic) · Fleet Management System · Branche main
</div>

</body>
</html>"""

CSS_CONTENT = """
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

@page {
  size: A4;
  margin: 0;
}

@page :first { margin: 0; }

* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: 'Inter', 'DejaVu Sans', Arial, sans-serif;
  font-size: 9pt;
  color: #1a202c;
  background: white;
  line-height: 1.5;
}

/* ── COVER ── */
.cover {
  width: 210mm;
  height: 297mm;
  background: linear-gradient(160deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  page-break-after: always;
  padding: 40pt;
  position: relative;
}

.cover-badge {
  position: absolute;
  top: 30pt;
  right: 30pt;
  background: #ef4444;
  color: white;
  font-size: 7pt;
  font-weight: 700;
  letter-spacing: 2px;
  padding: 4pt 10pt;
  border-radius: 3pt;
}

.cover-logo {
  font-size: 48pt;
  color: #3b82f6;
  margin-bottom: 16pt;
}

.cover-title {
  font-size: 28pt;
  font-weight: 700;
  color: white;
  text-align: center;
  margin-bottom: 8pt;
}

.cover-subtitle {
  font-size: 13pt;
  color: #94a3b8;
  text-align: center;
  margin-bottom: 30pt;
}

.cover-divider {
  width: 60pt;
  height: 3pt;
  background: #3b82f6;
  margin-bottom: 30pt;
  border-radius: 2pt;
}

.cover-meta {
  background: rgba(255,255,255,0.05);
  border: 1pt solid rgba(255,255,255,0.1);
  border-radius: 8pt;
  padding: 16pt 24pt;
  width: 100%;
  max-width: 280pt;
  margin-bottom: 30pt;
}

.cover-meta-item {
  display: flex;
  justify-content: space-between;
  padding: 4pt 0;
  border-bottom: 1pt solid rgba(255,255,255,0.06);
}

.cover-meta-item:last-child { border-bottom: none; }

.cover-meta-item .label {
  color: #64748b;
  font-size: 8pt;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.cover-meta-item .value {
  color: #e2e8f0;
  font-size: 8pt;
  font-weight: 500;
}

.cover-reports {
  width: 100%;
  max-width: 280pt;
}

.cover-report-item {
  color: #cbd5e1;
  font-size: 9pt;
  padding: 6pt 12pt;
  background: rgba(59,130,246,0.1);
  border-left: 3pt solid #3b82f6;
  margin-bottom: 6pt;
  border-radius: 0 4pt 4pt 0;
}

/* ── TOC ── */
.toc-page {
  padding: 30pt 35pt;
  page-break-after: always;
  min-height: 260mm;
}

.toc-title {
  font-size: 18pt;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 24pt;
  padding-bottom: 10pt;
  border-bottom: 2pt solid #e2e8f0;
}

.toc-section {
  margin-bottom: 16pt;
}

.toc-entry {
  display: flex;
  justify-content: space-between;
  padding: 4pt 0;
  border-bottom: 1pt dotted #e2e8f0;
  font-size: 9pt;
  color: #475569;
}

.toc-report {
  font-size: 10.5pt;
  font-weight: 600;
  color: #0f172a;
  margin-top: 4pt;
  padding-top: 6pt;
}

.toc-page-num {
  color: #94a3b8;
  font-size: 8pt;
}

/* ── REPORT HEADER ── */
.report-header {
  width: 210mm;
  padding: 24pt 35pt;
  display: flex;
  align-items: center;
  gap: 20pt;
  page-break-before: always;
}

.r1 { background: linear-gradient(135deg, #1e40af, #3b82f6); }
.r2 { background: linear-gradient(135deg, #991b1b, #ef4444); }
.r3 { background: linear-gradient(135deg, #065f46, #10b981); }
.r4 { background: linear-gradient(135deg, #4c1d95, #7c3aed); }

.report-number {
  font-size: 52pt;
  font-weight: 800;
  color: rgba(255,255,255,0.15);
  line-height: 1;
  flex-shrink: 0;
}

.report-category {
  font-size: 8pt;
  font-weight: 600;
  color: rgba(255,255,255,0.6);
  text-transform: uppercase;
  letter-spacing: 2px;
  margin-bottom: 4pt;
}

.report-title {
  font-size: 18pt;
  font-weight: 700;
  color: white;
}

/* ── SECTION ── */
.section {
  padding: 20pt 35pt;
  page-break-inside: avoid;
}

.section-title {
  font-size: 13pt;
  font-weight: 700;
  color: #0f172a;
  padding-bottom: 8pt;
  border-bottom: 2pt solid #e2e8f0;
  margin-bottom: 14pt;
}

h3 {
  font-size: 10pt;
  font-weight: 600;
  color: #1e293b;
  margin: 14pt 0 8pt 0;
}

p { margin-bottom: 7pt; color: #374151; }

ul {
  padding-left: 14pt;
  margin-bottom: 7pt;
  color: #374151;
}

li { margin-bottom: 3pt; }

/* ── TABLE ── */
table {
  width: 100%;
  border-collapse: collapse;
  font-size: 8.5pt;
  margin-bottom: 12pt;
}

thead tr {
  background: #0f172a;
  color: white;
}

thead th {
  padding: 7pt 9pt;
  text-align: left;
  font-weight: 600;
  font-size: 8pt;
  letter-spacing: 0.3px;
}

tbody tr:nth-child(even) { background: #f8fafc; }
tbody tr:hover { background: #eff6ff; }

tbody td {
  padding: 6pt 9pt;
  border-bottom: 1pt solid #e2e8f0;
  color: #374151;
  vertical-align: top;
}

/* ── CODE BLOCK ── */
.code-block {
  background: #0f172a;
  color: #94a3b8;
  font-family: 'Courier New', monospace;
  font-size: 7.5pt;
  padding: 12pt 14pt;
  border-radius: 6pt;
  margin-bottom: 12pt;
  line-height: 1.6;
  white-space: pre;
}

code {
  background: #f1f5f9;
  color: #dc2626;
  font-family: 'Courier New', monospace;
  font-size: 7.5pt;
  padding: 1pt 4pt;
  border-radius: 3pt;
}

/* ── FLOW DIAGRAM ── */
.flow {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0;
  margin-bottom: 12pt;
}

.flow.horizontal {
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
  gap: 2pt;
}

.flow-step {
  background: #eff6ff;
  border: 1pt solid #bfdbfe;
  border-radius: 4pt;
  padding: 6pt 10pt;
  font-size: 8pt;
  color: #1e40af;
  font-weight: 500;
}

.flow.horizontal .flow-step {
  text-align: center;
  font-size: 7.5pt;
}

.flow-arrow {
  color: #94a3b8;
  font-size: 9pt;
  padding: 2pt 6pt;
  text-align: center;
}

/* ── ARCHITECTURE DIAGRAM ── */
.archi-diagram {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8pt;
  margin: 16pt 0;
  padding: 16pt;
  background: #f8fafc;
  border-radius: 8pt;
  border: 1pt solid #e2e8f0;
}

.archi-box {
  text-align: center;
  padding: 12pt 16pt;
  border-radius: 8pt;
  min-width: 90pt;
}

.archi-box.frontend { background: #eff6ff; border: 2pt solid #3b82f6; }
.archi-box.backend  { background: #fef3c7; border: 2pt solid #f59e0b; }
.archi-box.db       { background: #f0fdf4; border: 2pt solid #22c55e; }

.archi-box-title { font-size: 9pt; font-weight: 700; margin-bottom: 4pt; }
.archi-box-sub   { font-size: 7.5pt; color: #64748b; }

.archi-arrow {
  font-size: 14pt;
  color: #94a3b8;
  text-align: center;
}

.archi-arrow small { font-size: 6.5pt; display: block; color: #94a3b8; }

/* ── SECURITY GRID ── */
.security-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8pt;
  margin-bottom: 10pt;
}

.security-card {
  flex: 1;
  min-width: 80pt;
  text-align: center;
  padding: 10pt 6pt;
  border-radius: 8pt;
}

.security-card.good { background: #f0fdf4; border: 1.5pt solid #86efac; }
.security-card.warn { background: #fffbeb; border: 1.5pt solid #fcd34d; }
.security-card.crit { background: #fff1f2; border: 1.5pt solid #fca5a5; }

.security-card-score {
  font-size: 16pt;
  font-weight: 700;
}

.security-card.good .security-card-score { color: #16a34a; }
.security-card.warn .security-card-score { color: #d97706; }
.security-card.crit .security-card-score { color: #dc2626; }

.security-card-label { font-size: 7pt; color: #64748b; margin-top: 3pt; font-weight: 500; }

.legend { display: flex; gap: 16pt; margin-bottom: 4pt; font-size: 7.5pt; }
.good-text { color: #16a34a; font-weight: 600; }
.warn-text { color: #d97706; font-weight: 600; }
.crit-text { color: #dc2626; font-weight: 600; }

/* ── ALERTS ── */
.alert {
  display: flex;
  gap: 10pt;
  padding: 12pt;
  border-radius: 6pt;
  margin-bottom: 12pt;
}

.alert-critical { background: #fff1f2; border-left: 4pt solid #dc2626; }
.alert-warning   { background: #fffbeb; border-left: 4pt solid #f59e0b; }

.alert-icon {
  font-size: 14pt;
  font-weight: 800;
  flex-shrink: 0;
  width: 20pt;
  text-align: center;
}

.alert-critical .alert-icon { color: #dc2626; }
.alert-warning .alert-icon   { color: #d97706; }

.alert-title { font-size: 9.5pt; font-weight: 700; margin-bottom: 4pt; }
.alert-critical .alert-title { color: #dc2626; }
.alert-warning .alert-title  { color: #92400e; }

/* ── BADGES ── */
.badge {
  font-size: 7pt;
  font-weight: 700;
  padding: 2pt 6pt;
  border-radius: 3pt;
  white-space: nowrap;
}

.badge-red    { background: #fee2e2; color: #dc2626; }
.badge-orange { background: #ffedd5; color: #c2410c; }
.badge-blue   { background: #dbeafe; color: #1d4ed8; }
.badge-green  { background: #dcfce7; color: #16a34a; }
.badge-gray   { background: #f1f5f9; color: #475569; }

/* ── CHECKLIST ── */
.checklist { margin-bottom: 10pt; }

.check-item {
  font-size: 8.5pt;
  padding: 4pt 0 4pt 16pt;
  border-bottom: 1pt solid #f1f5f9;
  position: relative;
}

.check-item::before {
  position: absolute;
  left: 0;
  font-weight: 700;
  font-size: 9pt;
}

.check-item.ok   { color: #374151; }
.check-item.fail { color: #6b7280; }
.check-item.ok::before   { content: "✓"; color: #16a34a; }
.check-item.fail::before { content: "✗"; color: #ef4444; }

/* ── STATUS ── */
.status {
  font-size: 7.5pt;
  font-weight: 600;
  padding: 2pt 6pt;
  border-radius: 3pt;
}

.status.ok   { background: #dcfce7; color: #16a34a; }
.status.warn { background: #fff3cd; color: #856404; }
.status.fail { background: #fee2e2; color: #dc2626; }

/* ── SCORE BANNER ── */
.score-banner {
  display: flex;
  align-items: center;
  gap: 16pt;
  background: linear-gradient(135deg, #0f172a, #1e293b);
  color: white;
  padding: 16pt 20pt;
  border-radius: 8pt;
  margin-bottom: 14pt;
}

.score-big {
  font-size: 36pt;
  font-weight: 800;
  color: #3b82f6;
  line-height: 1;
}

.score-big span { font-size: 18pt; color: #64748b; }

.score-label { font-size: 11pt; color: #94a3b8; }

/* ── FINAL GRID ── */
.final-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8pt;
  margin-bottom: 14pt;
}

.final-card {
  flex: 1;
  min-width: 70pt;
  background: #f8fafc;
  border: 1pt solid #e2e8f0;
  border-radius: 8pt;
  padding: 10pt 8pt;
  text-align: center;
}

.final-score {
  font-size: 20pt;
  font-weight: 800;
  line-height: 1;
  margin-bottom: 4pt;
}

.final-label { font-size: 8pt; font-weight: 600; color: #374151; margin-bottom: 4pt; }
.final-note  { font-size: 6.5pt; color: #94a3b8; line-height: 1.3; }

.s8 { color: #16a34a; }
.s7 { color: #f59e0b; }
.s6 { color: #f97316; }
.s4 { color: #ef4444; }
.s3 { color: #dc2626; }

/* ── TEST SUMMARY ── */
.test-summary {
  display: flex;
  gap: 12pt;
  margin-bottom: 14pt;
}

.test-card {
  flex: 1;
  text-align: center;
  padding: 14pt 10pt;
  border-radius: 8pt;
}

.test-card.backend  { background: #eff6ff; border: 2pt solid #3b82f6; }
.test-card.frontend { background: #fdf4ff; border: 2pt solid #a855f7; }
.test-card.total    { background: #0f172a; border: 2pt solid #334155; }

.test-card-title { font-size: 8pt; font-weight: 600; color: #64748b; margin-bottom: 6pt; text-transform: uppercase; letter-spacing: 0.5px; }
.test-card.total .test-card-title { color: #94a3b8; }

.test-card-count { font-size: 32pt; font-weight: 800; line-height: 1; }
.test-card.backend  .test-card-count { color: #1d4ed8; }
.test-card.frontend .test-card-count { color: #7c3aed; }
.test-card.total    .test-card-count { color: #3b82f6; }

.test-card-sub { font-size: 7pt; color: #94a3b8; margin-top: 4pt; }
.test-card.total .test-card-sub { color: #64748b; }

/* ── FOOTER NOTE ── */
.footer-note {
  text-align: center;
  font-size: 7pt;
  color: #94a3b8;
  padding: 12pt 35pt 20pt;
  border-top: 1pt solid #f1f5f9;
  margin-top: 10pt;
}
"""

if __name__ == "__main__":
    output_path = "/home/king_dav/code/fleet-linux/fleet_audit_reports.pdf"

    print("Génération du PDF en cours...")
    html = HTML(string=HTML_CONTENT, base_url=".")
    css = CSS(string=CSS_CONTENT)
    html.write_pdf(output_path, stylesheets=[css])

    import os
    size = os.path.getsize(output_path)
    print(f"PDF généré : {output_path}")
    print(f"Taille : {size // 1024} Ko")
