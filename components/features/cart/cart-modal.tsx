'use client';

import Image from 'next/image';
import { X, Minus, Plus, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCart } from '@/lib/store-context';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
}

export default function CartModal({ isOpen, onClose, onCheckout }: CartModalProps) {
  const t = useTranslations();
  const { cart, removeFromCart, updateQuantity, cartTotal } = useCart();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 rounded-lg shadow-lg max-h-[80vh] overflow-y-auto bg-card">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-card flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-light text-card-foreground">{t('cart')}</h2>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded transition" aria-label="Close cart">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        {cart.length > 0 ? (
          <>
            <div className="p-4 space-y-4">
              {cart.map(item => (
                <div key={item.id} className="flex gap-4 p-2 rounded bg-muted">
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
                    <p className="text-xs text-muted-foreground">
                      {item.price} {t('currency')}
                    </p>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="p-1 rounded transition hover:bg-muted"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="text-sm w-6 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="p-1 rounded transition hover:bg-muted"
                        aria-label="Increase quantity"
                      >
                        <Plus size={14} />
                      </button>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="ml-auto p-1 text-destructive rounded transition hover:bg-muted"
                        aria-label="Remove item"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 border-t border-border bg-muted p-4 space-y-3">
              <div className="flex justify-between text-sm font-light text-muted-foreground">
                <span>{t('subtotal')}:</span>
                <span>
                  {cartTotal.toFixed(2)} {t('currency')}
                </span>
              </div>
              <div className="flex justify-between text-sm font-light text-muted-foreground">
                <span>{t('shipping')}:</span>
                <span className="text-primary">{t('free')}</span>
              </div>
              <div className="flex justify-between text-base font-light border-t border-border pt-2 text-foreground">
                <span>{t('total')}:</span>
                <span className="text-primary">
                  {cartTotal.toFixed(2)} {t('currency')}
                </span>
              </div>
              <button
                onClick={onCheckout}
                className="w-full py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded font-light transition"
              >
                {t('checkout')}
              </button>
            </div>
          </>
        ) : (
          <div className="p-8 text-center">
            <p className="text-muted-foreground">{t('emptyCart')}</p>
          </div>
        )}
      </div>
    </div>
  );
}

