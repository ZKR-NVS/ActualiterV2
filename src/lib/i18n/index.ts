import fr from './fr';
import en from './en';
import { get } from 'lodash';

export const translations = {
  fr,
  en,
};

export type Language = 'fr' | 'en';

export const availableLanguages = [
  { code: 'fr', name: 'Français' },
  { code: 'en', name: 'English' },
];

export const defaultLanguage: Language = 'fr';

export const getTranslation = (key: string, lang: Language = defaultLanguage): any => {
  const translation = get(translations[lang], key, '');
  
  // Si la traduction n'existe pas dans la langue demandée, essayer avec la langue par défaut
  if (!translation && lang !== defaultLanguage) {
    return get(translations[defaultLanguage], key, key);
  }
  
  // Si la traduction n'existe pas du tout, retourner la clé
  return translation || key;
}; 