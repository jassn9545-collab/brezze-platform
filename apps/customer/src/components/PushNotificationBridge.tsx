import {useEffect} from 'react';
import {useAppSelector} from '../store/hooks';
import {startFirebaseNotifications} from '../utils/Firebase';

export const PushNotificationBridge = () => {
  const userId = useAppSelector(state => state.auth.myProfile?.user?.id);
  useEffect(() => {
    if (!userId) return;
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
  }, [userId]);
  return null;
};
