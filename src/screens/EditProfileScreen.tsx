import React, { FC, useCallback, useEffect, useState } from 'react';
import { translate } from '../i18n';
import {
  Image,
  TouchableOpacity,
  View,
  TextStyle,
  ViewStyle,
} from 'react-native';
import FastImage, { ImageStyle } from '@d11/react-native-fast-image';
import { useFocusEffect } from '@react-navigation/native';
import { connect, ConnectedProps } from 'react-redux';

import {  images,  } from '../theme';
import {
  BackButtom,
  Button,
  Loader,
  Screen,
  Text,
  TextField,
} from '../components';
import { AppStackScreenProps } from '../navigators/AppStack';
import { RootState } from '../store';
import {
  getCustomerProfile,
  updateCustomerProfile,
  resetUpdateCustomerProfileLoading,
} from '../slices/profile.slice';

type NavigationProps = AppStackScreenProps<'EditProfile'>;
type Props = NavigationProps & ConnectedProps<typeof connector>;

const LocationIcon = () => (
  <Image source={images.locationPin} style={$locationIcon as any} />
);

const EditProfile: FC<Props> = props => {
  const {
    customerProfile,
    baseUrl,
    updateCustomerProfileLoading,
    navigation,
    getCustomerProfile,
    updateCustomerProfile,
    resetUpdateCustomerProfileLoading,
  } = props;

  // 🔹 Initial Values
  const [imageURI] = useState(
    customerProfile?.profile_image
      ? baseUrl + '/' + customerProfile.profile_image
      : '',
  );

  const [name, setName] = useState(customerProfile?.name ?? '');
  const [email, setEmail] = useState(customerProfile?.email ?? '');
  const [countryCode] = useState(`+${customerProfile?.country_code ?? '91'}`);
  const [mobileNumber, setMobileNumber] = useState(customerProfile?.phone ?? '');
  const [location, setLocation] = useState(customerProfile?.location ?? '');
  const [address, setAddress] = useState(customerProfile?.street_address ?? '');
  const [state, setState] = useState(customerProfile?.state ?? '');
  const [pincode, setPincode] = useState(customerProfile?.pincode ?? '');
  const [dob, setDOB] = useState(customerProfile?.dob ?? '');

  // 🔹 Fetch Profile
  useFocusEffect(
    useCallback(() => {
      getCustomerProfile();
    }, [getCustomerProfile]),
  );

  // 🔹 Update Profile
  const updateProfileAction = () => {
    const params = {
      name,
      email,
      phone: mobileNumber,
      address,
      state,
      pincode,
      dob,
    };
    updateCustomerProfile(params);
  };

  // 🔹 Success Navigation
  useEffect(() => {
    if (updateCustomerProfileLoading === 'loaded') {
      navigation.goBack();
      resetUpdateCustomerProfileLoading();
    }
  }, [updateCustomerProfileLoading, resetUpdateCustomerProfileLoading, navigation]);

  console.log('Customer Profile Data:', customerProfile);
  console.log('Loading State:', updateCustomerProfileLoading);
  
  
  return (
    <>
      <Screen
        preset="scroll"
        safeAreaEdges={['top', 'bottom']}
        contentContainerStyle={$container}
      >
        {/* HEADER */}
        <BackButtom heading={translate('editProfile.heading')} />

        {/* PROFILE */}
        <View style={$profileSection}>
          <View style={$profileImageContainer}>
            <FastImage
              source={imageURI ? { uri: imageURI } : images.user}
              style={$profileImage}
            />
            <TouchableOpacity style={$changePhotoButton}>
              <Image source={images.camera} style={$changePhotoIcon as any} />
            </TouchableOpacity>
          </View>

          <Text style={$profileName}>{name || translate('editProfile.defaultName')}</Text>
        </View>

        {/* PERSONAL DETAILS */}
        <View style={$personalDetailsSection}>
          <Text tx="editProfile.personalDetails" weight="semiBold" style={$sectionTitle} />

          <TextField
            label={translate('editProfile.fullName')}
            placeholder={translate('editProfile.enterFullName')}
            value={name}
            onChangeText={setName}
            containerStyle={$fieldContainer}
            inputWrapperStyle={$inputWrapper}
            style={$inputStyle}
          />

          {/* PHONE */}
          <View style={$phoneFieldContainer}>
            <View style={$countryCodeContainer}>
              <Text style={$countryCodeText}>{countryCode}</Text>
            </View>

            <TextField
              label={translate('editProfile.mobileNumber')}
              placeholder={translate('editProfile.enterMobileNumber')}
              value={mobileNumber}
              onChangeText={setMobileNumber}
              keyboardType="phone-pad"
              containerStyle={$phoneInputContainer}
              inputWrapperStyle={$inputWrapper}
              style={$inputStyle}
            />
          </View>

          <TextField
            label={translate('editProfile.email')}
            placeholder={translate('editProfile.enterEmail')}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            containerStyle={$fieldContainer}
            inputWrapperStyle={$inputWrapper}
            style={$inputStyle}
          />

          <TextField
            label={translate('editProfile.location')}
            placeholder={translate('editProfile.enterLocation')}
            value={location}
            onChangeText={setLocation}
            containerStyle={$fieldContainer}
            inputWrapperStyle={$inputWrapper}
            style={$inputStyle}
            RightAccessory={LocationIcon}
          />

          <TextField
            label={translate('editProfile.address')}
            placeholder={translate('editProfile.enterAddress')}
            value={address}
            onChangeText={setAddress}
            containerStyle={$fieldContainer}
            inputWrapperStyle={$inputWrapper}
            style={$inputStyle}
          />

          <TextField
            label={translate('editProfile.state')}
            placeholder={translate('editProfile.enterState')}
            value={state}
            onChangeText={setState}
            containerStyle={$fieldContainer}
            inputWrapperStyle={$inputWrapper}
            style={$inputStyle}
          />

          <TextField
            label={translate('editProfile.pincode')}
            placeholder={translate('editProfile.enterPincode')}
            value={pincode}
            onChangeText={setPincode}
            keyboardType="numeric"
            containerStyle={$fieldContainer}
            inputWrapperStyle={$inputWrapper}
            style={$inputStyle}
          />

          <TextField
            label={translate('editProfile.dateOfBirth')}
            placeholder={translate('editProfile.enterDateOfBirth')}
            value={dob}
            onChangeText={setDOB}
            containerStyle={$fieldContainer}
            inputWrapperStyle={$inputWrapper}
            style={$inputStyle}
          />
        </View>

        {/* BUTTON */}
        <Button
          text={translate('editProfile.updateProfile')}
          style={$updateButton}
          onPress={updateProfileAction}
        />
      </Screen>

      <Loader loading={updateCustomerProfileLoading === 'loading' as any} />
    </>
  );
};

/* ================== STYLES ================== */

const $container: ViewStyle = {
  flexGrow: 1,
  backgroundColor: '#F3F4F6',
};

const $profileSection: ViewStyle = {
  alignItems: 'center',
  paddingVertical: 24,
  backgroundColor: '#F8F9FB',
};

const $profileImageContainer: ViewStyle = {
  position: 'relative',
};

const $profileImage: ImageStyle = {
  width: 110,
  height: 110,
  borderRadius: 55,
};

const $changePhotoButton: ViewStyle = {
  position: 'absolute',
  bottom: 5,
  right: 5,
  backgroundColor: '#fff',
  borderRadius: 20,
  width: 32,
  height: 32,
  justifyContent: 'center',
  alignItems: 'center',
  elevation: 3,
};

const $changePhotoIcon: ImageStyle = {
  width: 18,
  height: 18,
};

const $profileName: TextStyle = {
  fontSize: 20,
  fontWeight: '600',
  marginTop: 10,
};

const $personalDetailsSection: ViewStyle = {
  backgroundColor: '#fff',
  marginTop: 10,
  padding: 16,
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
};

const $sectionTitle: TextStyle = {
  fontSize: 18,
  fontWeight: '600',
  marginBottom: 20,
};

const $fieldContainer: ViewStyle = {
  marginBottom: 16,
};

const $inputWrapper: ViewStyle = {
  borderWidth: 1,
  borderColor: '#E5E7EB',
  borderRadius: 10,
  backgroundColor: '#F9FAFB',
  paddingHorizontal: 12,
  height: 50,
  justifyContent: 'center',
};

const $inputStyle: TextStyle = {
  fontSize: 15,
  color: '#111',
};

const $phoneFieldContainer: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 16,
};

const $countryCodeContainer: ViewStyle = {
  height: 50,
  borderWidth: 1,
  borderColor: '#E5E7EB',
  borderRadius: 10,
  justifyContent: 'center',
  paddingHorizontal: 12,
  marginRight: 8,
  backgroundColor: '#F3F4F6',
};

const $countryCodeText: TextStyle = {
  fontSize: 16,
  fontWeight: '500',
};

const $phoneInputContainer: ViewStyle = {
  flex: 1,
};

const $locationIcon: ImageStyle = {
  width: 18,
  height: 18,
};

const $updateButton: ViewStyle = {
  marginHorizontal: 16,
  marginVertical: 20,
  backgroundColor: '#0B5ED7',
  borderRadius: 10,
  height: 55,
  justifyContent: 'center',
};

/* ================== REDUX ================== */

const mapStateToProps = (state: RootState) => ({
  customerProfile: state.profile.customerProfile,
  updateCustomerProfileLoading: state.profile.updateCustomerProfileLoading,
  baseUrl: state.setting.basic?.base_url,
});

const mapDispatch = {
  getCustomerProfile,
  updateCustomerProfile,
  resetUpdateCustomerProfileLoading,
};

const connector = connect(mapStateToProps, mapDispatch);

export const EditProfileScreen = connector(EditProfile);