# GemmoHerb - TODO

## Authentification et Rôles
- [x] Système d'authentification sécurisé avec deux rôles (admin et pharmacie)
- [x] Gestion des rôles dans la base de données

## Catalogue Produits
- [x] Importer 52 macérats de bourgeons (37,7€ HT, TVA 19%)
- [x] Importer 55 huiles essentielles (prix variables, TVA 19%)
- [x] Interface admin pour ajouter des produits
- [x] Interface admin pour modifier les prix des produits
- [x] Interface admin pour supprimer des produits
- [x] Affichage du catalogue pour les pharmacies

## Système de Commandes
- [x] Panier avec ajout/suppression de produits
- [x] Calcul automatique TTC avec TVA 19%
- [x] Système de remises personnalisées par commande
- [x] Traçabilité du mode de paiement (espèce, chèque, non payé)
- [x] Validation manuelle des commandes par l'admin
- [x] Statuts de commande (en attente, confirmée, payée, livrée)
- [x] Historique complet des commandes pour chaque pharmacie

## Chat Bidirectionnel
- [x] Interface de chat intégrée pour les pharmacies
- [x] Interface de chat intégrée pour l'admin
- [x] Messages en temps réel entre pharmacie et vendeur
- [x] Historique des conversations

## Notifications Email
- [ ] Email automatique à gemoherb@gmail.com lors de nouvelle commande
- [ ] Email automatique à gemoherb@gmail.com lors de nouveau message

## Design et UX
- [x] Design élégant et professionnel
- [x] Interface responsive (PC, tablette, mobile)
- [x] Logo GemmoHerb intégré
- [x] Navigation intuitive

## Tests et Déploiement
- [x] Tests unitaires avec Vitest
- [ ] Tests de bout en bout
- [ ] Checkpoint final
- [ ] Documentation d'utilisation


## Améliorations UX demandées
- [x] Autocomplétion sur le champ Nom de produit dans l'interface admin
- [x] Rendre la référence produit optionnelle (non obligatoire)
- [x] Ajouter un champ quantité modifiable dans le catalogue pharmacie (défaut: 1)
- [x] Remplacer l'icône crayon par un bouton "+" pour ajouter au panier


## Améliorations Design B2B
- [ ] Modifier le design de l'interface client pour un style plus professionnel et sérieux (moins e-commerce)
- [ ] Extraire et intégrer les logos/icônes des macérats de bourgeons depuis le PDF
- [ ] Adapter la présentation des produits pour un contexte B2B


## Bugs à corriger
- [x] Corriger l'erreur "Cannot update component while rendering" dans Home.tsx
- [x] Corriger l'erreur de balises <a> imbriquées dans DashboardLayout


## Intégration des icônes visuelles
- [x] Générer les icônes SVG pour chaque macérat de bourgeon
- [x] Intégrer les icônes dans le tableau du catalogue client
- [x] Assurer une présentation harmonieuse et professionnelle
