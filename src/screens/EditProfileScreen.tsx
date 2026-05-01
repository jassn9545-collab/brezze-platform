import React, { FC, useEffect, useMemo, useState } from 'react';
import { TxKeyPath } from '../i18n';
import {
  Image,
  TouchableOpacity,
  TextStyle,
  View,
  ViewStyle,
  ImageStyle as ImageStyleRN,
  Keyboard,
} from 'react-native';
import FastImage, { ImageStyle } from '@d11/react-native-fast-image';
import { connect, ConnectedProps } from 'react-redux';
import { colors, images, spacing } from '../theme';
import {
  AddressParam,
  AddressSearchModal,
  BackButtom,
  Button,
  CountryPickerModal,
  CustomImagePicker,
  Loader,
  Screen,
  Text,
  TextField,
  TextFieldAccessoryProps,
} from '../components';
import { AppStackScreenProps } from '../navigators/AppStack';
import { RootState } from '../store';
import { DefaultCountry } from '../config/defaults';
import { authActions, updateProfile } from '../slices/auth.slice';
import { ImagePickerResponse } from 'react-native-image-picker';
import { AddressType } from '../slices/address.types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { buildError, editProfile, EditProfileParams } from '../apis/schema';

type NavigationProps = AppStackScreenProps<'EditProfile'>;
type Props = NavigationProps & ConnectedProps<typeof connector>;

type FieldError = {
  name?: TxKeyPath | undefined;
  email?: TxKeyPath | undefined;
  phone?: TxKeyPath | undefined;
  address?: TxKeyPath | undefined;
};

const EditProfile: FC<Props> = props => {
  const insets = useSafeAreaInsets();

  const {
    oldName = props.profile?.name,
    oldEmail = props.profile?.email,
    oldPhone = props.profile?.phone,
    oldCountryCode = `+${props.profile?.country ?? '91'}`,
    oldAddress = {
      address: props.profile?.street_address!,
      location: {
        lat: props.profile?.latitude!,
        lng: props.profile?.longitude!,
      },
    },
  } = {};
  const [imagePickerVisible, setImagePickerVisible] = useState(false);
  const [imageURI, setImageURI] = useState(
    props.profile?.profile_image
      ? props.baseURl + '/' + props.profile.profile_image
      : '',
  );
  const [imageFormData, setImageFormData] = useState<{
    uri: string;
    name: string;
    type: string;
  } | null>(null);

  const [name, setName] = useState(oldName ?? '');
  const [email, setEmail] = useState(oldEmail ?? '');
  const [phone, setPhone] = useState(oldPhone ?? '');
  const [countryCode, setCountryCode] = useState(
    oldCountryCode ?? DefaultCountry.dial_code,
  );
  const [showCountries, setShowCountries] = useState(false);

  const [address, setAddress] = useState<AddressParam>(oldAddress);
  const [addressModal, setAddressModal] = useState<AddressType>('none');

  const [error, setError] = useState<FieldError>({});

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

  const CountryCodeAccessory = useMemo(
    () =>
      // eslint-disable-next-line react/no-unstable-nested-components
      function ({ style }: TextFieldAccessoryProps) {
        return (
          <TouchableOpacity
            style={[style, $countryCodeStyle]}
            onPress={() => setShowCountries(true)}
          >
            <Text>{countryCode}</Text>
          </TouchableOpacity>
        );
      },
    [countryCode],
  );
  
  const validate = () => {
    let loginParams: EditProfileParams = {
      name,
      email,
      phone,
      location: address?.address!,
      profile_image: imageURI,
    };
    editProfile
      .validate(loginParams, { abortEarly: false })
      .then(params => {
        const formData = new FormData();
        formData.append('name', params.name);
        formData.append('email', params.email);
        formData.append('phone', params.phone);
        formData.append('location', params.location);
        formData.append('latitude', address.location.lat);
        formData.append('longitude', address.location.lng);
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
      <Screen preset="auto" contentContainerStyle={$container}>
        <View style={$header}>
          <View>
            <FastImage
              resizeMode="cover"
              style={$userImage}
              source={{ uri: imageURI }}
            />
            <TouchableOpacity
              style={$editImageIcon}
              onPress={() => setImagePickerVisible(true)}
            >
              <Image
                resizeMode="contain"
                source={images.camera}
                style={$cameraIcon}
                tintColor={colors.palette.white}
              />
            </TouchableOpacity>
          </View>

          <Text size="md" weight="semiBold" text={props.profile?.name} />
        </View>

        <View style={$personalDetailsSection}>
          <Text
            size="md"
            weight="medium"
            style={$sectionTitle}
            tx="editProfile.personalDetails"
          />

          <TextField
            value={name}
            onChangeText={setName}
            containerStyle={$fieldContainer}
            labelTx="editProfile.fullName"
            placeholderTx="editProfile.enterFullName"
            helperTx={error?.name}
            status={error?.name ? 'error' : undefined}
          />

          <TextField
            value={phone}
            onChangeText={setPhone}
            labelTx='editProfile.mobileNumber'
            placeholderTx="editProfile.enterMobileNumber"
            keyboardType="phone-pad"
           containerStyle={$fieldContainer}
            LeftAccessory={CountryCodeAccessory}
            helperTx={error?.phone}
            status={error?.phone ? 'error' : undefined}
          />

          <TextField
            value={email}
            onChangeText={setEmail}
           containerStyle={$fieldContainer}
            labelTx="editProfile.email"
            placeholderTx="editProfile.enterEmail"
            keyboardType="email-address"
            helperTx={error?.email}
            status={error?.email ? 'error' : undefined}
          />

          <TouchableOpacity onPress={() => setAddressModal('pick')}>
            <TextField
              editable={false}
              pointerEvents="none"
              onPress={() => setAddressModal('pick')}
              value={address?.address}
              labelTx="editProfile.location"
              placeholderTx="editProfile.enterAddress"
              helperTx={error?.address}
              status={error?.address ? 'error' : undefined}
            />
          </TouchableOpacity>
        </View>

        <Button
          style={$updateButton}
          tx="editProfile.updateProfile"
          onPress={validate}
        />
      </Screen>

      <CountryPickerModal
        onSelect={data => {
          setCountryCode(data.dial_code);
          setShowCountries(false);
        }}
        modalVisible={showCountries}
        onClose={() => {
          setShowCountries(false);
        }}
      />

      <CustomImagePicker
        imagePickerModal={imagePickerVisible}
        onDismiss={() => setImagePickerVisible(false)}
        callback={uploadImage}
      />
      <AddressSearchModal
        showCurrent
        onSelect={(newAddress: AddressParam) => setAddress(newAddress)}
        isVisible={addressModal !== 'none'}
        onClose={() => setAddressModal('none')}
        title="ride.enterAddress"
      />
      <Loader loading={props.loading === 'loading'} />
    </>
  );
};

const $container: ViewStyle = {
  flexGrow: 1,
};

const $header: ViewStyle = {
  gap: spacing.sm,
  alignItems: 'center',
  marginVertical: spacing.sm,
  marginHorizontal: spacing.md,
};

const $userImage: ImageStyle = {
  width: 110,
  height: 110,
  borderWidth: 5,
  borderRadius: 55,
  borderColor: colors.palette.offWhite2,
};

const $editImageIcon: ViewStyle = {
  right: spacing.xs,
  bottom: spacing.xxs,
  padding: spacing.xs,
  position: 'absolute',
  borderRadius: spacing.md,
  backgroundColor: colors.primary,
};

const $cameraIcon: ImageStyleRN = {
  width: spacing.md,
  height: spacing.md,
};

const $personalDetailsSection: ViewStyle = {
  borderTopWidth: 1,
  paddingTop: spacing.sm,
  marginHorizontal: spacing.md,
  borderTopColor: colors.palette.borderColor,
};

const $sectionTitle: TextStyle = {
  marginBottom: spacing.lg,
};

const $fieldContainer: ViewStyle = {
  marginBottom: spacing.sm,
};

const $countryCodeStyle: ViewStyle = {
  height: 24,
  borderRightWidth: 1,
  borderColor: colors.separator,
  marginVertical: spacing.sm + 2,
};

const $updateButton: ViewStyle = {
  margin: 16,
  height: 55,
  borderRadius: 10,
};


const mapStateToProps = (state: RootState) => ({
  profile: state.auth.myProfile?.user,
  baseURl: state.setting.basic?.base_url,
  loading: state.auth.updateLoading,
});

const mapDispatch = {
  update: (params: FormData) => updateProfile(params),
  reset: () => authActions.resetUpdateLoading(),
};
const connector = connect(mapStateToProps, mapDispatch);

export const EditProfileScreen = connector(EditProfile);
