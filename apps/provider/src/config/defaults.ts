// import {BasicSettingsType, CurrencyType} from '../slices/setting.types';
import { Country } from '../components';
// import {Country, countries} from '../components';

export let DefaultCountry: Country = {
  name: 'Australia',
  flag: '🇦🇺',
  code: 'AU',
  dial_code: '+61',
};

// export const setDefaultCountry = (
//   countryDialCode: string = '+1',
//   countryCode: string = 'US',
// ) => {
//   const country = countries.find(
//     item => item.dial_code === countryDialCode && item.code === countryCode,
//   );
//   if (country) {
//     DefaultCountry = country;
//   }
// };

export interface CurrencyType {
  code: string;
  sign: string;
}

export let Currency: CurrencyType = {
  sign: '$',
  code: 'AUD',
};

export const setCurrency = (currency: CurrencyType = Currency) => {
  Currency = currency;
};

// export const getPaymentKey = (key: string, setting: BasicSettingsType) => {
//   let pk: string | undefined;
//   const paymentSetting = setting.paymentSettings.find(
//     itm => itm.payment_method === key,
//   );
//   if (setting.paymentMode === 'sandbox') {
//     pk = paymentSetting?.sandboxPublishabelKey;
//   } else if (setting.paymentMode === 'live') {
//     pk = paymentSetting?.livePublishabelKey;
//   } else {
//     console.log('Unknown payment mode.');
//   }
//   return pk;
// };
