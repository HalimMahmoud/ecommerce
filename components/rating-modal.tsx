'use client';

import { X } from 'lucide-react';
import { useState } from 'react';
import { useUI, useProducts } from '@/lib/store-context';
import { translations } from '@/lib/translations';
import StarRating from './star-rating';
import type { Product } from '@/lib/types';

interface RatingModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function RatingModal({ product, isOpen, onClose }: RatingModalProps) {
  const { language } = useUI();
  const { rateProduct } = useProducts();
  const [selectedRating, setSelectedRating] = useState(0);
  const trans = translations[language];

  if (!isOpen || !product) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRating > 0) {
      rateProduct(product.id, selectedRating, product);
      setSelectedRating(0);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 rounded-lg shadow-lg p-6 bg-card">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-light text-card-foreground">{trans.rateThisProduct}</h2>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded transition">
            <X size={20} />
          </button>
        </div>

        {/* Product Name */}
        <p className="text-sm mb-4 text-muted-foreground">
          {language === 'ar' ? product.nameAr : product.nameEn}
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating Selection */}
          <div>
            <label className="block text-sm font-light mb-3 text-card-foreground">
              {trans.yourRating}
            </label>
            <StarRating rating={selectedRating} onRate={setSelectedRating} interactive size={32} />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={selectedRating === 0}
            className={`w-full py-2 rounded font-light transition ${
              selectedRating === 0
                ? 'bg-muted text-muted-foreground cursor-not-allowed'
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
            }`}
          >
            {trans.confirmOrder}
          </button>
        </form>
      </div>
    </div>
  );
}
