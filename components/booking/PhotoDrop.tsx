"use client";
// La zone "Upload Damage Photos" : clic OU glisser-déposer, 3 photos max.

import { useRef, useState } from "react";
import { ACCEPTED_TYPES, MAX_PHOTOS, MAX_PHOTO_MB } from "@/lib/booking";

export type Photo = { file: File; url: string }; // url = aperçu affiché à l'écran

type Props = {
  photos: Photo[];
  onChange: (photos: Photo[]) => void;
  error?: string;
};

export default function PhotoDrop({ photos, onChange, error }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [message, setMessage] = useState("");

  // Ajoute des fichiers en vérifiant le type, la taille et le nombre
  function addFiles(list: FileList | null) {
    if (!list) return;
    const next = [...photos];
    let problem = "";
    for (const file of Array.from(list)) {
      if (next.length >= MAX_PHOTOS) problem = `Up to ${MAX_PHOTOS} photos.`;
      else if (!ACCEPTED_TYPES.includes(file.type)) problem = "PNG, JPG or WEBP only.";
      else if (file.size > MAX_PHOTO_MB * 1024 * 1024) problem = `Each photo must be under ${MAX_PHOTO_MB}MB.`;
      else next.push({ file, url: URL.createObjectURL(file) });
    }
    setMessage(problem);
    onChange(next);
    if (inputRef.current) inputRef.current.value = ""; // permet de re-choisir le même fichier
  }

  function remove(index: number) {
    URL.revokeObjectURL(photos[index].url); // libère la mémoire de l'aperçu
    onChange(photos.filter((_, i) => i !== index));
    setMessage("");
  }

  const shown = error || message;

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        addFiles(e.dataTransfer.files);
      }}
      className={`flex flex-wrap items-center gap-[18px] rounded-2xl border-[1.5px] border-dashed p-[22px] transition-colors ${
        dragging ? "border-accent bg-accent/5" : "border-[#c9d3db] bg-[#fbfcfd]"
      }`}
    >
      {photos.map((p, i) => (
        <div key={p.url} className="group relative h-[76px] w-[76px] overflow-hidden rounded-xl bg-[#e9eef2]">
          {/* eslint-disable-next-line @next/next/no-img-element -- aperçu local (blob:), next/image n'est pas utile ici */}
          <img src={p.url} alt={`Damage photo ${i + 1}`} className="h-full w-full object-cover" />
          <button
            type="button"
            onClick={() => remove(i)}
            aria-label={`Remove photo ${i + 1}`}
            className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-ink/70 text-[14px] leading-none text-white backdrop-blur"
          >
            ×
          </button>
        </div>
      ))}

      {photos.length < MAX_PHOTOS && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex items-center gap-4 text-left"
        >
          <span className="flex h-[76px] w-[76px] items-center justify-center rounded-xl border border-line bg-white text-[28px] font-light text-accent">
            +
          </span>
          <span className="flex flex-col gap-1 text-[14px] text-text">
            <b className="font-semibold">Add up to {MAX_PHOTOS} photos</b>
            <span className="text-[13px] font-normal text-muted">
              PNG, JPG or WEBP up to {MAX_PHOTO_MB}MB each
            </span>
          </span>
        </button>
      )}

      {/* Le vrai champ fichier, caché : on l'ouvre avec le bouton ci-dessus.
          Il n'a pas de "name" : on envoie nous-mêmes les photos compressées. */}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        multiple
        hidden
        onChange={(e) => addFiles(e.target.files)}
      />

      {shown && (
        <p role="alert" className="w-full text-[12px] text-[#c0392b]">
          {shown}
        </p>
      )}
    </div>
  );
}
