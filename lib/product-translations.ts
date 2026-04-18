export const productTranslations = {
  en: {
    loading: "Loading product...",
    notFound: "Product not found.",
    back: "Back",
    home: "Home",
    related: "Related products",
    descriptionTitle: "Product Description",
    descriptionPlaceholder:
      "This is a sample product description. Add real descriptions to highlight features, materials, and usage.",
    backToShop: "Back to shop",
  },
  ar: {
    loading: "جارٍ تحميل المنتج...",
    notFound: "المنتج غير موجود.",
    back: "رجوع",
    home: "الرئيسية",
    related: "منتجات متعلقة",
    descriptionTitle: "وصف المنتج",
    descriptionPlaceholder:
      "هذا وصف تجريبي للمنتج. أضف أوصافًا حقيقية لتسليط الضوء على الميزات والمواد والاستخدام.",
    backToShop: "العودة للمتجر",
  },
} as const;

export type ProductLang = keyof typeof productTranslations;
