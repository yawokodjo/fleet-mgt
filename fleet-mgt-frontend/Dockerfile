# Utiliser l'image officielle Node 20
FROM node:20

# Définir le dossier de travail
WORKDIR /app

# Copier uniquement package.json et package-lock.json pour un build rapide
COPY package*.json ./

# Installer les dépendances, y compris Tailwind CSS
RUN npm install

# Copier le reste du projet
COPY . .

# Exposer le port de Vite
EXPOSE 5173

# Commande par défaut pour démarrer Vite en développement
CMD ["npx", "vite", "--host", "0.0.0.0", "--port", "5173"]
