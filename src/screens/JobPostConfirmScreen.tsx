import {
  BackButtom,
  Screen,
  Text,
  TextField,
  CustomImagePicker,
  AddressParam,
  AddressSearchModal,
  TextFieldAccessoryProps,
  Button,
  Loader,
} from '../components';
import {
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  Keyboard,
} from 'react-native';
import React, { FC, useEffect, useRef, useState } from 'react';
import { spacing, colors, images } from '../theme';
import { AppStackScreenProps } from '../navigators/AppStack';
import { ImagePickerResponse } from 'react-native-image-picker';
import { AddressType } from '../slices/address.types';
import { TxKeyPath } from '../i18n';
import { Currency } from '../config/defaults';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { LATITUDE_DELTA, LONGITUDE_DELTA } from '../utils/util';
import { currentPosition } from '../utils/Location';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { connect, ConnectedProps } from 'react-redux';
import { RootState } from '../store';
import { commonStyle } from '../theme/style';
import { buildError, JobPostSecondSchema } from '../apis/schema';
import { ValidationError } from 'yup';
import { createJob } from '../slices/job.slice';

type NavigationProps = AppStackScreenProps<'JobPostStep2'>;
type StoreProps = ConnectedProps<typeof connector>;
type Props = NavigationProps & StoreProps;

type FieldError = {
  budget?: TxKeyPath | undefined;
  address?: TxKeyPath | undefined;
  images?: TxKeyPath | undefined;
};

type ImageItem = {
  uri: string;
  name: string;
  type: string;
};

const addressLeftAccessory = (props: TextFieldAccessoryProps) => {
  return (
    <View style={[props.style, styles.inputAccessoryStyle]}>
      <Image source={images.locationPin} />
    </View>
  );
};
const JobPostStep2: FC<Props> = props => {
  const insets = useSafeAreaInsets();
  const map = useRef<MapView>(null);
  const [selectedAddress, setSelectedAddress] = useState<AddressParam>();
  const [addressModal, setAddressModal] = useState<AddressType>('none');
  const [budget, setBudget] = useState('');

  const [error, setError] = useState<FieldError>({});
  const [selectedImages, setSelectedImages] = useState<ImageItem[]>([]);

  const [imagePickerModal, setImagePickerModal] = useState(false);

  useEffect(() => {
    if (map.current && selectedAddress?.location) {
      map.current.animateToRegion(
        {
          latitude: selectedAddress.location.lat,
          longitude: selectedAddress.location.lng,
          latitudeDelta: LATITUDE_DELTA,
          longitudeDelta: LONGITUDE_DELTA,
        },
        500,
      );
    }
  }, [selectedAddress]);

  const uploadImage = (image: ImagePickerResponse) => {
    if ((image.assets?.length ?? 0) > 0) {
      const asset = image.assets![0];
      const body: ImageItem = {
        uri: asset.uri ?? '',
        name: asset.fileName ?? `image_${Date.now()}.jpg`,
        type: asset.type ?? 'image/jpeg',
      };

      setSelectedImages(prev => [...prev, body]);
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const validate = () => {
    JobPostSecondSchema.validate(
      {
        budget,
        address: selectedAddress?.address,
        images: selectedImages,
      },
      { abortEarly: false },
    )
      .then(res => {
        Keyboard.dismiss();
        const formData = new FormData();
        formData.append('category', props.route.params.category);
        formData.append('description', props.route.params.description);
        formData.append('title', props.route.params.title);
        formData.append('budget', res.budget);
        formData.append('address', res.address);
        formData.append('images', res.images);
        formData.append('latitude', selectedAddress?.location.lat);
        formData.append('longitude', selectedAddress?.location.lat);

        props.createJob(formData)
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
        contentContainerStyle={styles.container}
      >
        <BackButtom headingTx="jobPost.heading" />

        <View style={styles.main}>
          <View style={styles.stepContainer}>
            <Text tx="jobPost.step2Label" weight="semiBold" />
            <Text
              tx="jobPost.step2Details"
              size="xs"
              style={styles.stepRight}
            />
          </View>

          <View style={styles.progressBar}>
            <View style={styles.progressFill} />
          </View>

          <View style={styles.map}>
            <Text
              size="sm"
              weight="medium"
              tx="jobPost.location"
              style={{
                marginBottom: spacing.xs,
              }}
            />
            <MapView
              ref={map}
              maxZoomLevel={17}
              showsUserLocation={true}
              showsMyLocationButton={false}
              provider={PROVIDER_GOOGLE}
              initialRegion={{
                latitude:
                  selectedAddress?.location.lat ??
                  currentPosition?.lat ??
                  props.myProfile?.latitude ??
                  0,
                longitude:
                  selectedAddress?.location.lng ??
                  currentPosition?.lng ??
                  props.myProfile?.longitude ??
                  0,
                latitudeDelta: LATITUDE_DELTA,
                longitudeDelta: LONGITUDE_DELTA,
              }}
              style={styles.mapView}
            >
              {(selectedAddress?.location || currentPosition) && (
                <Marker.Animated
                  key={`${selectedAddress}`}
                  coordinate={{
                    latitude:
                      selectedAddress?.location.lat ??
                      currentPosition?.lat ??
                      0,
                    longitude:
                      selectedAddress?.location.lng ??
                      currentPosition?.lng ??
                      0,
                  }}
                >
                  <Image source={images.address} />
                </Marker.Animated>
              )}
            </MapView>
          </View>

          <TouchableOpacity onPress={() => setAddressModal('pick')}>
            <TextField
              editable={false}
              pointerEvents="none"
              LeftAccessory={addressLeftAccessory}
              onPress={() => setAddressModal('pick')}
              value={selectedAddress?.address}
              placeholderTx="jobPost.enterLocationPlaceholder"
              helperTx={error?.address}
              status={error?.address ? 'error' : undefined}
            />
          </TouchableOpacity>

          <TextField
            value={budget}
            labelTx="jobPost.budgetRangeLabel"
            labelTxOptions={{
              value: Currency.code,
            }}
            onChangeText={setBudget}
            placeholder={Currency.sign + ' 500'}
            containerStyle={styles.input}
            helperTx={error?.budget}
            status={error?.budget ? 'error' : undefined}
          />

          <Text tx="jobPost.uploadPhotosLabel" weight="medium" />
          <View style={styles.uploadRow}>
            <TouchableOpacity
              style={styles.uploadBox}
              onPress={() => setImagePickerModal(true)}
            >
              <Image source={images.camera} />
              <Text tx="jobPost.uploadButtonText" size="xs" />
            </TouchableOpacity>

            {selectedImages.map((image, index) => (
              <TouchableOpacity
                key={index}
                style={styles.imageBox}
                onPress={() => removeImage(index)}
              >
                <Image
                  source={{ uri: image.uri ?? '' }}
                  style={styles.selectedImage}
                />
                <View style={styles.removeButton}>
                  <Text text="✕" size="xs" style={styles.redText} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
          {error.images && (
            <Text
              preset="formHelper"
              tx={error.images}
              style={{ color: colors.error }}
            />
          )}
          <View style={styles.imageHelperView}>
            <Image source={images.info} style={{ marginTop: spacing.xxs }} />
            <Text
              size="xxs"
              tx="jobPost.photosHelpText"
              style={{ color: colors.palette.grayLight }}
            />
          </View>
        </View>
      </Screen>
      <View
        style={[
          styles.footer,
          commonStyle.customShadow,
          { paddingBottom: insets.bottom },
        ]}
      >
        <View style={styles.footerRow}>
          <Text tx="jobPost.step2Label" weight="medium" />
          <Text tx="jobPost.almostThere" weight="bold" />
        </View>

        <Button
          tx="jobPost.postJobButton"
          onPress={validate}
          style={styles.buttonStyle}
        />
      </View>
      <AddressSearchModal
        showCurrent
        onSelect={(address: AddressParam) => setSelectedAddress(address)}
        isVisible={addressModal !== 'none'}
        onClose={() => setAddressModal('none')}
        title="ride.enterAddress"
      />
      <CustomImagePicker
        imagePickerModal={imagePickerModal}
        onDismiss={() => setImagePickerModal(false)}
        callback={uploadImage}
      />
      <Loader loading={props.loading === 'loading'} />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
  main: {
    marginBottom: spacing.md,
    marginHorizontal: spacing.md,
  },
  stepContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  stepRight: {
    color: colors.palette.primaryBlue,
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.palette.lightGray,
    borderRadius: 10,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  progressFill: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.palette.primaryBlue,
    borderRadius: 10,
  },
  input: {
    marginVertical: spacing.md,
  },
  inputAccessoryStyle: {
    marginVertical: spacing.sm,
    height: 24,
  },
  map: {
    flex: 1,
    height: 185,
    marginBottom: spacing.md,
  },
  mapView: {
    flex: 1,
  },
  uploadRow: {
    flex: 1,
    gap: spacing.sm,
    flexWrap: 'wrap',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  uploadBox: {
    width: 90,
    height: 90,
    borderWidth: 1,
    gap: spacing.xxs,
    alignItems: 'center',
    borderStyle: 'dashed',
    justifyContent: 'center',
    borderRadius: spacing.xs,
    borderColor: colors.palette.lightBorder,
    backgroundColor: colors.palette.lightShadowPrimary,
  },
  imageBox: {
    width: 90,
    height: 90,
    overflow: 'hidden',
    borderRadius: spacing.xs,
    backgroundColor: colors.palette.imageBackground,
  },
  selectedImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removeButton: {
    top: 2,
    right: 2,
    zIndex: 999,
    width: spacing.lg,
    height: spacing.lg,
    position: 'absolute',
    alignItems: 'center',
    borderRadius: spacing.sm,
    justifyContent: 'center',
    backgroundColor: colors.palette.white,
  },
  redText: {
    color: colors.palette.red,
  },
  imageHelperView: {
    gap: spacing.xs,
    flexDirection: 'row',
    marginTop: spacing.sm,
  },
  footer: {
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.palette.white,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  buttonStyle: {
    marginTop: spacing.lg,
    borderRadius: spacing.md,
  },
});

const mapStateToProps = (state: RootState) => ({
  loading: state.job.createloading,
  myProfile: state.auth.myProfile?.user,
});

const mapDispatch = {
  createJob,
};

const connector = connect(mapStateToProps, mapDispatch);
export const JobPostConfirmScreen = connector(JobPostStep2);
