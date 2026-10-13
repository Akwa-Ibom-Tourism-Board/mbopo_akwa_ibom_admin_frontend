// Media uploads videos to the Mbopo Akwa Ibom YouTube channel themselves and
// pastes the link here — we only ever store and embed the URL.
const ID = /^[A-Za-z0-9_-]{11}$/;

export function parseYoutubeId(input: string): string | null {
  let url: URL;
  try {
    url = new URL(input.trim());
  } catch {
    return null;
  }
  const host = url.hostname.replace(/^www\.|^m\./, "");
  let id: string | null = null;
  if (host === "youtu.be") {
    id = url.pathname.slice(1).split("/")[0] ?? null;
  } else if (host === "youtube.com" || host === "youtube-nocookie.com") {
    if (url.pathname === "/watch") id = url.searchParams.get("v");
    else {
      const [, kind, vid] = url.pathname.split("/");
      if (kind === "embed" || kind === "shorts" || kind === "live")
        id = vid ?? null;
    }
  }
  return id && ID.test(id) ? id : null;
}

export const youtubeEmbedUrl = (id: string) =>
  `https://www.youtube-nocookie.com/embed/${id}`;
