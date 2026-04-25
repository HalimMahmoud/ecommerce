'use client';

import Image from 'next/image';
import { ShoppingCart, Trash2, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useWishlist } from '@/lib/store-context';

interface WishlistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WishlistModal({ isOpen, onClose }: WishlistModalProps) {
  const t = useTranslations();
  const { wishlist, removeFromWishlist, moveToCartFromWishlist } = useWishlist();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 rounded-lg shadow-lg max-h-[80vh] overflow-y-auto bg-card">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-card flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-light text-card-foreground">{t('wishlist')}</h2>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded transition" aria-label="Close wishlist">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        {wishlist.length > 0 ? (
          <div className="p-4 space-y-4">
            {wishlist.map(item => (
              <div key={item.id} className="flex gap-4 p-3 rounded bg-muted">
                {/* Image */}
                <div className="relative w-16 h-16 flex-shrink-0">
                  <Image
                    src={item.image || '/placeholder.svg'}
                    alt={item.name}

                    fill
                    className="object-cover rounded"
                  />
                </div>

                {/* Details */}
                <div className="flex-1">
                  <p className="text-sm font-light mb-1 text-card-foreground">
                    {item.name}

                  </p>
                  <p className="text-xs text-muted-foreground mb-2">
                    {item.price} {t('currency')}
                  </p>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => moveToCartFromWishlist(item)}
                      className="flex-1 flex items-center justify-center gap-1 py-1 text-xs rounded transition bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      <ShoppingCart size={14} />
                      {t('moveToCart')}
                    </button>
                    <button
                      onClick={() => removeFromWishlist(item.id)}
                      className="p-1 rounded transition text-destructive hover:bg-muted"
                      aria-label="Remove from wishlist"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-muted-foreground">{t('emptyWishlist')}</p>
          </div>
        )}
      </div>
    </div>
  );
}

