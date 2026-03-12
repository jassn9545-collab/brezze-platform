import React, { FC } from 'react';
import {
  navigationRef,
  RootStackParamList,
} from './navigationUtilities';
// import Config from '../config';
import { NavigationContainer } from '@react-navigation/native';
import { AuthStack } from './AuthStack';
// import { AppStack } from './AppStack';
// import { connect, ConnectedProps } from 'react-redux';
// import { RootState } from '../store/store';
// import { authActions, getAuthorization } from '../slices/auth.slice';
// import { Linking } from 'react-native';
// import { handleInviteURL } from '../utils/util';

/**
 * This is a list of all the route names that will exit the app if the back button
 * is pressed while in that screen. Only affects Android.
 */
// const exitRoutes = Config.exitRoutes;

export interface NavigationProps
  extends Partial<
    React.ComponentProps<typeof NavigationContainer<RootStackParamList>>
  > {}

// type Props = NavigationProps & ConnectedProps<typeof connector>;

const MainNavigator: FC<NavigationProps> = props => {
  // useBackButtonHandler(routeName => exitRoutes.includes(routeName));

  // useEffect(() => {
  //   props.getAuthorization();

  //   const handleOpenURL = ({ url }: { url: string }) => {
  //     const inviteCode = handleInviteURL(url);
  //     if (inviteCode) {
  //       props.setReferralCode(inviteCode);
  //     }
  //   };
  //   const subscribe = Linking.addEventListener('url', handleOpenURL);
  //   return () => subscribe.remove();

  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

  // if (props.booting === 'loading') {
  //   return <></>;
  // }

  return (
    <NavigationContainer {...props} ref={navigationRef}>
       {/* {props.isAuthorize ? ( */}
        {/* <AppStack /> */}
      {/* ) : (  */}
         <AuthStack
        //  initialRouteName={props.initialRouteName}
         /> 
       {/* )} */}
    </NavigationContainer>
  );
};

// const mapState = (state: RootState) => ({
//   booting: state.auth.booting,
//   isAuthorize: state.auth.isAuthorized,
//   initialRouteName: state.auth.initialRouteName,
// });

// const mapDispatch = {
//   getAuthorization,
//   setReferralCode: authActions.setReferralCode,
// };

// const connector = connect(mapState, mapDispatch);
export default MainNavigator;
