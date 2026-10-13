import { useState } from "react";
import styled from "styled-components";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Textarea,
} from "@/shared/ui";
import { parseYoutubeId } from "@/lib/youtube";
import {
  ImageUploadField,
  YoutubeEmbed,
  YoutubeLinkField,
} from "@/features/voting-content";
import { useUpdateCandidateProfile } from "../api/hooks";
import type { Candidate, CandidateVideo } from "../types";

const Stack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const VideoRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 14px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
`;

const Muted = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.muted.foreground};
  font-size: 0.875rem;
`;

const Photos = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;

  img {
    width: 96px;
    height: 96px;
    border-radius: ${({ theme }) => theme.radii.lg};
    object-fit: cover;
  }
`;

// The Media-managed layer that renders on the public voting site, on top of
// (never replacing) the applicant's own data. Read-only unless `editable`.
export function CandidateProfilePanel({
  candidate,
  editable,
}: {
  candidate: Candidate;
  editable: boolean;
}) {
  const mutation = useUpdateCandidateProfile(candidate.id);
  const [bio, setBio] = useState(candidate.bio ?? "");
  const [photos, setPhotos] = useState(candidate.additionalPhotos ?? []);
  const [videos, setVideos] = useState<CandidateVideo[]>(
    candidate.additionalVideos ?? [],
  );

  if (!editable) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Public profile</CardTitle>
        </CardHeader>
        <CardContent>
          <Stack>
            {candidate.bio ? (
              <p>{candidate.bio}</p>
            ) : (
              <Muted>No bio added yet.</Muted>
            )}
            {!!candidate.additionalPhotos?.length && (
              <Photos>
                {candidate.additionalPhotos.map((src, i) => (
                  <img key={i} src={src} alt="" />
                ))}
              </Photos>
            )}
            {candidate.additionalVideos?.map((v, i) => (
              <div key={i}>
                <strong>{v.title}</strong>
                <YoutubeEmbed url={v.youtubeUrl} title={v.title} />
              </div>
            ))}
          </Stack>
        </CardContent>
      </Card>
    );
  }

  const updateVideo = (i: number, patch: Partial<CandidateVideo>) =>
    setVideos((vs) => vs.map((v, j) => (j === i ? { ...v, ...patch } : v)));

  const invalidVideo = videos.some(
    (v) => !v.title.trim() || !parseYoutubeId(v.youtubeUrl),
  );

  const save = () =>
    mutation.mutate(
      {
        bio: bio.trim() || undefined,
        additionalPhotos: photos,
        additionalVideos: videos.map((v) => ({
          title: v.title.trim(),
          youtubeUrl: v.youtubeUrl.trim(),
        })),
      },
      {
        onSuccess: () => toast.success("Public profile saved"),
        onError: () => toast.error("Couldn't save the profile"),
      },
    );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Public profile</CardTitle>
        <Muted>
          Shown on the voting site alongside the candidate's application.
        </Muted>
      </CardHeader>
      <CardContent>
        <Stack>
          <Field>
            <Label htmlFor="bio">Bio / history</Label>
            <Textarea
              id="bio"
              rows={5}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </Field>

          <Field>
            <Label>Additional photos</Label>
            <ImageUploadField value={photos} onChange={setPhotos} />
          </Field>

          <Field>
            <Label>Additional videos</Label>
            <Muted>
              Upload to the Mbopo Akwa Ibom YouTube channel first, then paste
              the link.
            </Muted>
            {videos.map((v, i) => (
              <VideoRow key={i}>
                <Input
                  aria-label="Video title"
                  placeholder="Video title"
                  value={v.title}
                  onChange={(e) => updateVideo(i, { title: e.target.value })}
                />
                <YoutubeLinkField
                  value={v.youtubeUrl}
                  onChange={(youtubeUrl) => updateVideo(i, { youtubeUrl })}
                  title={v.title || "Video preview"}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setVideos((vs) => vs.filter((_, j) => j !== i))
                  }
                >
                  <Trash2 size={16} /> Remove video
                </Button>
              </VideoRow>
            ))}
            <div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setVideos((vs) => [...vs, { title: "", youtubeUrl: "" }])
                }
              >
                <Plus size={16} /> Add video
              </Button>
            </div>
          </Field>

          <div>
            <Button
              onClick={save}
              disabled={mutation.isPending || invalidVideo}
            >
              {mutation.isPending ? "Saving…" : "Save public profile"}
            </Button>
            {invalidVideo && (
              <Muted style={{ marginTop: 8 }}>
                Every video needs a title and a valid YouTube link.
              </Muted>
            )}
          </div>
        </Stack>
      </CardContent>
    </Card>
  );
}
