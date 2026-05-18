"use client";

import { useState } from "react";

type Props = {
  primary?: string;
  fallback?: string;
  alt: string;
  className?: string;
};

// Tries primary, then fallback, then renders nothing.
// Eliminates the broken-image "blob" in cards.
export default function CoverImage({ primary, fallback, alt, className }: Props) {
  const [stage, setStage] = useState<"primary" | "fallback" | "none">(primary ? "primary" : fallback ? "fallback" : "none");

  if (stage === "none") return null;
  const src = stage === "primary" ? primary! : fallback!;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => {
        if (stage === "primary" && fallback) setStage("fallback");
        else setStage("none");
      }}
    />
  );
}
