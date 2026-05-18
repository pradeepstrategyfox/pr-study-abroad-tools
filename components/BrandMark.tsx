"use client";

import { useEffect, useState } from "react";

// Tries to upgrade to /logo.png if it exists, otherwise renders /logo.svg.
// Avoids flash-of-broken-image while still picking up a user-supplied PNG.
export default function BrandMark() {
  const [src, setSrc] = useState("/logo.svg");

  useEffect(() => {
    const probe = new Image();
    probe.onload = () => setSrc("/logo.png");
    probe.src = "/logo.png";
  }, []);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="PR Study Abroad" className="h-9 w-9 object-contain" />
  );
}
