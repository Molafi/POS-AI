import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';

interface DropZoneProps {
  onImageDrop: (file: File, base64: string) => void;
}

const DropZone: React.FC<DropZoneProps> = ({ onImageDrop }) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      onImageDrop(file, base64);
    };
    reader.readAsDataURL(file);
  }, [onImageDrop]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  });

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div
        {...getRootProps()}
        className={`relative w-full max-w-md aspect-square rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center gap-4 ${
          isDragActive
            ? 'border-apex-accent bg-apex-accent/5 shadow-[0_0_30px_rgba(79,142,247,0.2)]'
            : 'border-apex-border hover:border-apex-accent/50 hover:shadow-[0_0_20px_rgba(79,142,247,0.1)]'
        }`}
      >
        <input {...getInputProps()} />

        {/* Rotating dashed ring */}
        <div className="absolute inset-4 rounded-xl border border-dashed border-apex-accent/30 animate-[spin_20s_linear_infinite]" />

        <motion.div
          animate={{ scale: isDragActive ? 1.1 : 1 }}
          className="w-20 h-20 rounded-full bg-apex-accent/10 flex items-center justify-center"
        >
          <svg className="w-10 h-10 text-apex-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </motion.div>

        <div className="text-center z-10">
          <p className="text-apex-text-primary font-medium">
            {isDragActive ? 'Drop your image here' : 'Drop product image here'}
          </p>
          <p className="text-sm text-apex-text-secondary mt-1">or click to browse</p>
          <p className="text-xs text-apex-text-muted mt-2">JPG, PNG, WEBP up to 10MB</p>
        </div>
      </div>
    </div>
  );
};

export default DropZone;
