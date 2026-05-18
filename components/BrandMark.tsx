"use client";

import { useState } from "react";

export default function BrandMark() {
  const [src, setSrc] = useState("/logo.png");
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt="PR Study Abroad"
      className="h-9 w-9 object-contain"
      onError={() => setSrc("/logo.svg")}
    />
  );
}
