import {
  NavigationState,
  createNavigationContainerRef,
} from '@react-navigation/native';
import {useEffect, useRef} from 'react';

import {AppStackParamList} from './AppStack';
import {BackHandler} from 'react-native';
import {AuthStackParamList} from './AuthStack';

/**
 * typing for useNavigation hook
 */
export type RootStackParamList = AppStackParamList & AuthStackParamList;
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

/**
 * Reference to the root App Navigator.
 *
 * If needed, you can use this to access the navigation object outside of a
 * `NavigationContainer` context. However, it's recommended to use the `useNavigation` hook whenever possible.
 * @see https://reactnavigation.org/docs/navigating-without-navigation-prop/
 *
 * The types on this reference will only let you reference top level navigators. If you have
 * nested navigators, you'll need to use the `useNavigation` with the stack navigator's ParamList type.
 */
export const navigationRef = createNavigationContainerRef<RootStackParamList>();

/**
 * Gets the current screen from any navigation state.
 */
export function getActiveRouteName(
  state: ReturnType<typeof navigationRef.getRootState>,
): keyof AppStackParamList {
  const route = state.routes[state.index];

  // Found the active route -- return the name
  if (!route.state) {
    return route.name as keyof AppStackParamList;
  }

  // Recursive call to deal with nested routers
  return getActiveRouteName(route.state as NavigationState<AppStackParamList>);
}

/**
 * Hook that handles Android back button presses and forwards those on to
 * the navigation or allows exiting the app.
 */
export function useBackButtonHandler(canExit: (routeName: string) => boolean) {
  // The reason we're using a ref here is because we need to be able
  // to update the canExit function without re-setting up all the listeners
  const canExitRef = useRef(canExit);

  useEffect(() => {
    canExitRef.current = canExit;
  }, [canExit]);

  useEffect(() => {
    // We'll fire this when the back button is pressed on Android.
    const onBackPress = () => {
      if (!navigationRef.isReady()) {
        return false;
      }

      // grab the current route
      const routeName = getActiveRouteName(navigationRef.getRootState());

      // are we allowed to exit?
      if (canExitRef.current(routeName)) {
        // exit and let the system know we've handled the event
        BackHandler.exitApp();
        return true;
      }

      // we can't exit, so let's turn this into a back action
      if (navigationRef.canGoBack()) {
        navigationRef.goBack();
        return true;
      }

      return false;
    };

    // Subscribe when we come to life
    const listner = BackHandler.addEventListener(
      'hardwareBackPress',
      onBackPress,
    );

    // Unsubscribe when we're done
    return () => listner.remove();
  }, []);
}

/**
 * use this to navigate without the navigation
 * prop. If you have access to the navigation prop, do not use this.
 * @see {@link https://reactnavigation.org/docs/navigating-without-navigation-prop/}
 * @param {unknown} name - The name of the route to navigate to.
 * @param {unknown} params - The params to pass to the route.
 */
export function navigate(name: unknown, params?: unknown) {
  if (navigationRef.isReady()) {
    // @ts-ignore
    navigationRef.navigate(name as never, params as never);
  }
}

/**
 * This function is used to go back in a navigation stack, if it's possible to go back.
 * If the navigation stack can't go back, nothing happens.
 * The navigationRef variable is a React ref that references a navigation object.
 * The navigationRef variable is set in the App component.
 */
export function goBack() {
  if (navigationRef.isReady() && navigationRef.canGoBack()) {
    navigationRef.goBack();
  }
}

/**
 * resetRoot will reset the root navigation state to the given params.
 * @param {Parameters<typeof navigationRef.resetRoot>[0]} state - The state to reset the root to.
 */
export function resetRoot(
  state: Parameters<typeof navigationRef.resetRoot>[0] = {index: 0, routes: []},
) {
  if (navigationRef.isReady()) {
    navigationRef.resetRoot(state);
  }
}
