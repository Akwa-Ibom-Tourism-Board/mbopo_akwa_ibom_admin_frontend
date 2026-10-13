import styled from "styled-components";
import { Input } from "@/shared/ui";
import { parseYoutubeId, youtubeEmbedUrl } from "@/lib/youtube";

const Frame = styled.iframe`
  display: block;
  width: 100%;
  aspect-ratio: 16 / 9;
  margin-top: 10px;
  border: 0;
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ theme }) => theme.colors.black};
`;

const Error = styled.p`
  margin: 6px 0 0;
  color: ${({ theme }) => theme.colors.destructive.DEFAULT};
  font-size: 0.8125rem;
`;

export function YoutubeEmbed({ url, title }: { url: string; title: string }) {
  const id = parseYoutubeId(url);
  if (!id) return null;
  return (
    <Frame
      src={youtubeEmbedUrl(id)}
      title={title}
      loading="lazy"
      allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
    />
  );
}

// A text field for a pasted YouTube link — never a file upload — with a
// live embed preview once the link parses.
export function YoutubeLinkField({
  value,
  onChange,
  title = "Video preview",
  id,
}: {
  value: string;
  onChange: (value: string) => void;
  title?: string;
  id?: string;
}) {
  const invalid = value.trim() !== "" && !parseYoutubeId(value);
  return (
    <div>
      <Input
        id={id}
        type="url"
        inputMode="url"
        placeholder="Paste a YouTube link, e.g. https://youtu.be/…"
        value={value}
        invalid={invalid}
        onChange={(e) => onChange(e.target.value)}
      />
      {invalid && <Error>That doesn't look like a YouTube link.</Error>}
      {!invalid && value.trim() !== "" && (
        <YoutubeEmbed url={value} title={title} />
      )}
    </div>
  );
}
