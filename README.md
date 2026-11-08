# FOLLAR — Vestiaire essentiel, Paris

Boutique de mode minimaliste construite avec **Angular 22** (frontend) et **Spring Boot 3** (backend, stockage des images).

## Fonctionnalités

- Catalogue responsive (mobile, tablette, desktop) : accueil, collection, fiches produit, panier.
- Panneau d'administration sécurisé (`/admin`, identifiants par défaut `admin` / `follar2026`).
- Ajout, modification et suppression de tous les articles, avec photo par URL ou import de fichier.
- Gestion des catégories, des commandes et du département livraison.
- Personnalisation de l'apparence, des contacts et des réseaux sociaux.
- Photos des articles livrées dans `public/images/articles/` ; les imports admin sont stockés dans `backend/follar-backend/uploads/`.

## Démarrage

### Frontend

```bash
npm install
npm start
```

Ouvrir `http://localhost:4200/`.

### Backend (stockage des images importées)

```bash
cd backend/follar-backend
mvn spring-boot:run
```

L'API écoute sur `http://localhost:8080`. Les images importées depuis l'admin sont enregistrées dans `backend/follar-backend/uploads/` et servies via `/uploads/**`.

> Si le backend n'est pas démarré, l'admin continue de fonctionner : l'image est alors intégrée en data URL dans le navigateur.

## Build & tests

```bash
npm run build
npx ng test --watch=false
```

## Structure

```
public/images/articles/        photos du catalogue livrées avec le site
src/app/pages/admin/           panneau d'administration
src/app/core/services/         catalogue, panier, commandes, stockage images
backend/follar-backend/        API Spring Boot + dossier uploads/
```
