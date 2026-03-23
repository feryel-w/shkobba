# 🃏 Guide de déploiement — Shkobba

Suis ces étapes dans l'ordre. Ça prend environ **15 minutes**.

---

## ÉTAPE 1 — Créer un compte Supabase (la base de données)

1. Va sur **https://supabase.com** et clique **Start for free**
2. Inscris-toi avec ton email ou GitHub
3. Clique **New project**
4. Choisis un nom (ex: `shkobba`), un mot de passe fort, une région proche (ex: `EU West`)
5. Attends ~2 minutes que le projet se crée

---

## ÉTAPE 2 — Créer la table de jeu

1. Dans ton projet Supabase, clique sur **SQL Editor** dans le menu de gauche
2. Clique **New query**
3. Copie-colle tout le contenu du fichier `supabase_schema.sql`
4. Clique **Run** (bouton vert)
5. Tu dois voir "Success" — la table est créée ✓

---

## ÉTAPE 3 — Récupérer les clés Supabase

1. Dans Supabase, va dans **Project Settings** → **API**
2. Copie la valeur **Project URL** (commence par `https://...supabase.co`)
3. Copie la valeur **anon public** key

---

## ÉTAPE 4 — Mettre le code sur GitHub

1. Va sur **https://github.com** et crée un compte si tu n'en as pas
2. Clique **New repository**, nomme-le `shkobba`, mets-le en **Public**, clique **Create**
3. Télécharge **GitHub Desktop** sur https://desktop.github.com et installe-le
4. Dans GitHub Desktop : **File → Clone repository** → colle l'URL de ton repo
5. Copie tous les fichiers du dossier `shkobba` dans le dossier cloné
6. **Important** : crée un fichier `.env` (copie `.env.example`) et remplis tes clés Supabase :
   ```
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGci...
   ```
7. Dans GitHub Desktop : écris un message (ex: "Initial commit") → **Commit to main** → **Push origin**

---

## ÉTAPE 5 — Déployer sur Vercel (hébergement gratuit)

1. Va sur **https://vercel.com** et inscris-toi avec ton compte GitHub
2. Clique **Add New → Project**
3. Sélectionne ton repo `shkobba` et clique **Import**
4. Avant de déployer, clique sur **Environment Variables** et ajoute :
   - `VITE_SUPABASE_URL` → ta Project URL
   - `VITE_SUPABASE_ANON_KEY` → ta anon key
5. Clique **Deploy** et attends ~1 minute
6. Vercel te donne une URL comme `shkobba-xxx.vercel.app` 🎉

---

## ÉTAPE 6 — Jouer !

1. Ouvre l'URL sur ton téléphone
2. Clique **Créer une partie**, entre ton prénom
3. Envoie le **code à 6 lettres** à ta copine
4. Elle ouvre la même URL, clique **Rejoindre**, entre le code
5. La partie commence automatiquement ! ✨

---

## En cas de problème

- **Erreur de connexion** : vérifie que tes clés Supabase sont bien copiées dans Vercel
- **La page est blanche** : regarde les erreurs dans Vercel → Deployments → ton déploiement → Logs
- **La table n'existe pas** : refais l'étape 2 dans Supabase

---

Bon jeu ! 🃏
