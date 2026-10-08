import './i18n';
import './utils/Location';

import { Text, TextInput } from 'react-native';
import React from 'react';
import {
  SafeAreaProvider,
  initialWindowMetrics,
} from 'react-native-safe-area-context';
import Toast, { ToastProvider } from 'react-native-toast-notifications';
import AppNavigator from './navigators/AppNavigator';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { toastProps } from './utils/toast';
import { Provider } from 'react-redux';
import { store } from './store';
import api from './apis/api';
import BootSplash from 'react-native-bootsplash';
import { PushNotificationBridge } from './components/PushNotificationBridge';
// import {UpdateView} from './screens/UpdateView';
// import {AnimatedBootSplash, AnimatedBootSplashRef} from './components';
// import BootSplash from 'react-native-bootsplash';
// import { getMessaging, onMessage, setBackgroundMessageHandler } from '@react-native-firebase/messaging';
// import { onMessageReceived } from './utils/Firebase';
// import { loadSavedLanguage } from './i18n';
// import useScreenLog from './analytics/useScreenLog';

// Disable font scaling
interface TextWithDefaultProps extends Text {
  defaultProps?: { allowFontScaling?: boolean };
}

interface TextInputWithDefaultProps extends TextInput {
  defaultProps?: { allowFontScaling?: boolean };
}

(Text as unknown as TextWithDefaultProps).defaultProps =
  (Text as unknown as TextWithDefaultProps).defaultProps || {};
(Text as unknown as TextWithDefaultProps).defaultProps!.allowFontScaling =
  false;
(TextInput as unknown as TextInputWithDefaultProps).defaultProps =
  (TextInput as unknown as TextInputWithDefaultProps).defaultProps || {};
(
  TextInput as unknown as TextInputWithDefaultProps
).defaultProps!.allowFontScaling = false;

// let messaging = getMessaging();

// setBackgroundMessageHandler(messaging, async message => {
//   if (Platform.OS === 'ios') {
//     await onMessageReceived(message);
//   } else {
//     console.log('New background notification message:', message);
//   }
// });

type AppProps = {
  apiBaseUrl?: string;
};

function App({ apiBaseUrl }: AppProps): React.JSX.Element {
  if (apiBaseUrl) {
    api.defaults.baseURL = apiBaseUrl;
  }
  // const animatedBootSplash = React.useRef<AnimatedBootSplashRef>(null);
  // const {onReady, onStateChange} = useScreenLog();

  // useEffect(() => {
  //   loadSavedLanguage()
  //   const unsubscribe = onMessage(messaging, onMessageReceived);
  //   return () => {
  //     unsubscribe();
  //   };
  // }, []);

  const hideSplash = async () => {
    await BootSplash.hide({ fade: true });
  };

  return (
    <GestureHandlerRootView>
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        <Provider store={store}>
          <ToastProvider {...toastProps}>
            <PushNotificationBridge />
            <AppNavigator
              // onReady={() => animatedBootSplash.current?.hide()}
              onReady={hideSplash}
              // onStateChange={onStateChange}
            />
            {/* <AnimatedBootSplash
              ref={animatedBootSplash}
              onAnimationEnd={hideSplash}
            /> */}
            <Toast {...toastProps} />
            {/* <UpdateView /> */}
          </ToastProvider>
        </Provider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default App;
