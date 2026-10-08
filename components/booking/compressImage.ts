// =============================================================
// Compresse une photo DANS LE NAVIGATEUR avant l'envoi.
//
// Pourquoi ? Une photo de téléphone fait souvent 4 à 8 Mo.
// Vercel refuse les envois de plus de 4,5 Mo au total.
// En réduisant à 1600 px de large en JPEG, une photo fait ~300 Ko :
// assez net pour voir une fissure, et l'envoi est rapide.
// =============================================================

export async function compressImage(file: File, maxSize = 1600, quality = 0.82): Promise<File> {
  try {
    const bitmap = await createImageBitmap(file); // on "décode" l'image
    const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    // On la redessine plus petite dans un <canvas> invisible
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.fillStyle = "#ffffff"; // fond blanc (le JPEG ne gère pas la transparence)
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    // Puis on la ré-exporte en JPEG
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
    if (!blob || blob.size >= file.size) return file; // si ce n'est pas plus léger, on garde l'originale

    return new File([blob], file.name.replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" });
  } catch {
    return file; // en cas de souci, on envoie l'originale
  }
}
