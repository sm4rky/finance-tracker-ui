"use client";

import { useEffect, useState } from "react";

import { createClient } from "@/lib/supabase/client";

const SUPABASE_AVATARS_BUCKET =
  process.env.NEXT_PUBLIC_SUPABASE_AVATARS_BUCKET?.trim() || "avatars";

const AVATAR_OUTPUT_MIME =
  process.env.NEXT_PUBLIC_AVATAR_OUTPUT_MIME?.trim().toLowerCase() ||
  "image/webp";

const AVATAR_OUTPUT_SUBTYPE =
  AVATAR_OUTPUT_MIME.split("/")[1] || "webp";

export async function uploadAvatarObject(
  userId: string,
  blob: Blob,
): Promise<string> {
  const supabase = createClient();
  const path = `${userId}/avatar.${AVATAR_OUTPUT_SUBTYPE}`;

  const { error } = await supabase.storage
    .from(SUPABASE_AVATARS_BUCKET)
    .upload(path, blob, {
      upsert: true,
      contentType: AVATAR_OUTPUT_MIME,
      cacheControl: "3600",
    });

  if (error) throw error;
  return path;
}

export function getStoredAvatarUrl(
  avatarStoragePath: string | null | undefined,
): string {
  const [src, setSrc] = useState("");

  useEffect(() => {
    let cancelled = false;
    const trimmed = avatarStoragePath?.trim();
    if (!trimmed) {
      setSrc("");
      return;
    }

    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      setSrc(trimmed);
      return;
    }

    const supabase = createClient();
    void supabase.storage
      .from(SUPABASE_AVATARS_BUCKET)
      .createSignedUrl(trimmed, 3600)
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error || !data?.signedUrl) {
          setSrc("");
          return;
        }
        setSrc(data.signedUrl);
      });

    return () => {
      cancelled = true;
    };
  }, [avatarStoragePath]);

  return src;
}
