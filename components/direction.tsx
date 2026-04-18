"use client";

import { useEffect } from "react";
import { useUI } from "@/lib/store-context";

export default function DirectionSetter() {
  const { language, isRTL } = useUI();

  useEffect(() => {
    // Set document lang and direction based on current language
    try {
      document.documentElement.lang = language;
      document.documentElement.dir = isRTL ? "rtl" : "ltr";
    } catch (e) {
      // safe no-op on server or if DOM unavailable
    }
  }, [language, isRTL]);

  return null;
}
