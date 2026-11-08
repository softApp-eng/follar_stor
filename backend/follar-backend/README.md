# FOLLAR Spring Boot Backend

API Spring Boot 3 utilisée par la boutique FOLLAR.

## Stockage des images

Les photos importées depuis le panneau d'administration sont enregistrées
directement dans le projet :

```
backend/follar-backend/uploads/
```

- `POST /api/images` (multipart, champ `file`) renvoie `{ "url": "/uploads/<fichier>" }`
- `GET /uploads/<fichier>` sert l'image
- formats acceptés : jpg, jpeg, png, webp, gif, avif — 10 Mo maximum
- CORS ouvert pour le serveur Angular (`http://localhost:4200` et `http://127.0.0.1:4200`)

## Démarrage

```bash
mvn spring-boot:run
```

Le serveur écoute sur `http://localhost:8080`.

La console H2 reste disponible sur `http://localhost:8080/h2-console`
(JDBC URL : `jdbc:h2:mem:follardb`, utilisateur : `sa`, mot de passe : `password`).

## Configuration

Voir `src/main/resources/application.properties` :

- `follar.uploads.dir=uploads` — dossier de stockage des images
- `spring.servlet.multipart.max-file-size=10MB`
