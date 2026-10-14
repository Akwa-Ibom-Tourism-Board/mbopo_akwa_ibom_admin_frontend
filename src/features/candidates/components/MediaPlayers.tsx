import styled from "styled-components";
import { YoutubeEmbed } from "@/features/voting-content";
import { parseYoutubeId } from "@/lib/youtube";

const Video = styled.video`
  display: block;
  width: 100%;
  max-height: 360px;
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ theme }) => theme.colors.black};
`;

// The applicant's pitch is an uploaded mp4/webm (a Cloudinary video URL); older
// records or Media-added clips may be YouTube links, so both are handled.
export function PitchPlayer({ url, title }: { url: string; title: string }) {
  if (parseYoutubeId(url)) return <YoutubeEmbed url={url} title={title} />;
  return <Video controls preload="metadata" src={url} aria-label={title} />;
}
