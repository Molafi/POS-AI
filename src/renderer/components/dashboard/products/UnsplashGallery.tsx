import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { api } from '../../../lib/api';

interface UnsplashImage {
  id: string;
  url: string;
  fullUrl: string;
  thumbUrl: string;
  alt: string;
  photographer: string;
}

interface UnsplashGalleryProps {
  productName: string;
  originalImage: string | null;
  onSelect: (imageUrl: string) => void;
}

const UnsplashGallery: React.FC<UnsplashGalleryProps> = ({ productName, originalImage, onSelect }) => {
  const [images, setImages] = useState<UnsplashImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUrl, setSelectedUrl] = useState<string | null>(originalImage);

  useEffect(() => {
    const fetchImages = async () => {
      setLoading(true);
      const response = await api.get<UnsplashImage[]>(`/unsplash/search?query=${encodeURIComponent(productName)}`);
      if (response.success && response.data) {
        setImages(response.data);
      }
      setLoading(false);
    };

    if (productName) {
      fetchImages();
    }
  }, [productName]);

  const handleSelect = (url: string) => {
    setSelectedUrl(url);
    onSelect(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-heading font-semibold text-apex-text-primary">Choose Product Image</h4>
        <p className="text-xs text-apex-text-muted">Click to select</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-2 border-apex-accent border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {/* Original uploaded image */}
          {originalImage && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSelect(originalImage)}
              className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                selectedUrl === originalImage ? 'border-apex-accent shadow-[0_0_10px_rgba(79,142,247,0.3)]' : 'border-apex-border hover:border-apex-accent/50'
              }`}
            >
              <img src={originalImage} alt="Original upload" className="w-full h-full object-cover" />
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1">
                <p className="text-[10px] text-white">Original</p>
              </div>
              {selectedUrl === originalImage && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-apex-accent flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </motion.button>
          )}

          {/* Unsplash images */}
          {images.map((img) => (
            <motion.button
              key={img.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSelect(img.url)}
              className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                selectedUrl === img.url ? 'border-apex-accent shadow-[0_0_10px_rgba(79,142,247,0.3)]' : 'border-apex-border hover:border-apex-accent/50'
              }`}
            >
              <img src={img.thumbUrl || img.url} alt={img.alt} className="w-full h-full object-cover" />
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1">
                <p className="text-[10px] text-white truncate">{img.photographer}</p>
              </div>
              {selectedUrl === img.url && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-apex-accent flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </motion.button>
          ))}

          {images.length === 0 && !loading && (
            <div className="col-span-full py-4 text-center text-apex-text-muted text-sm">
              No images found. Using uploaded image.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UnsplashGallery;
