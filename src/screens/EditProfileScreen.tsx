import React, { FC, useState } from 'react';

import { AppStackScreenProps } from '../navigators';
import { BackButtom, Button, Screen, Text, TextField, TextFieldAccessoryProps } from '../components';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, images, spacing, typography } from '../theme';
import {
  FlatList,
  Image,
  Keyboard,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { TxKeyPath } from '../i18n';
import { skillsList } from './UploadUserDetailScreen';
import { commonStyle } from '../theme/style';
import { Service } from './ProfileScreen';
import { buildError, editProfile, EditProfileParams } from '../apis/schema';

type NavigationProps = AppStackScreenProps<'EditProfile'>;
// type StoreProps = ConnectedProps<typeof connector>;
// type Props = NavigationProps & StoreProps;

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
const EditProfile: FC<NavigationProps> = (props) => {
  const insets = useSafeAreaInsets();

  const [name, setName] = useState('');
  const [professionalHeading, setProfessionalHeading] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [showSkillDropdown, setShowSkillDropdown] = useState(false);

  const [error, setError] = useState<FieldError>({});

  const labelStyle = {
    style: {
      color: colors.primary,
      fontFamily: typography.primary.regular,
    },
  };

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
    let loginParams: EditProfileParams = {
      name,
      professionalHeading,
      bio,
      location,
      skills,
    };
    editProfile
      .validate(loginParams, { abortEarly: false })
      .then(params => {
        Keyboard.dismiss();
        console.log('params', params);
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
        heading="Mandeep Saini"
        style={{
          paddingHorizontal: spacing.md,
          paddingTop: insets.top + spacing.sm,
        }}
      />
      <Screen preset="auto" contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Image
            resizeMode="cover"
            style={styles.userImage}
            source={{ uri: 'https://i.pravatar.cc/300' }}
          />
          <Text size="md" weight="semiBold" text="Mandeep Saini" />
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

          <TextField
            value={location}
            onChangeText={setLocation}
            LabelTextProps={labelStyle}
            LeftAccessory={locationLeftAccessory}
            containerStyle={styles.inputContainer}
            labelTx="editProfile.location"
            placeholderTx="editProfile.locationPlaceholder"
            helperTx={error?.location}
            status={error?.location ? 'error' : undefined}
          />

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
                      <Text size="xs" text={item} />
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
        </View>

        <View style={styles.servicesCatalogContainer}>
          <View style={styles.catalogHeading}>
            <Text size="md" weight="semiBold" tx="editProfile.serviceCatalog" />
            <Text
              size="xxs"
              weight="semiBold"
              tx="editProfile.addCatalog"
              style={styles.primaryText}
              onPress={() => props.navigation.navigate('AddCatalogModal')}
            />
          </View>
          <FlatList
            data={[1]}
            scrollEnabled={false}
            renderItem={info => <Service {...info} />}
          />
        </View>
        <Button
          onPress={validate}
          style={styles.buttonStyle}
          tx="editProfile.updateProfile"
        />
      </Screen>
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
  servicesCatalogContainer: {
    borderBottomWidth: 1,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
    borderColor: colors.palette.borderColor,
  },
  catalogHeading: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: spacing.md,
    justifyContent: 'space-between',
  },
  primaryText: {
    color: colors.primary,
  },
  buttonStyle: {
    marginHorizontal: spacing.md,
  },
  inputAccessoryStyle: {
    marginVertical: spacing.sm + 2,
    height: 24,
  }
});

// const mapStateToProps = (state: RootState) => ({
//   profile: state.auth.myProfile?.data,
//   loading: state.auth.updateLoading,
//   baseUrl: state.home.baseURl,
// });

// const mapDispatch = {
//   getProfile,
//   update: (params: FormData) => updateProfile(params),
//   reset: () => authActions.resetUpdateLoading(),
// };

// const connector = connect(mapStateToProps, mapDispatch);

export const EditProfileScreen = EditProfile;
