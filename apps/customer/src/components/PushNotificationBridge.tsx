import {useEffect} from 'react';
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
    let cleanup: () => void = () => undefined;
    startFirebaseNotifications().then(unsubscribe => {
      if (stopped) unsubscribe();
      else cleanup = unsubscribe;
    });
    return () => {
      stopped = true;
      cleanup();
    };
  }, [shouldRegister]);
  return null;
};
