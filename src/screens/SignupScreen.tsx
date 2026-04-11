import {
  AuthHeader,
  Country,
  CountryPickerModal,
  Loader,
  Screen,
  Text,
} from '../components';
import {
  Image,
  ImageStyle,
  Keyboard,
  TextInput,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import React, { FC, useEffect, useMemo, useRef, useState } from 'react';
import { buildError, Registration, userSchema } from '../apis/schema';
import { TextField, TextFieldAccessoryProps } from '../components/TextField';
import { colors, spacing } from '../theme';
import { AuthStackScreenProps } from '../navigators';
import { Button } from '../components/Button';
import { DefaultCountry } from '../config/defaults';
import { translate, TxKeyPath } from '../i18n';
import { ValidationError } from 'yup';
import { images } from '../theme/images';
import AnimatedIcon from '../components/AnimatedIcon';
import { connect, ConnectedProps } from 'react-redux';
import { userRegistration } from '../slices/auth.slice';
import { RootState } from '../store';

interface SignupScreenProps extends AuthStackScreenProps<'Signup'> {}
type StoreProps = ConnectedProps<typeof connector>;
type Props = SignupScreenProps & StoreProps;
type FieldError = {
  name?: TxKeyPath | undefined;
  phone?: TxKeyPath | undefined;
  email?: TxKeyPath | undefined;
  password?: TxKeyPath | undefined;
  confirm_password?: TxKeyPath | undefined;
};

const Signup: FC<Props> = props => {
  const fields = [
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
  ];
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [country, setCountry] = useState<Country>(DefaultCountry);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCountries, setShowCountries] = useState(false);
  const [isAuthPasswordHidden, setIsAuthPasswordHidden] = useState(false);
  const [isConfirmPasswordHidden, setIsConfirmPasswordHidden] = useState(false);
  const [tnc, setTnc] = useState(false);

  //   const [firebaseToken, setFirebaseToken] = useState('');
  const [error, setError] = useState<FieldError>({});
  //   const [tnc, setTnc] = useState(false);

  useEffect(() => {
    if (__DEV__) {
      setName('Mandeep Singh');
      setMobile('7814667566');
      setEmail('smandeep5510@gmail.com');
      setPassword('Admin@123');
      setConfirmPassword('Admin@123');
    }
  }, []);

  useEffect(() => {
    // (async () => {
    //   const messaging = getMessaging();
    //   const token = await getToken(messaging);
    //   setFirebaseToken(token);
    // })();
    return () => {
      setName('');
      setMobile('');
      setCountry(DefaultCountry);
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    };
  }, []);

  const CountryCodeAccessory = useMemo(
    () =>
      // eslint-disable-next-line react/no-unstable-nested-components
      function ({style}: TextFieldAccessoryProps) {
        return (
          <TouchableOpacity
            style={[style, $countryCodeStyle]}
            onPress={() => setShowCountries(true)}>
            <Text>{`${country.dial_code}`}</Text>
          </TouchableOpacity>
        );
      },
    [country],
  );

  const PasswordRightAccessory = useMemo(
    () =>
      // eslint-disable-next-line react/no-unstable-nested-components
      function ({ style }: TextFieldAccessoryProps) {
        return (
          <TouchableOpacity
            style={style}
            onPress={() => setIsAuthPasswordHidden(!isAuthPasswordHidden)}
          >
            <Image
              source={
                isAuthPasswordHidden ? images.eyeIcon : images.eyeCloseIcon
              }
            />
          </TouchableOpacity>
        );
      },
    [isAuthPasswordHidden],
  );

  const ConfirmPasswordRightAccessory = useMemo(
    () =>
      // eslint-disable-next-line react/no-unstable-nested-components
      function ({ style }: TextFieldAccessoryProps) {
        return (
          <TouchableOpacity
            style={style}
            onPress={() => setIsConfirmPasswordHidden(!isConfirmPasswordHidden)}
          >
            <Image
              source={
                isConfirmPasswordHidden ? images.eyeIcon : images.eyeCloseIcon
              }
            />
          </TouchableOpacity>
        );
      },
    [isConfirmPasswordHidden],
  );

  const validate = () => {
    userSchema
      .validate(
        {
          name,
          email,
          phone: mobile,
          country_code: country.dial_code.replace('+', ''),
          password,
          confirm_password: confirmPassword,
          user_type: 'freelancer',
          //   firebaseToken,
        },
        { abortEarly: false, context: { isSignup: true } },
      )
      .then(res => {
        if (tnc === false) {
          toast.show(translate('validation.acceptTnc'), { type: 'danger' });
          return;
        }
        Keyboard.dismiss();
        props.signup(res);
        setError({});
      })
      .catch((errors: ValidationError) => {
        const err = buildError<FieldError>(errors);
        setError(err);
      });
  };

  return (
    <>
      <Screen
        preset="auto"
        safeAreaEdges={['top']}
        contentContainerStyle={$containerStyle}
      >
        <AuthHeader tx="auth.heading" desc="auth.description" />
        <View style={$mainView}>
          <TextField
            value={name}
            onChangeText={setName}
            containerStyle={$userNameContainer}
            placeholderTx="auth.namePlaceholder"
            onSubmitEditing={() => fields[0].current?.focus()}
            helperTx={error?.name}
            status={error?.name ? 'error' : undefined}
          />
          <TextField
            value={email}
            onChangeText={setEmail}
            ref={fields[0]}
            containerStyle={$inputContainer}
            placeholderTx="auth.emailPlaceholder"
            keyboardType="email-address"
            onSubmitEditing={() => fields[1].current?.focus()}
            helperTx={error?.email}
            status={error?.email ? 'error' : undefined}
          />
          <TextField
            value={mobile}
            onChangeText={setMobile}
            ref={fields[1]}
            placeholderTx="auth.mobilePlaceholder"
            keyboardType="phone-pad"
            containerStyle={$inputContainer}
            LeftAccessory={CountryCodeAccessory}
            onSubmitEditing={() => fields[2].current?.focus()}
            helperTx={error?.phone}
            status={error?.phone ? 'error' : undefined}
          />

          <TextField
            value={password}
            onChangeText={setPassword}
            ref={fields[2]}
            placeholderTx="auth.passwordPlaceholder"
            secureTextEntry={!isAuthPasswordHidden}
            containerStyle={$inputContainer}
            RightAccessory={PasswordRightAccessory}
            onSubmitEditing={() => fields[3].current?.focus()}
            helperTx={error?.password}
            status={error?.password ? 'error' : undefined}
          />
          <TextField
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            ref={fields[3]}
            placeholderTx="auth.confirmPasswordPlaceholder"
            secureTextEntry={!isConfirmPasswordHidden}
            containerStyle={$inputContainer}
            RightAccessory={ConfirmPasswordRightAccessory}
            helperTx={error?.confirm_password}
            status={error?.confirm_password ? 'error' : undefined}
          />
          <TouchableOpacity
            style={$tncContainer}
            onPress={() => {
              setTnc(!tnc);
            }}
            activeOpacity={1}
          >
            <AnimatedIcon
              source={tnc ? images.checkboxFilled : images.checkboxOutline}
              style={$checkBox}
              onPress={() => {
                setTnc(!tnc);
              }}
            />
            <Text style={$tncText}>
              <Text style={$dimtext} tx="auth.agree" size="sm" />
              <Text
                tx="auth.termsAndConditions"
                size="sm"
                style={$primaryColorStyle}
                // onPress={() => props.navigation.navigate('TermsCondition')}
              />
            </Text>
          </TouchableOpacity>
          <Button tx="auth.signUp" onPress={validate} style={$buttonStyle} />
          <Text style={$signUp}>
            <Text
              tx="auth.alreadyMember"
              size="sm"
              weight="medium"
              style={$dimtext}
            />
            <Text
              tx="auth.signIn"
              size="sm"
              weight="semiBold"
              style={$primaryColorStyle}
              onPress={() => {
                Keyboard.dismiss();
                props.navigation.navigate('Login');
              }}
            />
          </Text>
        </View>
      </Screen>
      <CountryPickerModal
        onSelect={data => {
          setCountry(data);
          setShowCountries(false);
        }}
        modalVisible={showCountries}
        onClose={() => setShowCountries(false)}
      />
      <Loader loading={props.loading === 'loading'} tx="signing" />
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

const $countryCodeStyle: ViewStyle = {
  height: 24,
  borderRightWidth: 1,
  borderColor: colors.separator,
  marginVertical: spacing.sm + 2,
};

const $userNameContainer: ViewStyle = {
  marginTop: spacing.lg,
};

const $inputContainer: ViewStyle = {
  marginTop: spacing.sm,
};

const $buttonStyle: ViewStyle = {
  marginTop: spacing.lg,
};

const $signUp: TextStyle = {
  textAlign: 'center',
  marginVertical: spacing.lg,
  justifyContent: 'center',
};

const $tncContainer: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  marginTop: spacing.md,
};
const $checkBox: ImageStyle = {
  marginRight: spacing.xxs,
};

const $tncText: TextStyle = {
  flex: 1,
  marginHorizontal: spacing.xxxs,
};

const $dimtext: TextStyle = {
  color: colors.textDim,
};

const $primaryColorStyle: TextStyle = {
  color: colors.primary,
};

const mapStateToProps = (state: RootState) => ({
  loading: state.auth.userRegistrationLoading,
  inviteCode: state.auth.inviteCode,
});

const mapDispatch = {
  signup: (params: Registration) => userRegistration(params),
};

const connector = connect(mapStateToProps, mapDispatch);

export const SignupScreen = connector(Signup);
