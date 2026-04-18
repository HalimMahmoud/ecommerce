'use client';

import { X, Plus, Minus, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useUI, useCart } from '@/lib/store-context';
import { translations } from '@/lib/translations';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
}

export default function CartModal({ isOpen, onClose, onCheckout }: CartModalProps) {
  const { language } = useUI();
  const { cart, removeFromCart, updateQuantity, cartTotal } = useCart();
  const trans = translations[language];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 rounded-lg shadow-lg max-h-96 overflow-y-auto bg-card">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-light text-card-foreground">{trans.cart}</h2>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded transition">
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
                      alt={language === 'ar' ? item.nameAr : item.nameEn}
                      fill
                      className="object-cover rounded"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1">
                    <p className="text-sm font-light mb-1 text-card-foreground">
                      {language === 'ar' ? item.nameAr : item.nameEn}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.price} {trans.currency}
                    </p>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="p-1 rounded transition hover:bg-muted"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="text-sm w-6 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="p-1 rounded transition hover:bg-muted"
                      >
                        <Plus size={14} />
                      </button>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="ml-auto p-1 text-destructive rounded transition hover:bg-muted"
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
                <span>{trans.subtotal}:</span>
                <span>
                  {cartTotal.toFixed(2)} {trans.currency}
                </span>
              </div>
              <div className="flex justify-between text-sm font-light text-muted-foreground">
                <span>{trans.shipping}:</span>
                <span className="text-primary">{trans.free}</span>
              </div>
              <div className="flex justify-between text-base font-light border-t border-border pt-2 text-foreground">
                <span>{trans.total}:</span>
                <span className="text-primary">
                  {cartTotal.toFixed(2)} {trans.currency}
                </span>
              </div>
              <button
                onClick={onCheckout}
                className="w-full py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded font-light transition"
              >
                {trans.checkout}
              </button>
            </div>
          </>
        ) : (
          <div className="p-8 text-center">
            <p className="text-muted-foreground">{trans.emptyCart}</p>
          </div>
        )}
      </div>
    </div>
  );
}
