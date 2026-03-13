import * as Screens from '../screens';

import {
  NativeStackScreenProps,
  createNativeStackNavigator,
} from '@react-navigation/native-stack';
import React, { FC } from 'react';

import { colors } from '../theme';

/**
 * This type allows TypeScript to know what routes are defined in this navigator
 * as well as what properties (if any) they might take when navigating to them.
 *
 * If no params are allowed, pass through `undefined`. Generally speaking, we
 * recommend using your MobX-State-Tree store(s) to keep application state
 * rather than passing state through navigation params.
 *
 * For more information, see this documentation:
 *   https://reactnavigation.org/docs/params/
 *   https://reactnavigation.org/docs/typescript#type-checking-the-navigator
 *   https://reactnavigation.org/docs/typescript/#organizing-types
 */

export type AuthStackParamList = {
  Walkthrough: undefined;
  Login: undefined;
  Signup: undefined;
  Verification: Screens.VerificationParams;
  ForgotPassword: undefined;
  ResetPassword: Screens.ResetParams;
  CommonSucess: Screens.CommonSucessParams;
  MyDocuments: undefined
  UploadUserDetail: undefined
  UploadDocument: undefined
  DocumentReview: undefined
  // PrivacyPolicy: { title: TxKeyPath; type: Screens.StaticType } | undefined;
  // TermsCondition: { title: TxKeyPath; type: Screens.StaticType } | undefined;
};

export type AuthStackScreenProps<T extends keyof AuthStackParamList> =
  NativeStackScreenProps<AuthStackParamList, T, 'Auth'>;

// Documentation: https://reactnavigation.org/docs/stack-navigator/
const Stack = createNativeStackNavigator<AuthStackParamList, 'Auth'>();

type AuthStackProps = {
  initialRouteName?: keyof AuthStackParamList;
};

export const AuthStack: FC<AuthStackProps> = () => {
  return (
    <Stack.Navigator
      id="Auth"
      screenOptions={{
        headerShown: false,
        navigationBarColor: colors.background,
      }}
      // initialRouteName={props.initialRouteName}
      initialRouteName="Walkthrough"
    >
      <Stack.Screen
        options={{
          animation: 'fade',
        }}
        name="Walkthrough"
        component={Screens.WalkthroughScreen}
      />
      <Stack.Screen
        options={{
          animation: 'fade',
        }}
        name="Login"
        component={Screens.LoginScreen}
      />
      <Stack.Screen name="Signup" component={Screens.SignupScreen} />
      <Stack.Screen
          name="Verification"
          component={Screens.VerificationScreen}
        /> 
      <Stack.Screen
        name="ForgotPassword"
        component={Screens.ForgotPasswordScreen}
      />
       <Stack.Screen
        name="ResetPassword"
        component={Screens.ResetPasswordScreen}
      />
       <Stack.Screen
        name="CommonSucess"
        component={Screens.CommonSucessScreen}
      />
       <Stack.Screen
        name="MyDocuments"
        component={Screens.MyDocumentsScreen}
      />
       <Stack.Screen
        name="UploadUserDetail"
        component={Screens.UploadUserDetailScreen}
      />
         <Stack.Screen
        name="UploadDocument"
        component={Screens.UploadDocumentScreen}
      />
         <Stack.Screen
        name="DocumentReview"
        component={Screens.DocumentReviewScreen}
      />
      {/* 

      {/* <Stack.Screen
         name="PrivacyPolicy"
         component={Screens.StaticScreen<'PrivacyPolicy'>}
         initialParams={{ type: 'privacy', title: 'auth.privacyPolicy' }}
       />
       <Stack.Screen
         name="TermsCondition"
         component={Screens.StaticScreen<'TermsCondition'>}
         initialParams={{ type: 'terms', title: 'auth.termsAndConditions' }}
       /> */}
    </Stack.Navigator>
  );
};
