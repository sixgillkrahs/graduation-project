"use client";

import NextImage, { ImageProps as NextImageProps } from "next/image";
import { PhotoView } from "react-photo-view";

type ImageProps = Omit<NextImageProps, "src"> & {
  src: string;
};

const Image = ({ src, alt, className, ...rest }: ImageProps) => {
  return (
    <PhotoView src={src} key={src}>
      <NextImage src={src} alt={alt} className={className} {...rest} />
    </PhotoView>
  );
};

export { Image };
