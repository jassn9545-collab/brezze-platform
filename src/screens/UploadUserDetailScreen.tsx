// import * as Firebase from '../utils/Firebase';

import {
  AuthHeader,
  Button,
  Country,
  CountryPickerModal,
  DatePickerModal,
  Screen,
  Text,
  TextField,
  TextFieldAccessoryProps,
} from '../components';
import {
  Image,
  Keyboard,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { FC, useEffect, useMemo, useState } from 'react';
import { colors, images, spacing } from '../theme';
import moment from 'moment';

import { AuthStackScreenProps } from '../navigators';
import { TxKeyPath } from '../i18n';
import { DefaultCountry } from '../config/defaults';
import { commonStyle } from '../theme/style';
import { basicDetailSchema, buildError } from '../apis/schema';
import { ValidationError } from 'yup';

type NavigationProps = AuthStackScreenProps<'UploadUserDetail'>;
// type StoreProps = ConnectedProps<typeof connector>;
// type Props = NavigationProps & StoreProps;

type FieldError = {
  name?: TxKeyPath | undefined;
  phone?: TxKeyPath | undefined;
  email?: TxKeyPath | undefined;
  dob?: TxKeyPath | undefined;
  skills?: TxKeyPath | undefined;
  hourPrice?: TxKeyPath | undefined;
  streetAddress?: TxKeyPath | undefined;
  state?: TxKeyPath | undefined;
  zipCode?: TxKeyPath | undefined;
};

export const calendarAccessory = (props: TextFieldAccessoryProps) => (
  <View style={[props.style, styles.inputAccessoryStyle]}>
    <Image source={images.calender} />
  </View>
);

const skillsList = [
  'Electrician',
  'AC Repair',
  'Wire Fitting',
  'Washing Machine Repair',
  'AC Services',
];

const UploadUserDetail: FC<NavigationProps> = props => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [country, setCountry] = useState<Country>(DefaultCountry);
  const [showCountries, setShowCountries] = useState(false);
  const [dob, setDOB] = useState<Date | undefined>(undefined);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [skills, setSkills] = useState<string[]>([]);
  const [showSkillDropdown, setShowSkillDropdown] = useState(false);
  const [hourPrice, setHourPrice] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');

  const [error, setError] = useState<FieldError>({});

  useEffect(() => {
    if (__DEV__) {
      setName('Mandeep Singh');
      setMobile('7814667566');
      setEmail('mandeep.swt.suffescom@gmail.com');
    }
  }, []);

  const CountryCodeAccessory = useMemo(
    () =>
      // eslint-disable-next-line react/no-unstable-nested-components
      function ({ style }: TextFieldAccessoryProps) {
        return (
          <TouchableOpacity
            style={[style, styles.countryCodeStyle]}
            onPress={() => setShowCountries(true)}
          >
            <Text>{`${country.dial_code}`}</Text>
          </TouchableOpacity>
        );
      },
    [country],
  );

  const onSelectSkill = (item: string) => {
    if (skills.includes(item)) {
      setSkills(skills.filter(i => i !== item));
    } else {
      if (skills.length < 5) {
        setSkills([...skills, item]);
      }
    }
  };

  const removeSkill = (item: string) => {
    setSkills(skills.filter(i => i !== item));
  };

  const validate = () => {
    basicDetailSchema
      .validate(
        {
          name,
          email,
          phone: mobile,
          country_code: country.dial_code.replace('+', ''),
          dob: dob ? moment(dob).format('YYYY-MM-DD') : undefined,
          skills,
          hourPrice,
          streetAddress,
          state,
          zipCode,
        },
        { abortEarly: false, context: { isSignup: true } },
      )
      .then(res => {
        Keyboard.dismiss();
        console.log('res', res);
        props.navigation.goBack();
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
        contentContainerStyle={styles.containerStyle}
      >
        <AuthHeader tx="document.heading" desc="document.description" />
        <View style={styles.mainView}>
          <TextField
            value={name}
            onChangeText={setName}
            containerStyle={styles.inputContainer}
            placeholderTx="document.namePlaceholder"
            helperTx={error?.name}
            status={error?.name ? 'error' : undefined}
          />
          <TextField
            value={email}
            onChangeText={setEmail}
            containerStyle={styles.inputContainer}
            placeholderTx="document.emailPlaceholder"
            keyboardType="email-address"
            helperTx={error?.email}
            status={error?.email ? 'error' : undefined}
          />
          <TextField
            value={mobile}
            onChangeText={setMobile}
            placeholderTx="document.mobilePlaceholder"
            keyboardType="phone-pad"
            containerStyle={styles.inputContainer}
            LeftAccessory={CountryCodeAccessory}
            helperTx={error?.phone}
            status={error?.phone ? 'error' : undefined}
          />

          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            activeOpacity={0.8}
          >
            <TextField
              editable={false}
              pointerEvents="none"
              value={dob ? moment(dob).format('DD/MM/YYYY') : ''}
              placeholderTx="document.dobPlaceholder"
              containerStyle={styles.inputContainer}
              RightAccessory={calendarAccessory}
              helperTx={error?.dob}
              status={error?.dob ? 'error' : undefined}
            />
          </TouchableOpacity>

          <View style={styles.skillContainer}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={[
                styles.skillInput,
                error.hourPrice && { borderColor: colors.error },
              ]}
              onPress={() => setShowSkillDropdown(!showSkillDropdown)}
            >
              <View style={styles.skillWrapper}>
                {(skills?.length ?? 0) > 0 ? (
                  skills.map(item => (
                    <View key={item} style={styles.skillChip}>
                      <TouchableOpacity
                        onPress={() => removeSkill(item)}
                        style={styles.crossIcon}
                      >
                        <Text
                          size="xs"
                          weight="bold"
                          text="✕"
                          style={{ color: colors.primaryDimmed }}
                        />
                      </TouchableOpacity>
                      <Text size="sm" text={item} />
                    </View>
                  ))
                ) : (
                  <Text
                    size="sm"
                    tx="document.selectSkillsPlaceholder"
                    style={{ color: colors.textDim }}
                  />
                )}
              </View>
              <Image source={images.downArrow} />
            </TouchableOpacity>

            {error.hourPrice && (
              <Text
                preset="formHelper"
                tx={error.hourPrice}
                style={{ color: colors.error }}
              />
            )}
            {showSkillDropdown && (
              <View style={[styles.dropdownContainer, commonStyle.lightShadow]}>
                <ScrollView
                  style={styles.dropdown}
                  showsVerticalScrollIndicator={false}
                >
                  {skillsList.map(item => (
                    <TouchableOpacity
                      key={item}
                      style={[
                        styles.dropdownItem,
                        skills.includes(item) && {
                          backgroundColor: colors.primaryDimmed,
                        },
                      ]}
                      onPress={() => onSelectSkill(item)}
                    >
                      <Text
                        size="xs"
                        text={item}
                        style={{
                          color: skills.includes(item)
                            ? colors.primary
                            : colors.text,
                        }}
                      />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          <TextField
            value={hourPrice}
            onChangeText={setHourPrice}
            keyboardType="number-pad"
            containerStyle={styles.inputContainer}
            placeholderTx="document.hoursPricePlaceholder"
            helperTx={error?.hourPrice}
            status={error?.hourPrice ? 'error' : undefined}
          />

          <TextField
            value={streetAddress}
            onChangeText={setStreetAddress}
            containerStyle={styles.inputContainer}
            placeholderTx="document.streetAddressPlaceholder"
            helperTx={error?.streetAddress}
            status={error?.streetAddress ? 'error' : undefined}
          />

          <View style={styles.twoInputs}>
            <TextField
              value={state}
              onChangeText={setState}
              containerStyle={styles.flex}
              placeholderTx="document.statePlaceholder"
              helperTx={error?.state}
              status={error?.state ? 'error' : undefined}
            />

            <TextField
              value={zipCode}
              onChangeText={setZipCode}
              containerStyle={styles.flex}
              placeholderTx="document.zipCodePlaceholder"
              helperTx={error?.zipCode}
              status={error?.zipCode ? 'error' : undefined}
            />
          </View>

          <Button
            tx="common.next"
            onPress={validate}
            style={styles.buttonStyle}
          />
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
      <DatePickerModal
        mode="date"
        display="auto"
        visible={showDatePicker}
        onChangeDate={setDOB}
        maximumDate={
          new Date(new Date().setFullYear(new Date().getFullYear() - 18))
        }
        value={dob ?? new Date()}
        onDismiss={() => setShowDatePicker(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  containerStyle: {
    flexGrow: 1,
  },
  mainView: {
    flex: 1,
    margin: spacing.md,
  },
  countryCodeStyle: {
    height: 24,
    marginVertical: spacing.sm + 2,
    borderRightWidth: 1,
    borderColor: colors.separator,
  },
  inputContainer: {
    marginTop: spacing.sm,
  },
  inputAccessoryStyle: {
    marginVertical: spacing.sm,
    height: 24,
  },
  skillContainer: {
    marginTop: spacing.sm,
  },
  skillInput: {
    minHeight: 54,
    borderWidth: 1,
    borderRadius: spacing.xs - 2,
    borderColor: colors.palette.borderColor,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
  },
  skillWrapper: {
    flex: 1,
    flexWrap: 'wrap',
    flexDirection: 'row',
  },
  skillChip: {
    gap: spacing.xs,
    alignItems: 'center',
    flexDirection: 'row',
    marginRight: spacing.xs,
    borderRadius: spacing.xs,
    marginVertical: spacing.xxs,
    paddingVertical: spacing.xxs,
    paddingHorizontal: spacing.xs,
    backgroundColor: colors.primaryDimmed,
  },
  crossIcon: {
    borderRadius: spacing.md,
    paddingHorizontal: spacing.xs,
    backgroundColor: colors.primary,
    paddingVertical: spacing.xxs - 1,
  },
  dropdownContainer: {
    top: 55,
    zIndex: 1000,
    width: '70%',
    position: 'absolute',
    backgroundColor: colors.palette.offWhite2,
  },
  dropdown: {
    maxHeight: 200,
  },
  dropdownItem: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  twoInputs: {
    gap: spacing.sm,
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: spacing.sm,
  },
  flex: { flex: 1 },
  buttonStyle: {
    borderRadius: spacing.xs,
    marginVertical: spacing.lg,
  },
});

// const mapStateToProps = (state: RootState) => ({
//   loading: state.auth.loading,
// });

// const mapDispatch = {
//   user_Login: (params: Signin) => userLogin(params),
//   clearLoginLoading: () => authActions.clearLoginLoading(),
// };

// const connector = connect(mapStateToProps, mapDispatch);

export const UploadUserDetailScreen = UploadUserDetail;
