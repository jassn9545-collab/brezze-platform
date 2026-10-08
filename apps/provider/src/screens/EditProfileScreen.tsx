import React, { FC, useEffect, useState } from 'react';

import { AppStackScreenProps } from '../navigators';
import {
  AddressParam,
  AddressSearchModal,
  BackButtom,
  Button,
  CustomImagePicker,
  Loader,
  SafeRemoteImage,
  Screen,
  Text,
  TextField,
  TextFieldAccessoryProps,
} from '../components';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, images, spacing, typography } from '../theme';
import {
  Image,
  Keyboard,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { TxKeyPath } from '../i18n';
import { commonStyle } from '../theme/style';
import { buildError, editProfile, EditProfileParams } from '../apis/schema';
import { connect, ConnectedProps } from 'react-redux';
import { RootState } from '../store';
import { Skill } from '../slices/setting.slice';
import { authActions, updateProfile } from '../slices/auth.slice';
import { ImagePickerResponse } from 'react-native-image-picker';
import { AddressType } from '../slices/address.types';

type NavigationProps = AppStackScreenProps<'EditProfile'>;
type StoreProps = ConnectedProps<typeof connector>;
type Props = NavigationProps & StoreProps;

type FieldError = {
  name?: TxKeyPath | undefined;
  professionalHeading?: TxKeyPath | undefined;
  bio?: TxKeyPath | undefined;
  location?: TxKeyPath | undefined;
  skills?: TxKeyPath | undefined;
};

export const locationLeftAccessory = (props: TextFieldAccessoryProps) => {
  return (
    <View style={[props.style, styles.inputAccessoryStyle]}>
      <Image source={images.location} />
    </View>
  );
};
const EditProfile: FC<Props> = props => {
  const insets = useSafeAreaInsets();
  const {
    oldName = props.profile?.name,
    oldProfileTitle = props.profile?.profile_title,
    oldProfileDescription = props.profile?.profile_description,
    oldAddress = {
      address: props.profile?.street_address,
      location: {
        lat: props.profile?.latitude!,
        lng: props.profile?.longitude!,
      },
    },
    oldSkills = props.profile?.skills
      ? props.profile.skills
          .split(',')
          .map((id: string) => props.skills!.find(s => s.id === Number(id)))
          .filter((s): s is Skill => Boolean(s))
      : [],
  } = {};

  const [name, setName] = useState(oldName ?? '');
  const [professionalHeading, setProfessionalHeading] = useState(
    oldProfileTitle ?? '',
  );
  const [bio, setBio] = useState(oldProfileDescription ?? '');
  const [location, setLocation] = useState<AddressParam>(oldAddress);
  const [addressModal, setAddressModal] = useState<AddressType>('none');

  const [skills, setSkills] = useState<Skill[]>(oldSkills ?? []);
  const [showSkillDropdown, setShowSkillDropdown] = useState(false);
  const [imagePickerVisible, setImagePickerVisible] = useState(false);
  const [imageURI, setImageURI] = useState(
    props.profile?.profile_image ? props.baseURl + '/' + props.profile.profile_image : '',
  );
  const [imageFormData, setImageFormData] = useState<{
    uri: string;
    name: string;
    type: string;
  } | null>(null);

  const [error, setError] = useState<FieldError>({});
  const labelStyle = {
    style: {
      color: colors.primary,
      fontFamily: typography.primary.regular,
    },
  };

  useEffect(() => {
    if (props.loading === 'loaded') {
      if (props.navigation.canGoBack()) {
        props.navigation.goBack();
      } else {
        props.navigation.reset({
          index: 0,
          routes: [{ name: 'Drawer' }],
        });
      }
      props.reset();
    }
  }, [props]);

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

  const uploadImage = (image: ImagePickerResponse) => {
    if ((image.assets?.length ?? 0) > 0) {
      setImageURI(image.assets?.[0].uri!);
      setImageFormData({
        uri: image.assets?.[0].uri!,
        name: image.assets?.[0].fileName!,
        type: image.assets?.[0].type!,
      });
    }
  };

  const validate = () => {
    let loginParams: EditProfileParams = {
      name,
      professionalHeading,
      bio,
      location: location?.address!,
      skills: skills.map(i => i.id).join(','),
      profile_image: imageURI,
    };
    editProfile
      .validate(loginParams, { abortEarly: false })
      .then(params => {
        const formData = new FormData();
        formData.append('name', params.name);
        formData.append('profile_title', params.professionalHeading);
        formData.append('profile_description', params.bio);
        formData.append('street_address', params.location);
        formData.append('latitude', location.location.lat);
        formData.append('longitude', location.location.lng);
        formData.append('skills', params.skills);
        if (imageFormData) {
          formData.append('profile_image', {
            uri: imageFormData.uri,
            name: imageFormData.name,
            type: imageFormData.type,
          });
        }

        Keyboard.dismiss();
        props.update(formData);
        setError({});
      })
      .catch(errors => {
        const err = buildError<FieldError>(errors);
        setError(err);
      });
  };

  return (
    <>
      <BackButtom
        heading={props.profile?.name}
        style={{
          paddingHorizontal: spacing.md,
          paddingTop: insets.top + spacing.sm,
        }}
      />
      <Screen preset="auto" contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <View>
            <SafeRemoteImage
              resizeMode="cover"
              style={styles.userImage}
              uri={imageURI}
              fallback={images.user}
            />
            <TouchableOpacity
              style={styles.editImageIcon}
              onPress={() => setImagePickerVisible(true)}
            >
              <Image
                resizeMode="contain"
                source={images.camera}
                style={styles.cameraIcon}
                tintColor={colors.palette.white}
              />
            </TouchableOpacity>
          </View>

          <Text size="md" weight="semiBold" text={props.profile?.name} />
        </View>
        <View style={styles.inputs}>
          <TextField
            value={name}
            onChangeText={setName}
            LabelTextProps={labelStyle}
            containerStyle={styles.inputContainer}
            labelTx="editProfile.fullName"
            placeholderTx="editProfile.fullNamePlaceholder"
            helperTx={error?.name}
            status={error?.name ? 'error' : undefined}
          />
          <TextField
            LabelTextProps={labelStyle}
            value={professionalHeading}
            onChangeText={setProfessionalHeading}
            containerStyle={styles.inputContainer}
            labelTx="editProfile.professionalHeading"
            placeholderTx="editProfile.professionalHeading"
            helperTx={error?.professionalHeading}
            status={error?.professionalHeading ? 'error' : undefined}
          />
          <TextField
            multiline
            value={bio}
            onChangeText={setBio}
            LabelTextProps={labelStyle}
            containerStyle={styles.inputContainer}
            labelTx="editProfile.bio"
            placeholderTx="editProfile.bioPlaceholder"
            helperTx={error?.bio}
            status={error?.bio ? 'error' : undefined}
          />

          <Text
            size="md"
            weight="medium"
            tx="editProfile.locationContact"
            style={{ marginVertical: spacing.xs }}
          />

          <TouchableOpacity onPress={() => setAddressModal('pick')}>
            <TextField
              editable={false}
              pointerEvents="none"
              onPress={() => setAddressModal('pick')}
              value={location?.address}
              LabelTextProps={labelStyle}
              LeftAccessory={locationLeftAccessory}
              containerStyle={styles.inputContainer}
              labelTx="editProfile.location"
              placeholderTx="editProfile.locationPlaceholder"
              helperTx={error?.location}
              status={error?.location ? 'error' : undefined}
            />
          </TouchableOpacity>
          <View style={styles.skillContainer}>
            <Text tx="editProfile.services" style={styles.serviceLabel} />

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
                      <Text size="xs" text={item.name} />
                    </View>
                  ))
                ) : (
                  <Text
                    size="sm"
                    tx="editProfile.servicesPlaceholder"
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
                  {props?.skills!.map(item => (
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
        </View>

        <Button
          onPress={validate}
          style={styles.buttonStyle}
          tx="editProfile.updateProfile"
        />
      </Screen>
      <CustomImagePicker
        imagePickerModal={imagePickerVisible}
        onDismiss={() => setImagePickerVisible(false)}
        callback={uploadImage}
      />
      <AddressSearchModal
        showCurrent
        onSelect={(address: AddressParam) => setLocation(address)}
        isVisible={addressModal !== 'none'}
        onClose={() => setAddressModal('none')}
        title="ride.enterAddress"
      />
      <Loader loading={props.loading === 'loading'} />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingBottom: spacing.xl,
  },
  header: {
    gap: spacing.sm,
    alignItems: 'center',
    marginVertical: spacing.sm,
    marginHorizontal: spacing.md,
  },
  userImage: {
    width: 110,
    height: 110,
    borderWidth: 5,
    borderRadius: 55,
    borderColor: colors.palette.offWhite2,
  },
  editImageIcon: {
    top: 0,
    right: 0,
    padding: spacing.xs,
    position: 'absolute',
    borderRadius: spacing.md,
    backgroundColor: colors.primary,
  },
  cameraIcon: {
    width: spacing.md,
    height: spacing.md,
  },
  inputs: {
    marginHorizontal: spacing.md,
  },
  inputContainer: {
    marginBottom: spacing.sm,
  },
  skillContainer: {
    marginBottom: spacing.sm,
  },
  serviceLabel: {
    color: colors.primary,
    fontFamily: typography.primary.regular,
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
    bottom: 0,
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
  buttonStyle: {
    marginHorizontal: spacing.md,
  },
  inputAccessoryStyle: {
    marginVertical: spacing.sm + 2,
    height: 24,
  },
});

const mapStateToProps = (state: RootState) => ({
  skills: state.setting.basic?.skills,
  profile: state.auth.myProfile?.user,
  loading: state.auth.updateLoading,
  baseURl: state.setting.basic?.base_url
});

const mapDispatch = {
  update: (params: FormData) => updateProfile(params),
  reset: () => authActions.resetUpdateLoading(),
};

const connector = connect(mapStateToProps, mapDispatch);

export const EditProfileScreen = connector(EditProfile);
