import { useEffect, useState } from "react";

export interface UseImageLoaderProps {
  images: MyImage[];
}

export interface UseImageLoader {
  loadedImages: MyImage[];
}

export interface MyImage {
  src: string;
  name?: string;
  image?: HTMLImageElement;
}

const useImageLoader: (props: UseImageLoaderProps) => UseImageLoader = ({ images }) => {
  const [loadedImages, setLoadedImages] = useState<MyImage[]>([]);

  async function loadImageURL(url: string) {
    return new Promise<HTMLImageElement>((resolve, reject) => {
      const elem = new Image();
      elem.onload = () => resolve(elem);
      elem.onerror = reject;
      elem.src = url;
      return elem;
    });
  }

  const loadImages = async () => {
    const newLoadedImages: MyImage[] = [];
    for (let i = 0; i < images.length; i++) {
      const element = await loadImageURL(images[i].src);
      newLoadedImages[i] = { image: element, src: images[i].src, name: images[i]?.name };
    }
    setLoadedImages(newLoadedImages);
  };

  useEffect(() => {
    setLoadedImages([]);
    loadImages();
  }, [images]);

  return { loadedImages };
};

export default useImageLoader;
