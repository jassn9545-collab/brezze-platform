import {
  AddressParam,
  AddressSearchModal,
  AuthHeader,
  Button,
  DatePickerModal,
  Loader,
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
import React, { FC, useMemo, useState } from 'react';
import { colors, images, spacing } from '../theme';
import moment from 'moment';

import { AuthStackScreenProps } from '../navigators';
import { TxKeyPath } from '../i18n';
import { commonStyle } from '../theme/style';
import {
  basicDetailSchema,
  BasicUserDetailParams,
  buildError,
} from '../apis/schema';
import { ValidationError } from 'yup';
import { RootState } from '../store';
import { connect, ConnectedProps } from 'react-redux';
import { AddressType } from '../slices/address.types';
import { userBasicDetail } from '../slices/auth.slice';
import { Skill } from '../slices/setting.slice';

type NavigationProps = AuthStackScreenProps<'UploadUserDetail'>;
type StoreProps = ConnectedProps<typeof connector>;
type Props = NavigationProps & StoreProps;

type FieldError = {
  name?: TxKeyPath | undefined;
  phone?: TxKeyPath | undefined;
  email?: TxKeyPath | undefined;
  dob?: TxKeyPath | undefined;
  skills?: TxKeyPath | undefined;
  street_address?: TxKeyPath | undefined;
  state?: TxKeyPath | undefined;
  pincode?: TxKeyPath | undefined;
};

export const calendarAccessory = (props: TextFieldAccessoryProps) => (
  <View style={[props.style, styles.inputAccessoryStyle]}>
    <Image source={images.calender} />
  </View>
);

const UploadUserDetail: FC<Props> = props => {
  const {
    oldName = props.profile?.name,
    oldEmail = props.profile?.email,
    oldCountryCode = `${props.profile?.country_code ?? '61'}`,
    oldMobileNumber = props.profile?.phone,
  } = {};

  const [name, setName] = useState(oldName ?? '');
  const [email, setEmail] = useState(oldEmail ?? '');
  const [mobile, setMobile] = useState(oldMobileNumber ?? '');
  const [dob, setDOB] = useState<Date | undefined>(undefined);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [showSkillDropdown, setShowSkillDropdown] = useState(false);
  const [streetAddress, setStreetAddress] = useState<AddressParam>();
  const [addressModal, setAddressModal] = useState<AddressType>('none');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');

  const [error, setError] = useState<FieldError>({});

  const CountryCodeAccessory = useMemo(
    () =>
      // eslint-disable-next-line react/no-unstable-nested-components
      function ({ style }: TextFieldAccessoryProps) {
        return (
          <View style={[style, styles.countryCodeStyle]}>
            <Text>{`+${oldCountryCode}`}</Text>
          </View>
        );
      },
    [oldCountryCode],
  );

  const onSelectSkill = (item: Skill) => {
    if (skills.includes(item)) {
      setSkills(skills.filter(i => i !== item));
    } else {
      if (skills.length < 5) {
        setSkills([...skills, item]);
      }
    }
  };

  const removeSkill = (item: Skill) => {
    setSkills(skills.filter(i => i !== item));
  };

  const validate = () => {
    basicDetailSchema
      .validate(
        {
          name,
          email,
          phone: mobile,
          country_code: oldCountryCode,
          dob: dob ? moment(dob).format('YYYY-MM-DD') : undefined,
          skills: skills.map(i => i.slug).join(","),
          street_address: streetAddress?.address,
          latitude: streetAddress?.location?.lat,
          longitude: streetAddress?.location?.lng,
          state,
          pincode: zipCode,
        },
        { abortEarly: false},
      )
      .then(res => {
        Keyboard.dismiss();
        props.userBasicDetail(res);
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
            editable={!oldName}
            onChangeText={setName}
            containerStyle={styles.inputContainer}
            placeholderTx="document.namePlaceholder"
            helperTx={error?.name}
            status={error?.name ? 'error' : undefined}
          />
          <TextField
            value={email}
            editable={!oldEmail}
            onChangeText={setEmail}
            containerStyle={styles.inputContainer}
            placeholderTx="document.emailPlaceholder"
            keyboardType="email-address"
            helperTx={error?.email}
            status={error?.email ? 'error' : undefined}
          />
          <TextField
            value={mobile}
            editable={!oldMobileNumber}
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
                error.skills && { borderColor: colors.error },
              ]}
              onPress={() => setShowSkillDropdown(!showSkillDropdown)}
            >
              <View style={styles.skillWrapper}>
                {(skills?.length ?? 0) > 0 ? (
                  skills.map(item => (
                    <View key={item.id} style={styles.skillChip}>
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
                      <Text size="sm" text={item.name} />
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

            {error.skills && (
              <Text
                preset="formHelper"
                tx={error.skills}
                style={{ color: colors.error }}
              />
            )}
            {showSkillDropdown && (
              <View style={[styles.dropdownContainer, commonStyle.lightShadow]}>
                <ScrollView
                  style={styles.dropdown}
                  showsVerticalScrollIndicator={false}
                >
                  {props.skills!.map(item => (
                    <TouchableOpacity
                      key={item.id}
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
                        text={item.name}
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

          <TouchableOpacity onPress={() => setAddressModal('pick')}>
            <TextField
              editable={false}
              onPress={() => setAddressModal('pick')}
              value={streetAddress?.address}
              containerStyle={styles.inputContainer}
              placeholderTx="document.streetAddressPlaceholder"
              helperTx={error?.street_address}
              status={error?.street_address ? 'error' : undefined}
            />
          </TouchableOpacity>

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
              helperTx={error?.pincode}
              status={error?.pincode ? 'error' : undefined}
            />
          </View>

          <Button
            tx="common.next"
            onPress={validate}
            style={styles.buttonStyle}
          />
        </View>
      </Screen>
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
      <AddressSearchModal
        showCurrent
        onSelect={(address: AddressParam) => setStreetAddress(address)}
        isVisible={addressModal !== 'none'}
        onClose={() => setAddressModal('none')}
        title="ride.enterAddress"
      />
      <Loader loading={props.loading === 'loading'} />
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

const mapStateToProps = (state: RootState) => ({
  skills: state.setting.basic?.skills,
  profile: state.auth.myProfile?.user,
  loading: state.auth.userBasicDetailLoading,
});

const mapDispatch = {
  userBasicDetail: (params: BasicUserDetailParams) => userBasicDetail(params),
};

const connector = connect(mapStateToProps, mapDispatch);

export const UploadUserDetailScreen = connector(UploadUserDetail);
