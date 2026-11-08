package com.follar.controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

/**
 * Stores article photos inside the project (backend/follar-backend/uploads)
 * and returns a public URL usable by the Angular storefront and admin panel.
 */
@RestController
@RequestMapping("/api/images")
public class ImageController {

    private static final Set<String> ALLOWED_EXTENSIONS =
            Set.of("jpg", "jpeg", "png", "webp", "gif", "avif");
    private static final long MAX_BYTES = 10L * 1024 * 1024;

    private final Path uploads;

    public ImageController(@Value("${follar.uploads.dir:uploads}") String uploadsDir) throws IOException {
        this.uploads = Paths.get(uploadsDir).toAbsolutePath().normalize();
        Files.createDirectories(this.uploads);
    }

    @PostMapping
    public ResponseEntity<Map<String, String>> upload(@RequestParam("file") MultipartFile file)
            throws IOException {
        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Fichier vide."));
        }
        if (file.getSize() > MAX_BYTES) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "L'image dépasse la taille maximale de 10 Mo."));
        }

        String original = file.getOriginalFilename() == null ? "" : file.getOriginalFilename();
        int dot = original.lastIndexOf('.');
        String extension = dot >= 0
                ? original.substring(dot + 1).toLowerCase(Locale.ROOT)
                : "";

        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Format d'image non supporté (jpg, png, webp, gif, avif)."));
        }

        String filename = UUID.randomUUID().toString().replace("-", "") + "." + extension;
        Path target = uploads.resolve(filename).normalize();

        if (!target.startsWith(uploads)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Chemin invalide."));
        }

        file.transferTo(target);

        return ResponseEntity.ok(Map.of("url", "/uploads/" + filename));
    }
}
