/**
 * Compression d'image cote client via l'API Canvas.
 *
 * Redimensionne l'image si elle depasse `maxWidth` (en conservant le ratio)
 * puis la re-encode en JPEG avec le facteur `quality` (0-1).
 *
 * Aucune dependance externe -- utilise uniquement les APIs natives du navigateur.
 */

const DEFAULT_MAX_WIDTH = 1200;
const DEFAULT_QUALITY = 0.8;

/**
 * Compresse et redimensionne un fichier image avant upload.
 *
 * @param file    - Le fichier image source (depuis un <input type="file"> par ex.)
 * @param maxWidth - Largeur max en px (defaut : 1200)
 * @param quality  - Qualite JPEG 0-1 (defaut : 0.8)
 * @returns Un Blob JPEG compresse, pret a etre uploade.
 */
export function compressImage(
  file: File | Blob,
  maxWidth: number = DEFAULT_MAX_WIDTH,
  quality: number = DEFAULT_QUALITY,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      let { width, height } = img;

      // Redimensionner uniquement si necessaire
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Impossible d'obtenir le contexte 2D du canvas"));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("canvas.toBlob a retourne null"));
          }
        },
        "image/jpeg",
        quality,
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Impossible de charger l'image"));
    };

    img.src = url;
  });
}
