export async function fileToBase64(file: File): Promise<string> {
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") {
        reject(new Error("Falha ao ler imagem"));
        return;
      }
      const [, base64 = ""] = result.split(",");
      resolve(base64);
    };
    reader.onerror = () => reject(new Error("Falha ao ler imagem"));
    reader.readAsDataURL(file);
  });
}

export function resolveApiImageUrl(imageUrl?: string | null): string | null {
  if (!imageUrl) return null;
  if (imageUrl.startsWith("http")) return imageUrl;

  const baseUrl = import.meta.env.VITE_BASE_URL_API;
  if (baseUrl && baseUrl !== "/api") {
    return `${baseUrl.replace(/\/$/, "")}${imageUrl.replace(/^\/api/, "")}`;
  }

  return imageUrl;
}
