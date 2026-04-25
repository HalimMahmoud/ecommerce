import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

export default getRequestConfig(async () => {
  // Locale detection strategy:
  // 1. Check cookies for NEXT_LOCALE (set by proxy.ts)
  // 2. Default to 'en'
  const cookieStore = await cookies();
  const locale = cookieStore.get('NEXT_LOCALE')?.value || 'en';

  return {
    locale,
    messages: (await import(`./translations/${locale}.json`)).default,
  };
});
