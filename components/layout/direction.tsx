"use client";

import { useEffect } from "react";
import { useLocale } from "next-intl";

export default function DirectionSetter() {
  const locale = useLocale();
  const isRTL = locale === "ar";

  useEffect(() => {
    // Set document lang and direction based on current language
    try {
      document.documentElement.lang = locale;
      document.documentElement.dir = isRTL ? "rtl" : "ltr";
    } catch (e) {
      // safe no-op on server or if DOM unavailable
    }
  }, [locale, isRTL]);

  return null;
}

