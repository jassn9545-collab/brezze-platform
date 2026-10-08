/**
 * @format
 */

import 'fast-text-encoding';
import { AppRegistry } from 'react-native';
import { getApp } from '@react-native-firebase/app';
import { getMessaging, setBackgroundMessageHandler } from '@react-native-firebase/messaging';
import App from './src/app';
import { name as appName } from './app.json';

try {
  setBackgroundMessageHandler(getMessaging(getApp()), async () => {
    // Notification payloads are displayed by the OS; data is available here
    // for future background synchronization.
  });
} catch {
  // Keep local development usable until Firebase config files are installed.
}

AppRegistry.registerComponent(appName, () => App);
