import {useCallback, useRef, useState} from 'react';
import {AppState, Linking} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {getStripeAccountStatus, StripeAccountStatus} from '../apis/stripe';

// A browser round-trip keeps the same navigation screen focused. Refresh on
// resume as well as focus, and ignore requests belonging to an older visit.
export const useStripeAccountStatus = (onRefresh?: () => void) => {
  const [status, setStatus] = useState<StripeAccountStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const generation = useRef(0);
  const refreshProfile = useRef(onRefresh);
  refreshProfile.current = onRefresh;

  const refresh = useCallback(async () => {
    const request = ++generation.current;
    setLoading(true);
    refreshProfile.current?.();
    try {
      const latest = await getStripeAccountStatus();
      if (generation.current === request) setStatus(latest);
    } catch {
      // The shared API client displays the error; retain the last known status.
    } finally {
      if (generation.current === request) setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    refresh();
    let previous = AppState.currentState;
    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active' && previous !== 'active') refresh();
      previous = state;
    });
    // A warm deep link can reuse this screen without another focus or resume.
    const linkSubscription = Linking.addEventListener('url', ({url}) => {
      if (/^bezzieprovider:\/\/stripe\/onboarding\/(return|refresh)(?:[?#]|$)/.test(url)) {
        refresh();
      }
    });
    return () => {
      ++generation.current;
      subscription.remove();
      linkSubscription.remove();
    };
  }, [refresh]));

  return {status, loading, refresh};
};
