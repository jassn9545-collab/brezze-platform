// import * as Firebase from '../utils/Firebase';

import { AuthHeader, Loader, Screen, Text } from '../components';
import {
  Image,
  Keyboard,
  PermissionsAndroid,
  Platform,
  TextInput,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import React, { FC, useEffect, useMemo, useRef, useState } from 'react';
import { Signin, buildError, loginSchema } from '../apis/schema';
import { TextField, TextFieldAccessoryProps } from '../components/TextField';
import { colors, images, spacing } from '../theme';

import { AuthStackScreenProps } from '../navigators';
import { Button } from '../components/Button';
import { TxKeyPath } from '../i18n';
import { connect, ConnectedProps } from 'react-redux';
import { authActions, userLogin } from '../slices/auth.slice';
// import { getMessaging, getToken } from '@react-native-firebase/messaging';
import { RootState } from '../store';

type NavigationProps = AuthStackScreenProps<'Login'>;
type StoreProps = ConnectedProps<typeof connector>;
type Props = NavigationProps & StoreProps;

type FieldError = {
  email?: TxKeyPath | undefined;
  password?: TxKeyPath | undefined;
};

export const emailLeftAccessory = (props: TextFieldAccessoryProps) => {
  return (
    <View style={[props.style, $inputAccessoryStyle]}>
      <Image source={images.emailIcon} />
    </View>
  );
};

const passwordLeftAccessory = (props: TextFieldAccessoryProps) => {
  return (
    <View style={[props.style, $inputAccessoryStyle]}>
      <Image source={images.lockIcon} />
    </View>
  );
};

const Login: FC<Props> = (
  {
      navigation,
      loading,
      clearLoginLoading,
      user_Login,
  },
) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const passwordField = useRef<TextInput>(null);
  const [isAuthPasswordHidden, setIsAuthPasswordHidden] = useState(false);
  const [error, setError] = useState<FieldError>({});
  //   const [firebaseToken, setFirebaseToken] = useState('');

    useEffect(() => {
      if (loading === 'loaded') {
        clearLoginLoading();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loading]);

  useEffect(() => {
    // (async () => {
    //   Firebase.requestPermission();
    //   Firebase.createChannels();
    //   const messaging = getMessaging();
    //   const token = await getToken(messaging);
    //   setFirebaseToken(token);
    // })();
    locationPermission();
    return () => {
      setEmail('');
      setPassword('');
    };
  }, []);

  const locationPermission = async () => {
    if (Platform.OS === 'android') {
      PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
    }
  };

  const validate = () => {
    let loginParams: Signin = {
      email,
      password,
      user_type: 'client',
      //   firebaseToken,
    };
    loginSchema
      .validate(loginParams, { abortEarly: false })
      .then(params => {
        Keyboard.dismiss();
        user_Login(params);
        setError({});
      })
      .catch(errors => {
        const err = buildError<FieldError>(errors);
        setError(err);
      });
  };

  const PasswordRightAccessory = useMemo(
    () =>
      // eslint-disable-next-line react/no-unstable-nested-components
      function (props: TextFieldAccessoryProps) {
        return (
          <TouchableOpacity
            style={props.style}
            onPress={() => setIsAuthPasswordHidden(!isAuthPasswordHidden)}
          >
            <Image
              source={
                isAuthPasswordHidden ? images.eyeIcon : images.eyeCloseIcon
              }
              resizeMode="contain"
            />
          </TouchableOpacity>
        );
      },
    [isAuthPasswordHidden],
  );

  return (
    <>
      <Screen
        preset="auto"
        contentContainerStyle={$containerStyle}
        safeAreaEdges={['top']}
      >
        <AuthHeader tx="login.title" desc="login.description" hideBackButton />
        <View style={$mainView}>
          <TextField
            value={email}
            onChangeText={setEmail}
            autoComplete="off"
            importantForAutofill="no"
            textContentType="none"
            containerStyle={$userNameContainer}
            keyboardType="email-address"
            placeholderTx="login.email"
            returnKeyType="done"
            LeftAccessory={emailLeftAccessory}
            helperTx={error?.email}
            status={error?.email ? 'error' : undefined}
            onSubmitEditing={() => passwordField.current?.focus()}
          />
          <TextField
            ref={passwordField}
            value={password}
            onChangeText={setPassword}
            autoComplete="off"
            importantForAutofill="no"
            textContentType="none"
            placeholderTx="login.password"
            returnKeyType="done"
            secureTextEntry={!isAuthPasswordHidden}
            containerStyle={$passwordNameContainer}
            LeftAccessory={passwordLeftAccessory}
            RightAccessory={PasswordRightAccessory}
            helperTx={error?.password}
            status={error?.password ? 'error' : undefined}
          />
          <Text
            size="sm"
            tx="login.forgotPassword"
            style={$forgotText}
            onPress={() => navigation.navigate('ForgotPassword')}
          />
          <Button tx="login.signIn" onPress={validate} style={$buttonStyle} />

          <Text style={$signUp}>
            <Text tx="login.newUser" size="sm" weight='medium' style={{color: colors.palette.grayLight}} />
            <Text
              size="sm"
              weight='medium'
              tx="login.signUp"
              style={{color: colors.primary}}
              onPress={() => {
                Keyboard.dismiss();
                navigation.navigate('Signup');
              }}
            />
          </Text>
        </View>
      </Screen>
      <Loader loading={loading === 'loading'} tx="logging" />
    </>
  );
};

const $containerStyle: ViewStyle = {
  flexGrow: 1,
};

const $mainView: ViewStyle = {
  flex: 1,
  marginHorizontal: spacing.md,
};

const $userNameContainer: ViewStyle = {
  marginTop: spacing.xl,
};

const $passwordNameContainer: ViewStyle = {
  marginTop: spacing.sm,
};

const $buttonStyle: ViewStyle = {
  marginTop: spacing.md,
};

const $forgotText: TextStyle = {
  textAlign: 'right',
  marginVertical: spacing.sm,
};

const $signUp: TextStyle = {
  textAlign: 'center',
  marginTop: spacing.lg,
};

const $inputAccessoryStyle: ViewStyle = {
  marginVertical: spacing.sm,
  height: 24,
};
const mapStateToProps = (state: RootState) => ({
  loading: state.auth.loading,
});

const mapDispatch = {
  user_Login: (params: Signin) => userLogin(params),
  clearLoginLoading: () => authActions.clearLoginLoading(),
};

const connector = connect(mapStateToProps, mapDispatch);

export const LoginScreen = connector(Login);
