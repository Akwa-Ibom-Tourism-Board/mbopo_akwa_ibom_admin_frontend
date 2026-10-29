import { useRef, useState } from "react";
import styled from "styled-components";
import { ImagePlus, X } from "lucide-react";
import { Button } from "@/shared/ui";
import { MAX_IMAGE_BYTES } from "@/lib/constants";

const Row = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
`;

const Thumb = styled.div`
  position: relative;
  width: 96px;
  height: 96px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const Remove = styled.button`
  position: absolute;
  top: 4px;
  right: 4px;
  display: grid;
  place-items: center;
  width: 22px;
  height: 22px;
  border: 0;
  border-radius: ${({ theme }) => theme.radii.full};
  background: ${({ theme }) => theme.alpha(theme.colors.black, 0.65)};
  color: ${({ theme }) => theme.colors.white};
  cursor: pointer;
`;

const ErrorText = styled.p`
  margin: 8px 0 0;
  color: ${({ theme }) => theme.colors.destructive.DEFAULT};
  font-size: 0.8125rem;
`;

// Real upload: `onUpload` is supplied by the caller (each has its own real
// signed-upload target — a voting-content image, a candidate's additional
// photo, etc. — see lib/cloudinary.ts), so this component stays a plain,
// reusable picker/preview rather than knowing about any one of them.
export function ImageUploadField({
  value,
  onChange,
  onUpload,
  multiple = true,
  label = "Add photo",
}: {
  value: string[];
  onChange: (urls: string[]) => void;
  onUpload: (file: File) => Promise<string>;
  multiple?: boolean;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setError(null);
    setUploading(true);
    try {
      const added: string[] = [];
      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) {
          setError(`${file.name} isn't an image.`);
          continue;
        }
        if (file.size > MAX_IMAGE_BYTES) {
          setError(`${file.name} is over the 5MB limit.`);
          continue;
        }
        added.push(await onUpload(file));
      }
      if (added.length) onChange(multiple ? [...value, ...added] : added.slice(0, 1));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div>
      <Row>
        {value.map((src, i) => (
          <Thumb key={`${i}-${src.slice(-24)}`}>
            <img src={src} alt="" />
            <Remove
              type="button"
              aria-label="Remove photo"
              onClick={() => onChange(value.filter((_, j) => j !== i))}
            >
              <X size={14} />
            </Remove>
          </Thumb>
        ))}
      </Row>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        hidden
        onChange={(e) => void handleFiles(e.target.files)}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={uploading}
        style={{ marginTop: value.length ? 12 : 0 }}
        onClick={() => inputRef.current?.click()}
      >
        <ImagePlus size={16} /> {uploading ? "Uploading…" : label}
      </Button>
      {error && <ErrorText role="alert">{error}</ErrorText>}
    </div>
  );
}
