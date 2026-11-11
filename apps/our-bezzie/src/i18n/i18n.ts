import { I18n } from 'i18n-js';
import { I18nManager } from 'react-native';

// if English isn't your default language, move Translations to the appropriate language file.
import en, { Translations } from './en';
// import kn from './kn';
import AsyncStorage from '@react-native-async-storage/async-storage';

// import {loadTranslations} from './translate';

/**
 * we need always include "*-US" for some valid language codes because when you change the system language,
 * the language code is the suffixed with "-US". i.e. if a device is set to English ("en"),
 * if you change to another language and then return to English language code is now "en-US".
 */
// export const i18n = new I18n({en}, {enableFallback: true});
export const i18n = new I18n(
  {
    en,
    'en-US': en,
    // kn,
    // 'kn-IN': kn,
  },
  { enableFallback: true },
);

// The preferred language is the first element in the array, however, we fallback to en-US, especially for tests.
const preferredLanguage = {
  languageTag: 'en',
  textDirection: 'ltr',
};
i18n.locale = preferredLanguage.languageTag;

// handle RTL languages
export const isRTL = preferredLanguage.textDirection === 'rtl';
I18nManager.allowRTL(isRTL);
I18nManager.forceRTL(isRTL);

/**
 * Builds up valid keypaths for translations.
 */
export type TxKeyPath = RecursiveKeyOf<Translations>;

// via: https://stackoverflow.com/a/65333050
type RecursiveKeyOf<TObj extends object> = {
  [TKey in keyof TObj & (string | number)]: RecursiveKeyOfHandleValue<
    TObj[TKey],
    `${TKey}`
  >;
}[keyof TObj & (string | number)];

type RecursiveKeyOfInner<TObj extends object> = {
  [TKey in keyof TObj & (string | number)]: RecursiveKeyOfHandleValue<
    TObj[TKey],
    `['${TKey}']` | `.${TKey}`
  >;
}[keyof TObj & (string | number)];

type RecursiveKeyOfHandleValue<
  TValue,
  Text extends string,
> = TValue extends any[]
  ? Text
  : TValue extends object
  ? Text | `${Text}${RecursiveKeyOfInner<TValue>}`
  : Text;

/**
 * Loads server translations
 */
// loadTranslations();

// Check is traslations changes
i18n.onChange(() => {
  console.log(`I18n has changed with new version: ${i18n.version}`);
  console.log('Available translations:', Object.keys(i18n.translations));
});

export const loadSavedLanguage = async () => {
  const lang = (await AsyncStorage.getItem('language')) as 'en' | 'kn';
  if (lang) {
    i18n.locale = lang;
  }
};