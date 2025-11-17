# 🗨️ Projet Forum Next.js

## 📖 Contexte

L’objectif du projet est de concevoir et développer un **forum web moderne** permettant aux utilisateurs d’échanger publiquement ou en privé autour de différentes thématiques.  
La plateforme se veut **ouverte à tous pour la lecture** des conversations publiques, tout en réservant la **participation et les fonctionnalités avancées** (création de discussions, réponses, conversations privées, gestion de profil) aux utilisateurs authentifiés.

Le forum doit proposer une **expérience fluide et réactive**, une **authentification sécurisée**, un **système de catégorisation par tags**, et une **interface claire** pour naviguer entre les discussions.

---

## ⚙️ Stack technique

| Élément                       | Outil / Technologie                            | Description                                              |
| ----------------------------- | ---------------------------------------------- | -------------------------------------------------------- |
| **Framework Front + Back**    | [Next.js](https://nextjs.org/)                 | Application fullstack (SSR + API Routes REST)            |
| **Base de données**           | [PostgreSQL (Supabase)](https://supabase.com/) | Stockage des utilisateurs, conversations, messages, tags |
| **ORM**                       | [Prisma](https://www.prisma.io/)               | Gestion du schéma et des requêtes vers la base           |
| **Authentification**          | [Auth.js (NextAuth)](https://authjs.dev/)      | Authentification sécurisée (email/password ou providers) |
| **Hébergement du Front/Back** | [Vercel](https://vercel.com/)                  | Déploiement de l’application Next.js                     |
| **Hébergement BDD + Storage** | [Supabase](https://supabase.com/)              | Stockage des données et des images de profil             |
| **Stockage fichiers**         | Supabase Storage                               | Gestion des avatars et images liées aux conversations    |
| **Langage**                   | TypeScript                                     | Sécurité et robustesse du code                           |
| **Styles**                    | Tailwind CSS                                   | Mise en page et design responsive                        |
| **API**                       | REST (via `/api/*`)                            | Communication entre front et back                        |

---

## 🧩 Description fonctionnelle

### 1. Accueil (Page publique)

- Liste **toutes les conversations publiques** du forum.
- Chaque conversation affiche :
  - Le **titre**
  - Le **nombre de réponses**
  - Les **tags** associés
  - Le **dernier message** (aperçu)
- Un **filtrage** par tags permet de naviguer facilement entre les catégories.

---

### 2. Authentification & Profil utilisateur

- Un utilisateur peut :
  - **Créer un compte** via Auth.js
  - **Se connecter / se déconnecter**
  - **Accéder à ses paramètres** pour :
    - Modifier ses informations personnelles (pseudo, bio, avatar)
    - Consulter ses conversations et réponses
- L’accès à certaines actions (répondre, créer une conversation, envoyer un message privé) nécessite d’être **connecté**.

---

### 3. Conversations publiques

- Les conversations publiques sont **visibles par tous**.
- Seuls les utilisateurs **authentifiés** peuvent :
  - **Répondre** à une conversation
  - **Créer** une nouvelle conversation
  - **Ajouter des tags** à leur publication
- Les réponses sont affichées de manière chronologique.

---

### 4. Conversations privées

- Un utilisateur peut créer une **conversation privée** avec un autre utilisateur.
- Ces discussions ne sont visibles **que par les deux participants**.
- Notifications visuelles pour les nouveaux messages.

---

### 5. Tags & Filtrage

- Chaque conversation publique peut être associée à un ou plusieurs **tags**.
- Un système de **filtrage dynamique** permet d’afficher les conversations selon un ou plusieurs tags sélectionnés.
- Exemple de tags : `#général`, `#entraide`, `#tech`, `#offtopic`.

---

### 6. Espace utilisateur

- **Tableau de bord** personnel affichant :
  - Les **conversations créées**
  - Les **réponses postées**
  - Les **messages privés récents**
- Possibilité de **supprimer / modifier** ses propres conversations ou messages.

---

## Modèle de données

### Conversation

- `id` - Identifiant unique (CUID)
- `title` - Titre de la conversation (optionnel)
- `messages` - Relation avec les messages
- `createdAt`, `updatedAt`, `deletedAt`, `archivedAt` - Timestamps

### Message

- `id` - Identifiant unique (CUID)
- `content` - Contenu du message
- `conversationId` - Référence à la conversation
- `createdAt`, `updatedAt`, `deletedAt`, `archivedAt` - Timestamps

## Prérequis

- [Node.js](https://nodejs.org/) (v18 ou supérieur)
- [Docker](https://www.docker.com/) et Docker Compose
- npm ou yarn

## Installation

### 1. Cloner le projet

```bash
git clone <url-du-repo>
cd nextjs-forum
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configuration de l'environnement

Créer un fichier `.env.local` à la racine du projet :

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/forum?schema=public"
```

> **Note :** Utilisez `.env.local` pour vos variables d'environnement locales. Ce fichier est automatiquement ignoré par Git et ne sera pas commité.

### 4. Démarrer la base de données

Lancer PostgreSQL et Adminer via Docker :

```bash
docker compose up -d
```

Services disponibles :

- **PostgreSQL** : `localhost:5432`
- **Adminer** (interface d'administration) : `http://localhost:8080`

### 5. Initialiser la base de données

Créer les tables à partir du schéma Prisma :

```bash
npm run prisma:push
```

Ou créer une migration :

```bash
npm run prisma:migrate -- --name init
```

### 6. Générer le client Prisma

```bash
npm run prisma:generate
```

### 7. Peupler la base de données (optionnel)

Générer des données de test (10 conversations avec 5 messages chacune) :

```bash
npm run seed
```

### 8. Lancer l'application

```bash
npm run dev
```

L'application sera accessible sur `http://localhost:3000`

## Commandes utiles

### Développement

```bash
npm run dev          # Démarrer le serveur de développement
npm run build        # Compiler le projet pour la production
npm run start        # Démarrer le serveur de production
npm run lint         # Linter le code
```

### Prisma

> **Note :** Utilisez les scripts npm ci-dessous qui chargent automatiquement `.env.local`. Si vous utilisez directement `npx prisma`, assurez-vous que `DATABASE_URL` est disponible.

```bash
npm run prisma:studio          # Ouvrir l'interface graphique Prisma
npm run prisma:push            # Synchroniser le schéma sans migration
npm run prisma:migrate         # Créer et appliquer une migration
npm run prisma:reset           # Réinitialiser la base de données
npm run prisma:generate        # Générer le client Prisma
npm run prisma:validate        # Valider le schéma Prisma
npm run seed                   # Peupler la base de données
```

### Docker

```bash
docker compose up -d           # Démarrer les services
docker compose down            # Arrêter les services
docker compose logs -f         # Voir les logs en temps réel
```

## Accès à Adminer

Adminer est un outil d'administration de base de données accessible via le navigateur :

- URL : `http://localhost:8080`
- Système : `PostgreSQL`
- Serveur : `postgres`
- Utilisateur : `postgres`
- Mot de passe : `postgres`
- Base de données : `forum`

## Architecture

Ce projet utilise :

- **App Router** de Next.js 15 avec routes groupées `(private)` pour les pages protégées
- **Server Components** par défaut pour de meilleures performances
- **Prisma Client** personnalisé généré dans `src/generated/prisma`
- **Tailwind CSS v4** pour le styling
- **ESLint** pour la qualité du code

## Réinitialiser les données

Pour réinitialiser complètement la base de données :

```bash
npx prisma migrate reset --force
```

Cette commande va :

1. Supprimer la base de données
2. Recréer la base de données
3. Appliquer toutes les migrations
4. Exécuter le script de seed automatiquement

## Contribution

1. Fork le projet
2. Créer une branche pour votre fonctionnalité (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

🗨️ Projet Forum Next.js
📖 Contexte

L’objectif du projet est de concevoir et développer un forum web moderne permettant aux utilisateurs d’échanger publiquement ou en privé autour de différentes thématiques.
La plateforme se veut ouverte à tous pour la lecture des conversations publiques, tout en réservant la participation et les fonctionnalités avancées (création de discussions, réponses, conversations privées, gestion de profil) aux utilisateurs authentifiés.

Le forum doit proposer une expérience fluide et réactive, une authentification sécurisée, un système de catégorisation par tags, et une interface claire pour naviguer entre les discussions.

# TODO

## 🔐 Implémentation du système d'authentification

### Contexte

Le forum actuel ne possède pas de système d'authentification. Votre mission est d'implémenter un système d'authentification complet permettant de sécuriser l'application et de gérer les privilèges utilisateurs.

Vous avez le **choix** entre deux solutions :

- **Better Auth** (recommandé pour débutants - setup plus simple)
- **NextAuth v5 (Auth.js)** (plus mature mais complexe)

---

### 📋 Phase 1 : Setup de l'authentification de base

**Objectifs :**

- Ajouter un modèle `User` au schéma Prisma
- Configurer la solution d'authentification choisie
- Implémenter l'inscription (Sign Up)
- Implémenter la connexion (Sign In)
- Créer les pages/composants UI nécessaires

**Tâches détaillées :**

1. **Modifier le schéma Prisma** (`prisma/schema.prisma`)

   - Créer le modèle `User` avec les champs :
     - `id` (String, @id, @default(cuid()))
     - `email` (String, @unique)
     - `password` (String, haché)
     - `name` (String, optionnel)
     - `avatar` (String, optionnel)
     - `bio` (String, optionnel)
     - `createdAt` (DateTime, @default(now()))
     - `updatedAt` (DateTime, @updatedAt)
   - Exécuter les migrations Prisma

2. **Installer et configurer la bibliothèque d'authentification**

   **Option A : Better Auth**

   ```bash
   npm install better-auth
   ```

   - Configurer Better Auth selon la documentation officielle
   - Créer le fichier de configuration avec email/password provider
   - Configurer la connexion à la base de données PostgreSQL

   **Option B : NextAuth v5 (Auth.js)**

   ```bash
   npm install next-auth@beta
   ```

   - Configurer Auth.js selon la documentation v5
   - Mettre en place le Credentials Provider
   - Configurer les callbacks et sessions

3. **Implémenter le hachage des mots de passe**

   - Installer `bcrypt` ou `argon2`
   - Créer des fonctions utilitaires pour hasher/vérifier les mots de passe

4. **Créer les routes API d'authentification**

   - POST `/api/auth/signup` - Inscription d'un nouvel utilisateur
   - POST `/api/auth/signin` - Connexion d'un utilisateur
   - POST `/api/auth/signout` - Déconnexion
   - GET `/api/auth/session` - Récupérer la session active

5. **Créer les pages et composants UI**

   - Page `/signup` - Formulaire d'inscription (email + password + name)
   - Page `/signin` - Formulaire de connexion (email + password)
   - Composant Header avec boutons Sign In / Sign Up (si non connecté)
   - Composant Header avec menu utilisateur + Sign Out (si connecté)
   - Gestion des erreurs (email déjà existant, mot de passe incorrect, etc.)

6. **Validation et sécurité**
   - Valider les emails (format valide)
   - Exiger un mot de passe fort (min 8 caractères, etc.)
   - Protéger contre les injections SQL (utiliser Prisma correctement)
   - Ajouter la protection CSRF si nécessaire

**Critères de validation Phase 1 :**

- ✅ Un utilisateur peut créer un compte avec email/password
- ✅ Un utilisateur peut se connecter avec ses identifiants
- ✅ Un utilisateur peut se déconnecter
- ✅ La session est persistante (survit au rafraîchissement de page)
- ✅ Les mots de passe sont correctement hachés en base de données
- ✅ Les erreurs sont affichées clairement (email déjà utilisé, mauvais identifiants, etc.)

---

### 📋 Phase 2 : Relations et contrôle d'accès (Permissions)

**Objectifs :**

- Relier le modèle `User` aux modèles existants (`Conversation`, `Message`)
- Implémenter le contrôle d'accès basé sur la propriété (ownership)
- Protéger les routes et actions selon l'authentification

**Tâches détaillées :**

1. **Modifier le schéma Prisma - Relations**

   - Ajouter `authorId` au modèle `Conversation`
     - Relation `author User @relation(fields: [authorId], references: [id])`
   - Ajouter `authorId` au modèle `Message`
     - Relation `author User @relation(fields: [authorId], references: [id])`
   - Ajouter les relations inverses dans `User` :
     - `conversations Conversation[]`
     - `messages Message[]`
   - Exécuter les migrations

2. **Middleware de protection des routes**

   - Créer un middleware Next.js pour protéger les routes privées
   - Rediriger vers `/signin` si non authentifié
   - Routes à protéger : création de conversation, ajout de message, profil, etc.

3. **Protéger les API Routes**

   - Vérifier l'authentification dans chaque route API sensible
   - POST `/api/conversations` - Nécessite d'être connecté
   - POST `/api/messages` - Nécessite d'être connecté
   - DELETE `/api/conversations/[id]` - Vérifier ownership (author)
   - PATCH `/api/conversations/[id]` - Vérifier ownership
   - DELETE `/api/messages/[id]` - Vérifier ownership
   - PATCH `/api/messages/[id]` - Vérifier ownership

4. **Logique de vérification des privilèges**

   - Créer une fonction utilitaire `isOwner(userId, resourceId)` ou similaire
   - Retourner 403 Forbidden si l'utilisateur n'est pas propriétaire
   - Retourner 401 Unauthorized si non authentifié

5. **Adapter l'interface utilisateur**

   - Afficher les boutons "Nouvelle conversation" uniquement si connecté
   - Afficher le formulaire de réponse uniquement si connecté
   - Afficher les boutons "Modifier" / "Supprimer" uniquement pour ses propres messages/conversations
   - Afficher un message invitant à se connecter pour participer

6. **Gestion des conversations en lecture publique**

   - Les conversations publiques restent **visibles par tous** (non authentifiés inclus)
   - GET `/api/conversations` - Accessible sans authentification
   - GET `/api/conversations/[id]` - Accessible sans authentification
   - Seules les actions de création/modification/suppression nécessitent une authentification

7. **Modification des formulaires de création**
   - Lors de la création d'une conversation : récupérer l'ID de l'utilisateur connecté
   - Lors de la création d'un message : associer automatiquement l'`authorId`
   - Afficher le nom de l'auteur dans les conversations et messages

**Critères de validation Phase 2 :**

- ✅ Un utilisateur **doit** être connecté pour créer une conversation
- ✅ Un utilisateur **doit** être connecté pour poster un message
- ✅ Un utilisateur peut **uniquement supprimer** ses propres conversations
- ✅ Un utilisateur peut **uniquement modifier** ses propres messages
- ✅ Les conversations sont **visibles par tous** (même non connectés)
- ✅ Les messages affichent le nom de leur auteur
- ✅ Les boutons d'action (modifier/supprimer) apparaissent uniquement pour le propriétaire
- ✅ Les routes API retournent des erreurs 401/403 appropriées si non autorisé

---

### 🎯 Phase 3

- Ajouter la **réinitialisation de mot de passe** (envoi d'email)
- Créer une page **profil utilisateur** (`/users/[id]`) affichant les contributions
- Implémenter la **modification de profil** (avatar, bio, nom)
- Ajouter un système de **rôles** (admin, modérateur, utilisateur)

### Optionnel

- Implémenter l'**authentification OAuth** (Google, GitHub, Discord, etc.)
- Ajouter la **validation d'email** (envoi d'un lien de confirmation)
- Implémenter la **2FA** (authentification à deux facteurs)

---

### 📚 Ressources

**Better Auth :**

- Documentation officielle : https://www.better-auth.com/docs
- Guide Next.js : https://www.better-auth.com/docs/examples/next-js

**NextAuth v5 (Auth.js) :**

- Documentation officielle : https://authjs.dev
- Guide de migration v5 : https://authjs.dev/getting-started/migrating-to-v5

**Prisma :**

- Relations : https://www.prisma.io/docs/concepts/components/prisma-schema/relations
- Migrations : https://www.prisma.io/docs/concepts/components/prisma-migrate

**Sécurité :**

- OWASP Top 10 : https://owasp.org/www-project-top-ten/
- Hachage de mots de passe : bcrypt vs argon2

---

### ⚠️ Critères d'évaluation

Votre projet sera évalué sur :

1. **Fonctionnalité** (40%)

   - Toutes les fonctionnalités des phases 1 et 2 sont implémentées
   - L'authentification fonctionne correctement
   - Les privilèges sont respectés

2. **Sécurité** (30%)

   - Mots de passe correctement hachés
   - Validation des entrées utilisateur
   - Protection contre les vulnérabilités courantes (XSS, injection SQL, CSRF)
   - Gestion appropriée des erreurs (pas d'exposition d'informations sensibles)

3. **Qualité du code** (20%)

   - Code TypeScript propre et bien structuré
   - Gestion d'erreurs appropriée
   - Respect des conventions Next.js/Prisma
   - Code commenté et lisible

4. **UX/UI** (10%)
   - Interface claire et intuitive
   - Messages d'erreur compréhensibles
   - Feedback visuel (loading states, succès, erreurs)
   - Design responsive

**Bonne chance ! 🚀**
