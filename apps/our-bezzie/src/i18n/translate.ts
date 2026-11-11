import {TranslateOptions} from 'i18n-js';
import {TxKeyPath, i18n} from './i18n';
// import URLs from '../config/urls';
// import api from '../apis/api';

/**
 * Translates text.
 *
 * @param key The i18n key.
 * @param options The i18n options.
 * @returns The translated text.
 *
 * @example
 * Translations:
 *
 * ```en.ts
 * {
 *  "hello": "Hello, {{name}}!"
 * }
 * ```
 *
 * @uses
 * ```ts
 * import { translate } from "./i18n"
 *
 * translate("common.ok", { name: "world" })
 * // => "Hello world!"
 * ```
 */
export function translate(key: TxKeyPath, options?: TranslateOptions) {
  return i18n.t(key, options);
}

// Server Terminology Parser
export interface TerminologyData {
  lang: string;
  status: string;
  _id: string;
  store: string;
  user: string;
  type: string;
  values: Terminology[];
}

export interface Terminology {
  constant: string;
  value: string;
  label: string;
}

export type Translations = {
  [key: string]: string | Translations;
};

export function rebuildJsonFromFlatArray(
  flatArray: Terminology[],
): Translations {
  const result: Translations = {};

  flatArray.forEach(item => {
    const keys = item.constant.split('.');
    let currentLevel: Translations = result;

    keys.forEach((key, index) => {
      if (index === keys.length - 1) {
        currentLevel[key] = item.value;
      } else {
        if (typeof currentLevel[key] !== 'object') {
          currentLevel[key] = {};
        }
        currentLevel = currentLevel[key] as Translations;
      }
    });
  });

  return result;
}

// export async function loadTranslations() {
//   try {
//     const response = await api({
//       method: 'GET',
//       url: URLs.userTerminology,
//     });
//     let {values, lang} = response.data.data as TerminologyData;
//     let translation = rebuildJsonFromFlatArray(values);
//     i18n.store({[lang]: translation});
//   } catch (error) {
//     console.log('Load Translations error:', error);
//   }
// }
