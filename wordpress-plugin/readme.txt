=== Next.js Preview & Revalidation ===
Contributors: lesdoleances
Tags: nextjs, headless, preview, revalidation, webhook
Requires at least: 5.8
Tested up to: 6.5
Requires PHP: 7.4
Stable tag: 1.0.0
License: GPLv2

Synchronise WordPress avec un frontend Next.js : revalidation instantanée et preview des brouillons.

== Installation ==

1. Copier le dossier `wordpress-plugin` dans `wp-content/plugins/nextjs-preview-revalidate/`
2. Activer le plugin dans WordPress (Extensions > Extensions installées)
3. Aller dans Réglages > Next.js Preview
4. Configurer :
   - **URL du site Next.js** : `https://www.lesdoleances.fr`
   - **Secret partagé** : cliquer "Générer un secret" puis copier la valeur

== Configuration côté Next.js ==

Ajouter dans `.env.local` :

    WORDPRESS_WEBHOOK_SECRET=<le_secret_genere>
    WORDPRESS_AUTH_TOKEN=<base64_de_user:application_password>

Pour générer WORDPRESS_AUTH_TOKEN :
1. Dans WordPress, aller dans Utilisateurs > Votre profil > Mots de passe d'application
2. Créer un nouveau mot de passe d'application (nom : "Next.js Preview")
3. Encoder en base64 : echo -n "utilisateur:xxxx xxxx xxxx" | base64

== Fonctionnement ==

= Revalidation =
Lorsqu'un article, page ou groupe local est publié, modifié ou supprimé,
le plugin envoie un webhook POST à `/api/revalidate` sur le site Next.js.
Next.js revalide alors les pages concernées instantanément.

= Preview =
Le bouton "Aperçu" de WordPress redirige vers `/api/draft` sur le site Next.js,
qui active le Draft Mode et affiche le brouillon comme s'il était publié.

Pour quitter le mode preview, accéder à `/api/draft/disable`.

== Journal ==
Les 50 dernières revalidations sont visibles dans Réglages > Next.js Preview.
