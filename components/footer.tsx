'use client';

import { Facebook, Instagram, Twitter, Youtube, Phone, Mail, MapPin } from 'lucide-react';
import { useUI } from '@/lib/store-context';
import { translations } from '@/lib/translations';

export default function Footer() {
  const { language } = useUI();
  const trans = translations[language];

  const quickLinks = [trans.contactUs, trans.trackOrder, trans.returnPolicy, trans.shippingInfo];

  const legal = [trans.privacyPolicy, trans.terms, trans.faq];

  return (
    <footer className="bg-card text-card-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* About */}
          <div>
            <h3 className="text-lg font-light mb-4">{trans.siteName}</h3>
            <p className="text-muted-foreground text-sm font-light">
              Premium e-commerce platform offering curated products for your lifestyle.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-light mb-4">{trans.quickLinks}</h3>
            <ul className="space-y-2">
              {quickLinks.map((link, idx) => (
                <li key={idx}>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground text-sm font-light transition"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-light mb-4">{trans.customerService}</h3>
            <ul className="space-y-2">
              {legal.map((link, idx) => (
                <li key={idx}>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground text-sm font-light transition"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-light mb-4">{trans.contactUs}</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone size={16} />
                <span className="text-sm font-light">+966 1 234 5678</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail size={16} />
                <span className="text-sm font-light">info@gulfstore.com</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin size={16} />
                <span className="text-sm font-light">Riyadh, Saudi Arabia</span>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border my-8" />

        {/* Bottom */}
        <div className="flex flex-col md:flex-row items-center justify-between">
          <p className="text-muted-foreground text-sm font-light mb-4 md:mb-0">
            © 2024 {trans.siteName}. {trans.allRights}.
          </p>

          {/* Social */}
          <div className="flex items-center gap-4">
            <a href="#" className="text-muted-foreground hover:text-foreground transition">
              <Facebook size={20} />
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition">
              <Instagram size={20} />
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition">
              <Twitter size={20} />
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition">
              <Youtube size={20} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
