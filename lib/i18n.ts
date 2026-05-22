import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

export default getRequestConfig(async ({ locale }) => {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get('NEXT_LOCALE')?.value;
  
  // Use 'en' as a fallback if the locale is not provided or not supported
  const supportedLocales = ['en', 'ar'];
  const activeLocale = (locale && supportedLocales.includes(locale)) 
    ? locale 
    : (cookieLocale && supportedLocales.includes(cookieLocale)) 
      ? cookieLocale 
      : 'en';

  return {
    locale: activeLocale,
    messages: (await import(`./translations/${activeLocale}.json`)).default,
  };
});
