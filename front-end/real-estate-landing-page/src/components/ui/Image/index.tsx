"use client";

import NextImage from "next/image";
import { PhotoView } from "react-photo-view";

const Image = ({
  src,
  alt,
  width,
  height,
  className,
  unoptimized = false,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  className: string;
  unoptimized?: boolean;
}) => {
  return (
    <PhotoView src={src} key={src}>
      <NextImage
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
        unoptimized={unoptimized}
      />
    </PhotoView>
  );
};

export { Image };
