"use client";

import { PhotoSlider } from "react-photo-view";

interface PropertyPhotoLightboxProps {
  images: Array<{
    src: string;
    key: string;
  }>;
  visible: boolean;
  index: number;
  onClose: () => void;
  onIndexChange: (index: number) => void;
}

const PropertyPhotoLightbox = ({
  images,
  visible,
  index,
  onClose,
  onIndexChange,
}: PropertyPhotoLightboxProps) => {
  return (
    <PhotoSlider
      images={images}
      visible={visible}
      onClose={onClose}
      index={index}
      onIndexChange={onIndexChange}
    />
  );
};

export default PropertyPhotoLightbox;
