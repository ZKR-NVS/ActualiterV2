declare module 'date-fns/locale' {
  import { Locale } from 'date-fns';
  
  export const fr: Locale;
  export const enUS: Locale;
  export const de: Locale;
  export const es: Locale;
  export const it: Locale;
  export const nl: Locale;
  export const pt: Locale;
  export const ru: Locale;
  // Ajoutez d'autres locales si nécessaire
}

// Déclaration pour ajouter le support de l'option locale à format
declare module 'date-fns' {
  import { Locale } from 'date-fns';
  
  interface FormatOptions {
    locale?: Locale;
    weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
    firstWeekContainsDate?: number;
    useAdditionalWeekYearTokens?: boolean;
    useAdditionalDayOfYearTokens?: boolean;
  }
  
  export function format(date: Date | number, formatStr: string, options?: FormatOptions): string;
} 