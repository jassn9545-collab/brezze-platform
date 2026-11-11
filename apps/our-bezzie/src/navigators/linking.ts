import type {LinkingOptions} from '@react-navigation/native';
import type {RootStackParamList} from './navigationUtilities';

export const providerLinking: LinkingOptions<RootStackParamList> = {
  prefixes: ['bezzieprovider://'],
  config: {
    initialRouteName: 'Drawer',
    screens: {
      PaymentAccount: 'stripe/onboarding/:result',
    },
  },
};
