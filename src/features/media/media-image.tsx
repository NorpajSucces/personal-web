import Image from "next/image";

import { getMediaUrl } from "./config";

export function MediaImage({
  alt,
  className,
  path,
  sizes = "(max-width: 768px) 100vw, 768px",
}: {
  alt: string;
  className?: string;
  path: string;
  sizes?: string;
}) {
  return (
    <Image
      src={getMediaUrl(path)}
      alt={alt}
      width={1600}
      height={900}
      sizes={sizes}
      className={className}
      unoptimized
    />
  );
}
