import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DropZone from './DropZone';
import AIProcessing from './AIProcessing';
import UnsplashGallery from './UnsplashGallery';
import ProductForm from './ProductForm';
import { api } from '../../../lib/api';

interface AIAnalysisResult {
  name: string;
  description: string;
  category: string;
  suggestedPrice: number;
  suggestedCost: number;
  tags: string[];
  unit: string;
  barcode: string | null;
}

interface AddProductWizardProps {
  onClose: () => void;
  onProductAdded: () => void;
}

type WizardStep = 'dropzone' | 'processing' | 'gallery' | 'form';

const AddProductWizard: React.FC<AddProductWizardProps> = ({ onClose, onProductAdded }) => {
  const [step, setStep] = useState<WizardStep>('dropzone');
  const [aiStatus, setAiStatus] = useState<'analyzing' | 'complete' | 'error'>('analyzing');
  const [aiError, setAiError] = useState('');
  const [aiResult, setAiResult] = useState<AIAnalysisResult | null>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');

  const handleImageDrop = async (file: File, base64: string) => {
    const previewUrl = URL.createObjectURL(file);
    setOriginalImage(previewUrl);
    setSelectedImage(previewUrl);
    setStep('processing');
    setAiStatus('analyzing');

    const mimeType = file.type || 'image/jpeg';
    const response = await api.post<AIAnalysisResult>('/ai/analyze-image', {
      imageBase64: base64,
      mimeType,
    });

    if (response.success && response.data) {
      setAiResult(response.data);
      setAiStatus('complete');
      setTimeout(() => setStep('gallery'), 1000);
    } else {
      setAiStatus('error');
      setAiError(response.error || 'Analysis failed');
      // Still allow proceeding with manual entry
      setTimeout(() => setStep('form'), 2000);
    }
  };

  const handleImageSelect = (url: string) => {
    setSelectedImage(url);
  };

  const handleProceedToForm = () => {
    setStep('form');
  };

  const handleSave = async (data: {
    name: string;
    description: string;
    category: string;
    cost: number;
    price: number;
    stock: number;
    minStock: number;
    unit: string;
    barcode: string;
    sku: string;
    tags: string[];
    isActive: boolean;
    imageUrl: string;
  }) => {
    const productData = {
      ...data,
      imageUrl: selectedImage || data.imageUrl,
    };

    const response = await api.post('/products', productData);
    if (response.success) {
      onProductAdded();
    }
  };

  const stepTitles: Record<WizardStep, string> = {
    dropzone: 'Step 1: Upload Product Image',
    processing: 'Step 2: AI Analysis',
    gallery: 'Step 3: Choose Image',
    form: 'Step 4: Review & Save',
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-apex-surface border border-apex-border rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-apex-border flex items-center justify-between">
          <div>
            <h2 className="text-lg font-heading font-semibold text-apex-text-primary">AI Product Upload</h2>
            <p className="text-xs text-apex-text-secondary mt-0.5">{stepTitles[step]}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-apex-elevated flex items-center justify-center text-apex-text-secondary hover:text-apex-text-primary transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Step indicator */}
        <div className="px-6 py-3 flex gap-2">
          {(['dropzone', 'processing', 'gallery', 'form'] as WizardStep[]).map((s, i) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full transition-colors ${
                i <= ['dropzone', 'processing', 'gallery', 'form'].indexOf(step)
                  ? 'bg-apex-accent'
                  : 'bg-apex-border'
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <AnimatePresence mode="wait">
            {step === 'dropzone' && (
              <motion.div key="dropzone" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <DropZone onImageDrop={handleImageDrop} />
              </motion.div>
            )}

            {step === 'processing' && (
              <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <AIProcessing status={aiStatus} errorMessage={aiError} />
              </motion.div>
            )}

            {step === 'gallery' && (
              <motion.div key="gallery" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <UnsplashGallery
                  productName={aiResult?.name || ''}
                  originalImage={originalImage}
                  onSelect={handleImageSelect}
                />
                <div className="flex justify-end mt-4">
                  <button
                    onClick={handleProceedToForm}
                    className="px-4 py-2 bg-apex-accent text-white rounded-lg text-sm font-medium hover:bg-apex-accent-hover transition-colors"
                  >
                    Continue to Form
                  </button>
                </div>
              </motion.div>
            )}

            {step === 'form' && (
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <ProductForm
                  initialData={{
                    name: aiResult?.name || '',
                    description: aiResult?.description || '',
                    category: aiResult?.category || 'Other',
                    cost: aiResult?.suggestedCost || 0,
                    price: aiResult?.suggestedPrice || 0,
                    tags: aiResult?.tags || [],
                    unit: aiResult?.unit || 'piece',
                    barcode: aiResult?.barcode || '',
                    imageUrl: selectedImage,
                  }}
                  aiSuggested={!!aiResult}
                  onSave={handleSave}
                  onCancel={onClose}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default AddProductWizard;
