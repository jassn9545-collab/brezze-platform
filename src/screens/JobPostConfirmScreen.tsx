import { BackButtom, Screen, Text, TextField, CustomImagePicker } from '../components';
import {
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
} from 'react-native';
import React, { FC, useState } from 'react';
import { spacing, images, colors } from '../theme';
import { AppStackScreenProps } from '../navigators/AppStack';
import { ImagePickerResponse } from 'react-native-image-picker';
import { translate } from '../i18n';

type NavigationProps = AppStackScreenProps<'JobPostStep2'>;
type Props = NavigationProps;

const JobPostStep2: FC<Props> = (props) => {

  const [budget, setBudget] = useState('');
  const [location, setLocation] = useState('');
  const [selectedImages, setSelectedImages] = useState<ImagePickerResponse[]>([]);
  const [imagePickerModal, setImagePickerModal] = useState(false);
  const [locationPickerModal, setLocationPickerModal] = useState(false);

  const locations = [
    { name: '123 Main Street, Sydney NSW 2000', coordinates: { lat: -33.8688, lng: 151.2093 } },
    { name: '456 Park Avenue, Melbourne VIC 3000', coordinates: { lat: -37.8136, lng: 144.9631 } },
    { name: '789 Queen Street, Brisbane QLD 4000', coordinates: { lat: -27.4679, lng: 153.0281 } },
    { name: '321 King Street, Perth WA 6000', coordinates: { lat: -31.9505, lng: 115.8605 } },
  ];

  const handleImagePicked = (image: ImagePickerResponse) => {
    if (selectedImages.length < 2) {
      setSelectedImages([...selectedImages, image]);
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(selectedImages.filter((_, i) => i !== index));
  };

  const handleLocationSelect = (locationName: string) => {
    setLocation(locationName);
    setLocationPickerModal(false);
  };
  return (
    <Screen
      preset="scroll"
      contentContainerStyle={styles.container}
      safeAreaEdges={['top']}
    >
      {/* HEADER */}
      <BackButtom heading={translate('jobPost.heading')} />

      {/* STEP */}
      <View style={styles.stepContainer}>
        <Text tx="jobPost.step2Label" weight="semiBold" />
        <Text tx="jobPost.step2Details" size="xs" style={styles.stepRight} />
      </View>

      <View style={styles.progressBar}>
        <View style={styles.progressFill} />
      </View>

      {/* LOCATION */}
      <Text tx="jobPost.location" weight="semiBold" style={styles.sectionTitle} />

      <TouchableOpacity 
        style={styles.mapContainer}
        onPress={() => setLocationPickerModal(true)}
      >
        <Image source={images.map} style={styles.mapImage} />
        <View style={styles.mapOverlay}>
          <Text tx="jobPost.selectLocation" style={styles.mapOverlayText} />
        </View>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.currentLocation}
        onPress={() => setLocationPickerModal(true)}
      >
        <Text text={'📍 ' + translate('jobPost.chooseFromMap')} style={styles.linkText} />
      </TouchableOpacity>

      <TextField
        placeholderTx="jobPost.enterLocationPlaceholder"
        value={location}
        onChangeText={setLocation}
        containerStyle={styles.input}
      />

      {/* Location Picker Modal */}
      {locationPickerModal && (
        <View style={styles.modal}>
          <TouchableOpacity 
            style={styles.modalOverlay} 
            onPress={() => setLocationPickerModal(false)}
          />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text tx="jobPost.selectLocationTitle" weight="semiBold" size="lg" />
              <TouchableOpacity onPress={() => setLocationPickerModal(false)}>
                <Text text="✕" size="lg" />
              </TouchableOpacity>
            </View>

            {locations.map((loc, index) => (
              <TouchableOpacity
                key={index}
                style={styles.locationItem}
                onPress={() => handleLocationSelect(loc.name)}
              >
                <Text text="📍" style={styles.locationIcon} />
                <View style={styles.locationTextContainer}>
                  <Text text={loc.name} size="sm" />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* BUDGET + DURATION */}
      <View style={styles.row}>
        <View style={styles.half}>
          <Text text="Budget Range (AUD)" weight="medium" />
          <TextField value={budget} onChangeText={setBudget} placeholder="$ 500" containerStyle={styles.input} />
        </View>

        {/* <View style={styles.half}>
          <Text text="Duration" weight="medium" />
          <TextField placeholder="1-3 Days" containerStyle={styles.input} />
        </View> */}
      </View>

      {/* UPLOAD */}
      <Text tx="jobPost.uploadPhotosLabel" weight="semiBold" style={styles.sectionTitle} />

      <View style={styles.uploadRow}>
        {selectedImages.length < 2 && (
          <TouchableOpacity 
            style={styles.uploadBox}
            onPress={() => setImagePickerModal(true)}
          >
            <Text text="📷" size="lg" />
            <Text tx="jobPost.uploadButtonText" size="xs" />
          </TouchableOpacity>
        )}

        {selectedImages.map((image, index) => (
          <TouchableOpacity 
            key={index} 
            style={styles.imageBox}
            onPress={() => removeImage(index)}
          >
            {image.assets?.[0]?.uri && (
              <Image 
                source={{ uri: image.assets?.[0]?.uri }} 
                style={styles.selectedImage}
              />
            )}
            <View style={styles.removeButton}>
              <Text text="✕" size="xs" style={styles.removeButtonText} />
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <Text
        tx="jobPost.photosHelpText"
        size="xxs"
        style={styles.infoText}
      />

      <CustomImagePicker
        imagePickerModal={imagePickerModal}
        onDismiss={() => setImagePickerModal(false)}
        callback={handleImagePicked}
      />

      {/* FOOTER */}
      <View style={styles.footer}>
        <View style={styles.footerRow}>
          <Text tx="jobPost.step2Label" />
          <Text tx="jobPost.almostThere" weight="semiBold" />
        </View>


        <TouchableOpacity
          style={styles.button}
          onPress={() => props.navigation.navigate("JobPostList")}
        >
          <Text
            tx="jobPost.postJobButton"
            weight="semiBold"
            style={styles.buttonText}
          />
        </TouchableOpacity>
      </View>

    </Screen>
  );
};

const styles = StyleSheet.create({

  container: {
    flexGrow: 1,
    padding: spacing.md,
    backgroundColor: colors.palette.jobPostBackground,
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

  sectionTitle: {
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },

  mapContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.palette.primaryBlue,
    position: 'relative',
  },

  mapImage: {
    width: '100%',
    height: 150,
  },

  mapOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.palette.overlayDark30,
  },

  mapOverlayText: {
    color: colors.palette.white,
    fontWeight: 'bold',
  },

  currentLocation: {
    marginTop: spacing.sm,
  },

  linkText: {
    color: colors.palette.primaryBlue,
  },

  input: {
    marginTop: spacing.sm,
  },

  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },

  half: {
    flex: 1,
  },

  uploadRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },

  uploadBox: {
    width: 90,
    height: 90,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.palette.lightBorder,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },

  imageBox: {
    width: 90,
    height: 90,
    backgroundColor: colors.palette.imageBackground,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
  },

  selectedImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },

  removeButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.palette.overlayDark60,
    justifyContent: 'center',
    alignItems: 'center',
  },

  removeButtonText: {
    color: colors.palette.white,
  },

  infoText: {
    marginTop: spacing.sm,
    color: colors.palette.grayLight,
  },

  footer: {
    marginTop: spacing.lg,
  },

  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  button: {
    marginTop: spacing.lg,
    backgroundColor: colors.palette.primaryBlue,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },

  buttonText: {
    color: colors.palette.white,
  },

  modal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },

  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.palette.overlayDark50,
  },

  modalContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.palette.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: spacing.md,
    maxHeight: '70%',
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.palette.grayLight2,
  },

  locationItem: {
    flexDirection: 'row',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    marginBottom: spacing.xs,
    borderRadius: 8,
    backgroundColor: colors.palette.jobPostBackground,
    alignItems: 'center',
  },

  locationIcon: {
    marginRight: spacing.md,
    fontSize: 20,
  },

  locationTextContainer: {
    flex: 1,
  },

});

export const JobPostConfirmScreen = JobPostStep2;