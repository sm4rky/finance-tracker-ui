"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import imageCompression from "browser-image-compression";
import { ImageUp, Loader2, ZoomIn, ZoomOut } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import type { UserProfile } from "@/interface/user";
import { updateProfileAvatar } from "@/lib/api/users";
import { uploadAvatarObject } from "@/lib/supabase/avatar";
import { useAuthStore } from "@/stores/auth-session";

import "react-easy-crop/react-easy-crop.css";

const AVATAR_OUTPUT_MIME =
  process.env.NEXT_PUBLIC_AVATAR_OUTPUT_MIME?.trim().toLowerCase() ||
  "image/webp";

const AVATAR_OUTPUT_SUBTYPE =
  AVATAR_OUTPUT_MIME.split("/")[1] || "webp";

const AVATAR_OUTPUT_SIZE_PX = 512;
const AVATAR_EXPORT_QUALITY = 0.85;

const ACCEPT_FILE_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
] as const;

const ACCEPT_FILE_EXTENSIONS = [
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
] as const;

const fileInputAccept = [
  ...ACCEPT_FILE_MIME_TYPES,
  ...ACCEPT_FILE_EXTENSIONS,
].join(",");

function parseEnvBytes(value: string | undefined, fallback: number): number {
  if (value == null || value.trim() === "") return fallback;
  const n = Number.parseInt(value.trim(), 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

const avatarUploadMaxBytes = parseEnvBytes(
  typeof process !== "undefined"
    ? process.env.NEXT_PUBLIC_AVATAR_MAX_UPLOAD_BYTES
    : undefined,
  5 * 1024 * 1024,
);

function validatePickedAvatarFile(file: File): string | null {
  const type = file.type.trim().toLowerCase();
  if (!(ACCEPT_FILE_MIME_TYPES as readonly string[]).includes(type)) {
    return "Please choose a JPEG, PNG, or WebP image.";
  }
  if (file.size > avatarUploadMaxBytes) {
    const mb = avatarUploadMaxBytes / (1024 * 1024);
    return `Image must be at most ${mb} MB before cropping.`;
  }
  return null;
}

function loadImageForCrop(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image."));
    img.src = src;
  });
}

async function getCroppedAvatarBlob(
  imageSrc: string,
  pixelCrop: Area,
): Promise<Blob> {
  const image = await loadImageForCrop(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get canvas context.");

  const side = AVATAR_OUTPUT_SIZE_PX;
  canvas.width = side;
  canvas.height = side;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    side,
    side,
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) reject(new Error("Could not export image."));
        else resolve(blob);
      },
      AVATAR_OUTPUT_MIME,
      AVATAR_EXPORT_QUALITY,
    );
  });
}

async function compressAvatarBlob(blob: Blob): Promise<Blob> {
  const file = new File([blob], `avatar.${AVATAR_OUTPUT_SUBTYPE}`, {
    type: blob.type || AVATAR_OUTPUT_MIME,
  });

  const compressed = await imageCompression(file, {
    maxSizeMB: 0.75,
    maxWidthOrHeight: AVATAR_OUTPUT_SIZE_PX,
    useWebWorker: true,
  });

  if (compressed instanceof Blob) return compressed;
  return new Blob([compressed], { type: AVATAR_OUTPUT_MIME });
}

export type AvatarUploadDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploaded?: (profile: UserProfile) => void;
};

export function AvatarUploadDialog({
  open,
  onOpenChange,
  onUploaded,
}: AvatarUploadDialogProps) {
  const inputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const user = useAuthStore((s) => s.user);

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(
    null,
  );
  const [saving, setSaving] = useState(false);

  const revokeSrc = useCallback(() => {
    if (imageSrc?.startsWith("blob:")) {
      URL.revokeObjectURL(imageSrc);
    }
  }, [imageSrc]);

  const resetState = useCallback(() => {
    revokeSrc();
    setImageSrc(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
  }, [revokeSrc]);

  useEffect(() => {
    if (!open) {
      resetState();
    }
  }, [open, resetState]);

  const onCropComplete = useCallback(
    (_area: Area, areaPixels: Area) => {
      setCroppedAreaPixels(areaPixels);
    },
    [],
  );

  const onPickFile = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      event.target.value = "";
      if (!file) return;

      const err = validatePickedAvatarFile(file);
      if (err) {
        toast.error(err);
        return;
      }

      revokeSrc();
      const url = URL.createObjectURL(file);
      setImageSrc(url);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCroppedAreaPixels(null);
    },
    [revokeSrc],
  );

  const handleSave = useCallback(async () => {
    if (!imageSrc || !croppedAreaPixels || !user?.id) {
      toast.error("Could not read crop. Try adjusting the image.");
      return;
    }

    setSaving(true);
    try {
      let blob = await getCroppedAvatarBlob(imageSrc, croppedAreaPixels);
      blob = await compressAvatarBlob(blob);
      const path = await uploadAvatarObject(user.id, blob);
      const profile = await updateProfileAvatar(path);
      useAuthStore.getState().setUserProfile(profile);
      toast.success("Profile photo updated.");
      onUploaded?.(profile);
      onOpenChange(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not update photo.");
    } finally {
      setSaving(false);
    }
  }, [
    croppedAreaPixels,
    imageSrc,
    onUploaded,
    user?.id,
    onOpenChange,
  ]);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (saving && !next) return;
        onOpenChange(next);
      }}
    >
      <DialogContent
        className="max-w-lg gap-0 overflow-hidden p-0 sm:max-w-lg"
        showCloseButton={!saving}
      >
        <DialogHeader className="space-y-1 px-6 pt-6 pb-2 text-left">
          <DialogTitle className="text-base leading-tight">
            Update profile photo
          </DialogTitle>
          <DialogDescription className="text-sm leading-snug">
            Pick a photo and position it the way you want before saving.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 py-4">
          {!imageSrc ? (
            <div className="flex flex-col items-center justify-center gap-3 py-8">
              <input
                ref={fileInputRef}
                id={inputId}
                type="file"
                accept={fileInputAccept}
                className="sr-only"
                onChange={onPickFile}
              />
              <Button
                type="button"
                variant="outline"
                disabled={!user}
                onClick={() => fileInputRef.current?.click()}
              >
                Choose image
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="relative aspect-square w-full max-h-[min(70vw,22rem)] overflow-hidden rounded-lg bg-muted">
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  cropShape="rect"
                  showGrid={false}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                />
              </div>
              <div className="flex items-center gap-3 px-0.5">
                <ZoomOut
                  className="size-5 shrink-0 text-muted-foreground"
                  aria-hidden
                />
                <Slider
                  id={`${inputId}-zoom`}
                  className="min-w-0 flex-1 py-2"
                  min={1}
                  max={3}
                  step={0.01}
                  value={zoom}
                  onValueChange={(v) =>
                    setZoom(typeof v === "number" ? v : v[0])
                  }
                  aria-label="Zoom"
                />
                <ZoomIn
                  className="size-5 shrink-0 text-muted-foreground"
                  aria-hidden
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="self-start text-muted-foreground"
                onClick={() => {
                  resetState();
                  requestAnimationFrame(() =>
                    fileInputRef.current?.click(),
                  );
                }}
              >
                Choose different image
              </Button>
            </div>
          )}
        </div>

        <DialogFooter className="mx-0 mb-0 gap-2 rounded-none px-6 py-4 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            disabled={saving}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="gap-2"
            disabled={
              saving || !imageSrc || !croppedAreaPixels || !user?.id
            }
            onClick={() => void handleSave()}
          >
            {saving ? (
              <>
                <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden />
                Saving…
              </>
            ) : (
              <>
                <ImageUp className="size-4 shrink-0" aria-hidden />
                Save
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
