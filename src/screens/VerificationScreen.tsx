import {
  AuthHeader,
  Button,
  Loader,
  OTPTextView,
  Screen,
  Text,
} from '../components';
import { Keyboard, TextStyle, View, ViewStyle } from 'react-native';
import React, { FC, useCallback, useEffect, useRef, useState } from 'react';
import { colors, spacing } from '../theme';

import { AuthStackScreenProps } from '../navigators';
import { translate } from '../i18n';
import { useFocusEffect } from '@react-navigation/native';
import Clipboard from '@react-native-clipboard/clipboard';
import { RootState } from '../store';
import {
  authActions,
  resendOTP,
  resendUserVerifyOTP,
  userVerification,
  UserVerificationParam,
  verifyOTP,
  VerifyOTPParam,
} from '../slices/auth.slice';
import { connect, ConnectedProps } from 'react-redux';
import { Registration } from '../apis/schema';

type NavigationProps = AuthStackScreenProps<'Verification'>;
type StoreProps = ConnectedProps<typeof connector>;
type Props = NavigationProps & StoreProps;

let timerOn = false;
let timeout: ReturnType<typeof setTimeout>;

export type ForgotPasswordParams = {
  email: string;
  serviceSid: string;
  user_id: number;
  from: 'forgotPassword';
};

export type SignupParams = {
  serviceSid: string;
  user_id: number;
  from: 'signup';
} & Registration;

const Verification: FC<Props> = props => {
  const params = props.route.params as ForgotPasswordParams | SignupParams;

  const input = useRef<OTPTextView>(null);
  const [otpInput, setOtpInput] = useState<string>('');
  const [wait, setWait] = useState('00:00');
  const [countDown, setCountDown] = useState(30);

  useFocusEffect(
    useCallback(() => {
      setCountDown(30);
      timerOn = true;
      timer(30);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  useEffect(() => {
    return () => clearTimeout(timeout);
  }, []);

  const timer = (remaining: number) => {
    const m = Math.floor(remaining / 60);
    const s = remaining % 60;

    const minute = m < 10 ? '0' + m : m.toString();
    const second = s < 10 ? '0' + s : s.toString();
    setWait(minute + ':' + second);
    remaining -= 1;

    if (remaining >= 0 && timerOn) {
      timeout = setTimeout(function () {
        timer(remaining);
      }, 1000);
      return;
    }
    timerOn = false;
    setCountDown(countDown === 120 ? countDown : countDown * 2);
  };

  const handleCellTextChange = async (text: string, i: number) => {
    if (i === 0) {
      const clippedText = await Clipboard.getString();
      if (clippedText.slice(0, 1) === text) {
        input.current?.setValue(clippedText, true);
      }
    }
  };

  useEffect(() => {
    if (props.verifyLoading === 'loaded') {
      props.clearUserVerification();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.verifyLoading]);

  useEffect(() => {
    if (props.loading === 'loaded') {
      props.resetVerifyOtp();
      if (props.route.params.from === 'forgotPassword') {
        props.navigation.replace('ResetPassword', {
          user_id: params.user_id,
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.loading]);

  return (
    <Screen
      preset="auto"
      safeAreaEdges={['top']}
      contentContainerStyle={$containerStyle}
    >
      <View style={$main}>
        <AuthHeader
          tx="verification.heading"
          desc="verification.descriptionEmail"
          descValue={params.email}
        />

        <View style={$otpView}>
          <OTPTextView
            ref={input}
            containerStyle={$textInputContainer}
            handleTextChange={setOtpInput}
            handleCellTextChange={handleCellTextChange}
            keyboardType="numeric"
          />
        </View>

        <Button
          tx="verification.submit"
          onPress={() => {
            if (otpInput.length === 6) {
              Keyboard.dismiss();
              if (props.route.params.from === 'forgotPassword') {
                props.verifyOTP({
                  user_id: params.user_id,
                  otp: otpInput,
                  serviceSid: params.serviceSid,
                });
              } else if (props.route.params.from === 'signup') {
                props.userVerification({
                  serviceSid: params.serviceSid,
                  otp: otpInput,
                  user_id: params.user_id,
                  user_type: 'freelancer',
                  ...props.route.params,
                });
              }
            } else {
              toast.show(translate('validation.otpRequired'), {
                type: 'warning',
              });
            }
          }}
          style={$buttonStyle}
        />

        <View style={$resendOTPContainer}>
          {timerOn ? (
            <>
              <Text
                size="sm"
                weight="bold"
                tx="verification.notReceiveResendCode"
              />
              <Text
                size="sm"
                weight="regular"
                style={$dimText}
                tx="verification.receivedCode"
                txOptions={{
                  value: wait,
                }}
              />
            </>
          ) : (
            <Text
              tx="verification.resendCode"
              size="sm"
              weight="bold"
              style={$resendButton}
              disabled={timerOn}
              onPress={() => {
                timerOn = true;
                timer(countDown);
                props.resendUserVerifyOTP({
                  email: params.email,
                });
              }}
            />
          )}
        </View>
      </View>
      <Loader
        loading={
          props.verifyLoading === 'loading' ||
          props.resendVerifyOTPLoading === 'loading' ||
          props.loading === 'loading'
        }
      />
    </Screen>
  );
};

const $containerStyle: ViewStyle = {
  flexGrow: 1,
};

const $main: ViewStyle = {
  gap: spacing.xs,
  borderTopEndRadius: spacing.xl,
  borderTopStartRadius: spacing.xl,
};

const $otpView: ViewStyle = {
  marginTop: spacing.lg,
};

const $dimText: TextStyle = {
  color: colors.textDim,
  marginTop: spacing.xxxs,
};

const $textInputContainer: ViewStyle = {
  marginBottom: spacing.xs,
  borderColor: colors.palette.grayLight,
};

const $buttonStyle: ViewStyle = {
  marginTop: spacing.md,
  borderRadius: spacing.sm,
  marginHorizontal: spacing.xl,
};

const $resendOTPContainer: ViewStyle = {
  alignItems: 'center',
  justifyContent: 'center',
  marginVertical: spacing.lg,
  paddingHorizontal: spacing.md,
};

const $resendButton: TextStyle = {
  textDecorationLine: 'underline',
  color: colors.palette.black,
};

const mapStateToProps = (state: RootState) => ({
  loading: state.auth.verifyOTPLoading,
  // data: state.auth.otpResponse,
  resendVerifyOTPLoading: state.auth.resendVerifyOTPLoading,
  verifyLoading: state.auth.userVerificationLoading,
});

const mapDispatch = {
  resendOTP: (params: UserVerificationParam) => resendOTP(params),
  verifyOTP: (params: VerifyOTPParam) => verifyOTP(params),
  resetVerifyOtp: () => authActions.resetVerifyOTPLoading(),
  userVerification: (params: UserVerificationParam) => userVerification(params),
  resendUserVerifyOTP: (params: UserVerificationParam) =>
    resendUserVerifyOTP(params),
  clearUserVerification: () => authActions.resetUserVerificationLoading(),
};

const connector = connect(mapStateToProps, mapDispatch);

export const VerificationScreen = connector(Verification);
