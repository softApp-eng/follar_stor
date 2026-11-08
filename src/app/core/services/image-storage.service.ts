import { Injectable } from '@angular/core';

/**
 * Stores article photos through the Spring Boot API when it is available
 * (files land in backend/follar-backend/uploads). When the backend is not
 * running, the file is embedded as a data URL so the admin panel keeps
 * working in a purely front-end setup.
 */
@Injectable({ providedIn: 'root' })
export class ImageStorageService {
  private readonly endpoint = 'http://localhost:8080/api/images';
  private readonly apiOrigin = 'http://localhost:8080';

  async store(file: File): Promise<string> {
    if (!file.type.startsWith('image/')) {
      throw new Error('Le fichier sélectionné n’est pas une image.');
    }

    try {
      const body = new FormData();
      body.append('file', file, file.name);

      const response = await fetch(this.endpoint, { method: 'POST', body });
      if (response.ok) {
        const payload = await response.json();
        const url = payload?.url as string | undefined;
        if (url) {
          return url.startsWith('http') ? url : `${this.apiOrigin}${url}`;
        }
      }
    } catch {
      // Backend offline: fall back to an inline data URL.
    }

    return this.toDataUrl(file);
  }

  private toDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Impossible de lire le fichier image.'));
      reader.readAsDataURL(file);
    });
  }
}
