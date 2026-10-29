import { request } from "./http";

// Direct browser-to-Cloudinary upload, signed by the backend per request
// (POST /admin/contestants/:id/photo-signature — the only signed-upload
// endpoint this app has; Media's video field is a plain YouTube URL, never
// a Cloudinary upload). The backend decides the resource type, the
// deterministic (candidate-named) public_id, and every transformation/
// format restriction, then signs all of it — the file's bytes still never
// pass through our own server. See the backend's
// src/configurations/cloudinary.ts for the other half of this contract.
export const MAX_CANDIDATE_PHOTO_BYTES = 5 * 1024 * 1024;

interface SignedUpload {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  publicId: string;
  overwrite: true;
  resourceType: "image" | "video";
  uploadParams: Record<string, string | number | boolean>;
}

export interface CloudinaryUploadResult {
  url: string;
  publicId: string;
  bytes: number;
}

export interface UploadToCloudinaryOptions {
  onProgress?: (percent: number) => void;
  signal?: AbortSignal;
}

export class CloudinaryUploadError extends Error {
  constructor(message = "We could not upload that file. Please try again.") {
    super(message);
    this.name = "CloudinaryUploadError";
  }
}

function postToCloudinary(
  signed: SignedUpload,
  file: File | Blob,
  options: UploadToCloudinaryOptions,
): Promise<CloudinaryUploadResult> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", signed.apiKey);
  formData.append("timestamp", String(signed.timestamp));
  formData.append("signature", signed.signature);
  // Every one of these was included in what the backend signed — sending
  // anything different (or omitting one) makes Cloudinary reject the
  // request as a signature mismatch.
  for (const [key, value] of Object.entries(signed.uploadParams)) {
    formData.append(key, String(value));
  }

  const endpoint = `https://api.cloudinary.com/v1_1/${signed.cloudName}/${signed.resourceType}/upload`;

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", endpoint);

    if (options.onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          options.onProgress!(Math.round((event.loaded / event.total) * 100));
        }
      };
    }

    options.signal?.addEventListener("abort", () => xhr.abort());

    xhr.onload = () => {
      let body: {
        secure_url?: string;
        public_id?: string;
        bytes?: number;
        error?: { message?: string };
      };
      try {
        body = JSON.parse(xhr.responseText);
      } catch {
        reject(new CloudinaryUploadError("Cloudinary returned an unexpected response."));
        return;
      }

      if (xhr.status < 200 || xhr.status >= 300) {
        reject(new CloudinaryUploadError(body?.error?.message));
        return;
      }

      resolve({
        url: body.secure_url!,
        publicId: body.public_id!,
        bytes: body.bytes ?? 0,
      });
    };

    xhr.onerror = () => reject(new CloudinaryUploadError("Network error during upload."));
    xhr.onabort = () => reject(new CloudinaryUploadError("Upload cancelled."));

    xhr.send(formData);
  });
}

/** Media's own additional-photo upload — see POST /admin/contestants/:id/photo-signature. */
export async function uploadCandidatePhoto(
  candidateId: string,
  file: File | Blob,
  options: UploadToCloudinaryOptions = {},
): Promise<CloudinaryUploadResult> {
  const signed = await request<SignedUpload>(`/admin/contestants/${candidateId}/photo-signature`, {
    method: "POST",
  });

  return postToCloudinary(signed, file, options);
}

export type DocumentField = "certificateOfOrigin" | "fullImage" | "fullImage2" | "videoPitch";

/** Admin replacing one of a candidate's own documents — see POST /admin/contestants/:id/document-signature. */
export async function uploadCandidateDocument(
  candidateId: string,
  field: DocumentField,
  file: File | Blob,
  options: UploadToCloudinaryOptions = {},
): Promise<CloudinaryUploadResult> {
  const signed = await request<SignedUpload>(
    `/admin/contestants/${candidateId}/document-signature`,
    { method: "POST", body: JSON.stringify({ field }) },
  );

  return postToCloudinary(signed, file, options);
}

export type VotingContentScope = "news" | "sponsor";

/**
 * A news post's cover/gallery image or a sponsor's logo — `id` is a UUID
 * minted client-side (crypto.randomUUID()) before the record exists, since
 * the image can be uploaded before or after the record is created either
 * way. Each call also mints its own `slot`, so uploading several images
 * for the same content item never has one overwrite another. See POST
 * /admin/voting-content/upload-signature.
 */
export async function uploadVotingContentImage(
  scope: VotingContentScope,
  id: string,
  file: File | Blob,
  options: UploadToCloudinaryOptions = {},
): Promise<CloudinaryUploadResult> {
  const signed = await request<SignedUpload>("/admin/voting-content/upload-signature", {
    method: "POST",
    body: JSON.stringify({ scope, id, slot: crypto.randomUUID() }),
  });

  return postToCloudinary(signed, file, options);
}
