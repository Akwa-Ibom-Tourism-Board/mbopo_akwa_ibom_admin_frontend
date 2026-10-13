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

const Error = styled.p`
  margin: 8px 0 0;
  color: ${({ theme }) => theme.colors.destructive.DEFAULT};
  font-size: 0.8125rem;
`;

// Dummy upload: reads the file into a data URL. Swap `readFile` for the real
// Cloudinary upload (same pattern as the applicant platform) when wiring the
// backend — the component's value stays a list of image URLs either way.
const readFile = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

export function ImageUploadField({
  value,
  onChange,
  multiple = true,
  label = "Add photo",
}: {
  value: string[];
  onChange: (urls: string[]) => void;
  multiple?: boolean;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setError(null);
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
      added.push(await readFile(file));
    }
    if (added.length)
      onChange(multiple ? [...value, ...added] : added.slice(0, 1));
    if (inputRef.current) inputRef.current.value = "";
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
        style={{ marginTop: value.length ? 12 : 0 }}
        onClick={() => inputRef.current?.click()}
      >
        <ImagePlus size={16} /> {label}
      </Button>
      {error && <Error role="alert">{error}</Error>}
    </div>
  );
}
