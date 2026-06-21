export function isRenderableImageSrc(src: unknown): src is string {
  if (typeof src !== 'string') return false;

  const trimmed = src.trim();
  if (!trimmed) return false;

  if (trimmed.startsWith('/')) {
    return !trimmed.startsWith('//');
  }

  try {
    const url = new URL(trimmed);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export function getRenderableImages(images: unknown): string[] {
  return Array.isArray(images) ? images.filter(isRenderableImageSrc) : [];
}
