import {useEffect} from 'react';
import {AppState} from 'react-native';
import {useAppSelector} from '../store/hooks';
import {startFirebaseNotifications} from '../utils/Firebase';

export const PushNotificationBridge = () => {
  const shouldRegister = useAppSelector(
    state =>
      Boolean(state.auth.isAuthorized) ||
      Boolean(state.auth.myProfile?.user?.id),
  );
  useEffect(() => {
    if (!shouldRegister) return;
    let stopped = false;
    let starting = false;
    let started = false;
    let retryDelay = 5000;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    let cleanup: () => void = () => undefined;
    const start = async () => {
      if (stopped || started || starting) return;
      starting = true;
      if (retryTimer) clearTimeout(retryTimer);
      retryTimer = undefined;
      try {
        const unsubscribe = await startFirebaseNotifications();
        if (stopped) unsubscribe();
        else {
          cleanup = unsubscribe;
          started = true;
        }
      } catch {
        // Firebase/Play Services can be unavailable at launch. Try again
        // without requiring the user to log out or restart the application.
        if (!stopped) {
          retryTimer = setTimeout(start, retryDelay);
          retryDelay = Math.min(retryDelay * 2, 60000);
        }
      } finally {
        starting = false;
      }
    };
    const appStateSubscription = AppState.addEventListener('change', state => {
      if (state === 'active') start();
    });
    start();
    return () => {
      stopped = true;
      if (retryTimer) clearTimeout(retryTimer);
      appStateSubscription.remove();
      cleanup();
    };
  }, [shouldRegister]);
  return null;
};
