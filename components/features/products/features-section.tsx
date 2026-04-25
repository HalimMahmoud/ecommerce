import { Truck, Shield, CreditCard } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function FeaturesSection() {
  const t = useTranslations();

  const features = [
    {
      icon: Truck,
      title: t('freeShipping'),
      desc: t('freeShippingDesc'),
    },
    {
      icon: Shield,
      title: t('qualityGuarantee'),
      desc: t('qualityDesc'),
    },
    {
      icon: CreditCard,
      title: t('securePayment'),
      desc: t('secureDesc'),
    },
  ];

  return (
    <section className="bg-muted py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div key={idx} className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-4 rounded-full bg-background">
                    <Icon className="text-primary" size={32} />
                  </div>
                </div>
                <h3 className="text-lg font-light mb-2 text-foreground">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

