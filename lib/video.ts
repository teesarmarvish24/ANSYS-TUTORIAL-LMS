// Converts a YouTube or Vimeo share/watch URL into an embeddable iframe URL.
// Falls back to the original URL for anything else (e.g. a direct .mp4 link).
export function getEmbedUrl(url: string): string {
  try {
    const parsed = new URL(url);

    if (parsed.hostname.includes('youtube.com')) {
      const id = parsed.searchParams.get('v');
      if (id) return `https://www.youtube.com/embed/${id}`;
      if (parsed.pathname.startsWith('/embed/')) return url;
    }
    if (parsed.hostname === 'youtu.be') {
      const id = parsed.pathname.slice(1);
      if (id) return `https://www.youtube.com/embed/${id}`;
    }
    if (parsed.hostname.includes('vimeo.com')) {
      const id = parsed.pathname.split('/').filter(Boolean).pop();
      if (id) return `https://player.vimeo.com/video/${id}`;
    }
  } catch {
    // not a valid URL — fall through
  }
  return url;
}

export function isDirectVideoFile(url: string): boolean {
  return /\.(mp4|webm|ogg)$/i.test(new URL(url).pathname);
}
