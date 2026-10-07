import {
  BackButtom,
  Button,
  Country,
  CountryPickerModal,
  Screen,
  Text,
} from '../components';
import { HelpParams, buildError, helpSchema } from '../apis/schema';
import {
  FlatList,
  TextInput,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import React, { FC, useMemo, useRef, useState } from 'react';
import { colors, images, spacing } from '../theme';

import { AppStackScreenProps } from '../navigators';
import { TextField, TextFieldAccessoryProps } from '../components/TextField';
import { TxKeyPath } from '../i18n';
import { DefaultCountry } from '../config/defaults';
import Animated, { Easing, FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { useToast } from 'react-native-toast-notifications';
import { submitSupportRequest } from '../apis/account';

type NavigationProps = AppStackScreenProps<'HelpSupport'>;
// type StoreProps = ConnectedProps<typeof connector>;
type Props = NavigationProps;

type FieldError = {
  name?: TxKeyPath | undefined;
  email?: TxKeyPath | undefined;
  mobileNumber?: TxKeyPath | undefined;
  msg?: TxKeyPath | undefined;
};

export interface FAQ {
  id: number;
  type: string;
  question: string;
  answer: string;
  created_at: string;
  modify_at: string;
}

const faqData: FAQ[] = [
  {
    id: 1,
    type: 'general',
    question: 'What is Beep?',
    answer:
      'Beep is a chat-based application that allows users to communicate in real time.',
    created_at: '2026-03-20T10:00:00Z',
    modify_at: '2026-03-20T10:00:00Z',
  },
  {
    id: 2,
    type: 'account',
    question: 'How do I create an account?',
    answer:
      'You can create an account by signing up using your phone number or email address.',
    created_at: '2026-03-20T10:05:00Z',
    modify_at: '2026-03-20T10:05:00Z',
  },
  {
    id: 3,
    type: 'privacy',
    question: 'Is my data secure?',
    answer:
      'Yes, we use end-to-end encryption to keep your conversations private and secure.',
    created_at: '2026-03-20T10:10:00Z',
    modify_at: '2026-03-20T10:10:00Z',
  },
  {
    id: 4,
    type: 'usage',
    question: 'Can I use Beep on multiple devices?',
    answer:
      'Yes, you can log in to your account on multiple devices and sync your chats.',
    created_at: '2026-03-20T10:15:00Z',
    modify_at: '2026-03-20T10:15:00Z',
  },
  {
    id: 5,
    type: 'support',
    question: 'How can I contact support?',
    answer:
      'You can contact support through the Help section in the app or email us at support@beep.com.',
    created_at: '2026-03-20T10:20:00Z',
    modify_at: '2026-03-20T10:20:00Z',
  },
];

const HelpSupport: FC<Props> = () => {
  const toast = useToast();
  const emailField = useRef<TextInput>(null);
  const phoneField = useRef<TextInput>(null);
  const messageField = useRef<TextInput>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [country, setCountry] = useState<Country>(DefaultCountry);
  const [showCountries, setShowCountries] = useState(false);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState<FieldError>({});

  const [expandedItems, setExpandedItems] = useState<number[]>([]);

  const CountryCodeAccessory = useMemo(
    () =>
      // eslint-disable-next-line react/no-unstable-nested-components
      function ({ style }: TextFieldAccessoryProps) {
        return (
          <TouchableOpacity
            style={[style, $countryCodeStyle]}
            onPress={() => setShowCountries(true)}
          >
            <Text>{`${country.dial_code}`}</Text>
          </TouchableOpacity>
        );
      },
    [country],
  );

  const validate = async () => {
    if (submitting) return;

    const params: HelpParams = {
      name,
      email,
      msg: message,
      mobileNumber,
      country_code: country.dial_code.replace('+', ''),
    };

    try {
      const validated = await helpSchema.validate(params, { abortEarly: false });
      setError({});
      setSubmitting(true);

      await submitSupportRequest({
        name: validated.name,
        email: validated.email,
        phone: validated.mobileNumber,
        country_code: validated.country_code,
        message: validated.msg,
      });

      setName('');
      setEmail('');
      setMobileNumber('');
      setMessage('');
      toast.show('Your support request has been submitted.', { type: 'success' });
    } catch (errors) {
      if (errors && typeof errors === 'object' && 'inner' in errors) {
        const err = buildError<FieldError>(errors as never);
        setError(err);
      }
    } finally {
      setSubmitting(false);
    }
  };

  //   useEffect(() => {
  //     if (props.loading === 'loaded') {
  //       props.navigation.goBack();
  //       props.clean();
  //       setEmail('');
  //       setMessage('');
  //     }
  //   }, [props]);

  const toggleItem = (itemId: number) => {
    setExpandedItems(prev => {
      if (prev.includes(itemId)) {
        return prev.filter(id => id !== itemId);
      } else {
        return [...prev, itemId];
      }
    });
  };

  const renderItem = ({ item }: { item: FAQ }) => {
    const included = expandedItems.includes(item.id);

    return (
      <TouchableOpacity
        style={[
          $rowView,
          { paddingBottom: included ? spacing.lg : spacing.xxxs },
        ]}
        key={item.id}
        onPress={() => toggleItem(item.id)}
      >
        <View style={$questionContainer}>
          <Text
            weight="medium"
            size="sm"
            style={$question}
            text={item.question}
          />
          <Animated.Image
            source={images.rightArrow}
            tintColor={colors.text}
            style={{
              transform: [{ rotate: included ? '-90deg' : '90deg' }],
            }}
          />
        </View>
        {included && (
          <Animated.View
            entering={FadeInUp.easing(Easing.linear)}
            exiting={FadeOutUp.easing(Easing.linear)}
          >
            <Text text={item.answer} weight="medium" size="xs" />
          </Animated.View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <>
      <Screen
        preset="auto"
        safeAreaEdges={['top', 'bottom']}
        contentContainerStyle={$container}
      >
        <BackButtom headingTx="helpSupport.helpCenter" />
        <View style={$main}>
          <TextField
            value={name}
            onChangeText={setName}
            containerStyle={$input}
            placeholderTx="helpSupport.fullName"
            helperTx={error?.name}
            status={error?.name ? 'error' : undefined}
            onSubmitEditing={() => emailField.current?.focus()}
          />
          <TextField
            value={email}
            onChangeText={setEmail}
            containerStyle={$inputContainer}
            placeholderTx="helpSupport.enterEmail"
            keyboardType="email-address"
            helperTx={error?.email}
            status={error?.email ? 'error' : undefined}
            onSubmitEditing={() => phoneField.current?.focus()}
          />
          <TextField
            value={mobileNumber}
            onChangeText={setMobileNumber}
            placeholderTx="helpSupport.enterPhone"
            keyboardType="phone-pad"
            containerStyle={$inputContainer}
            LeftAccessory={CountryCodeAccessory}
            helperTx={error?.mobileNumber}
            status={error?.mobileNumber ? 'error' : undefined}
            onSubmitEditing={() => messageField.current?.focus()}
          />
          <TextField
            ref={messageField}
            value={message}
            multiline
            onChangeText={setMessage}
            containerStyle={$inputContainer}
            placeholderTx="helpSupport.message"
            helperTx={error?.msg}
            status={error?.msg ? 'error' : undefined}
          />
        </View>
        <Button
          text={submitting ? 'Submitting…' : 'Submit'}
          style={$buttonStyle}
          onPress={validate}
          disabled={submitting}
        />
        <Text
          size="md"
          weight="semiBold"
          tx="helpSupport.faq"
          style={{ marginStart: spacing.md }}
        />
        <FlatList
          data={faqData}
          scrollEnabled={false}
          renderItem={renderItem}
          keyExtractor={item => item.id?.toString()}
          style={$flatlist}
          extraData={expandedItems}
          showsVerticalScrollIndicator={false}
        />
      </Screen>
      <CountryPickerModal
        onSelect={data => {
          setCountry(data);
          setShowCountries(false);
        }}
        modalVisible={showCountries}
        onClose={() => setShowCountries(false)}
      />
      {/* <Loader loading={props.loading === 'loading'} /> */}
    </>
  );
};

const $container: ViewStyle = {
  flexGrow: 1,
};

const $main: ViewStyle = {
  marginHorizontal: spacing.md,
};

const $input: ViewStyle = {
  marginTop: spacing.lg,
};

const $countryCodeStyle: ViewStyle = {
  height: 24,
  borderRightWidth: 1,
  borderColor: colors.separator,
  marginVertical: spacing.sm + 2,
};

const $inputContainer: ViewStyle = {
  marginTop: spacing.sm,
};

const $buttonStyle: ViewStyle = {
  margin: spacing.md,
};

const $flatlist: ViewStyle = {
  flex: spacing.one,
  marginTop: spacing.md,
};

const $rowView: ViewStyle = {
  paddingHorizontal: spacing.md,
  backgroundColor: colors.palette.white,
  borderRadius: spacing.sm + spacing.xxxs,
};

const $questionContainer: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  paddingVertical: spacing.sm,
};

const $question: TextStyle = {
  flex: spacing.one,
  marginEnd: spacing.md,
};

// const mapStateToProps = (state: RootState) => ({
//   profile: state.auth.myProfile,
//   loading: state.static.loading,
// });

// const mapDispatch = {
//   clean: () => staticActions.cleanUp(),
//   postSupport: (params: HelpParams) => postHelpSupport(params),
// };

// const connector = connect(mapStateToProps, mapDispatch);

export const HelpSupportScreen = HelpSupport;
