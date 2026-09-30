import {
  Image,
  Keyboard,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  Button,
  CustomImagePicker,
  Loader,
  Screen,
  Text,
  TextField,
} from '../components';
import { colors, images, spacing } from '../theme';
import { AppStackScreenProps } from '../navigators';
import { FC, useState } from 'react';
import { TxKeyPath } from '../i18n';
import { AddCatalogParams, addCatalogSchema, buildError } from '../apis/schema';
import { scale } from 'react-native-size-matters';
import { commonStyle } from '../theme/style';
import { ImagePickerResponse } from 'react-native-image-picker';
import { createServiceCatalog } from '../apis/catalogs';

type Props = AppStackScreenProps<'AddCatalogModal'>;

type FieldError = {
  heading?: TxKeyPath;
  description?: TxKeyPath;
  price?: TxKeyPath;
  images?: TxKeyPath;
};

type ImageItem = {
  uri: string;
  name: string;
  type: string;
};

export const AddCatalogModal: FC<Props> = props => {
  const [heading, setHeading] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [selectedImages, setSelectedImages] = useState<ImageItem[]>([]);
  const [imagePickerVisible, setImagePickerVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<FieldError>({});

  const uploadImage = (response: ImagePickerResponse) => {
    const asset = response.assets?.[0];
    if (!asset?.uri || selectedImages.length >= 6) {
      return;
    }

    setSelectedImages(current => [
      ...current,
      {
        uri: asset.uri!,
        name: asset.fileName ?? `catalog_${Date.now()}.jpg`,
        type: asset.type ?? 'image/jpeg',
      },
    ]);
    setError(current => ({ ...current, images: undefined }));
  };

  const removeImage = (index: number) => {
    setSelectedImages(current => current.filter((_, itemIndex) => itemIndex !== index));
  };

  const validate = async () => {
    const addCatalogParams: AddCatalogParams = {
      heading,
      description,
      price,
      images: selectedImages.map(image => image.uri),
    };

    try {
      const params = await addCatalogSchema.validate(addCatalogParams, {
        abortEarly: false,
      });
      Keyboard.dismiss();
      setError({});
      setSaving(true);

      const formData = new FormData();
      formData.append('heading', params.heading);
      formData.append('description', params.description);
      formData.append('price', params.price);
      selectedImages.forEach(image => {
        formData.append('images[]', image as any);
      });

      await createServiceCatalog(formData);
      toast.show('Service catalog added successfully.', { type: 'success' });
      props.navigation.goBack();
    } catch (validationError: any) {
      if (validationError?.inner) {
        setError(buildError<FieldError>(validationError));
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Screen
        preset="auto"
        safeAreaEdges={['top']}
        contentContainerStyle={styles.container}
        backgroundColor={colors.palette.overlay50}
      >
        <TouchableOpacity
          style={[styles.crossIcon, commonStyle.customShadow]}
          onPress={() => props.navigation.goBack()}
        >
          <Image source={images.crossIcon} />
        </TouchableOpacity>
        <View style={styles.main}>
          <Text size="md" weight="medium" tx="catalog.addServiceCatalog" />
          <View>
            <TextField
              value={heading}
              onChangeText={setHeading}
              containerStyle={styles.inputContainer}
              placeholderTx="catalog.addServiceHeading"
              helperTx={error.heading}
              status={error.heading ? 'error' : undefined}
            />
            <TextField
              multiline
              value={description}
              onChangeText={setDescription}
              containerStyle={styles.inputContainer}
              placeholderTx="catalog.addServiceDescription"
              helperTx={error.description}
              status={error.description ? 'error' : undefined}
            />
            <TextField
              value={price}
              keyboardType="decimal-pad"
              onChangeText={setPrice}
              containerStyle={styles.inputContainer}
              placeholderTx="catalog.AddServicePrice"
              helperTx={error.price}
              status={error.price ? 'error' : undefined}
            />

            <View style={styles.imageHeading}>
              <Text
                size="xs"
                weight="semiBold"
                tx="catalog.addCatalogImages"
                style={styles.dimText}
              />
              <Text size="xxs" tx="catalog.maxphotos" style={styles.dimText} />
            </View>

            <View style={styles.uploadRow}>
              {selectedImages.length < 6 && (
                <TouchableOpacity
                  style={styles.photoUpload}
                  onPress={() => setImagePickerVisible(true)}
                >
                  <Image source={images.camera} />
                  <Text
                    size="xxs"
                    tx="catalog.addPhoto"
                    style={styles.dimText}
                  />
                </TouchableOpacity>
              )}
              {selectedImages.map((image, index) => (
                <View key={`${image.uri}-${index}`} style={styles.imageBox}>
                  <Image source={{ uri: image.uri }} style={styles.selectedImage} />
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeImage(index)}
                  >
                    <Text text="×" size="sm" style={styles.removeText} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
            {error.images && (
              <Text preset="formHelper" tx={error.images} style={styles.removeText} />
            )}
          </View>
          <Button
            onPress={validate}
            tx="catalog.submit"
            disabled={saving}
            style={saving ? styles.disabledButton : undefined}
          />
        </View>
      </Screen>
      <CustomImagePicker
        imagePickerModal={imagePickerVisible}
        onDismiss={() => setImagePickerVisible(false)}
        callback={uploadImage}
      />
      <Loader loading={saving} />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    marginTop: spacing.xxxl,
  },
  crossIcon: {
    zIndex: 1,
    top: -scale(15),
    right: spacing.xs,
    padding: spacing.sm,
    position: 'absolute',
    alignSelf: 'flex-end',
    borderRadius: spacing.xl,
    backgroundColor: colors.palette.white,
  },
  main: {
    width: '90%',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: spacing.md,
    paddingVertical: spacing.lg,
    backgroundColor: colors.background,
  },
  inputContainer: {
    marginBottom: spacing.sm,
  },
  imageHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dimText: {
    color: colors.textDim,
  },
  uploadRow: {
    gap: spacing.sm,
    flexWrap: 'wrap',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  photoUpload: {
    width: 90,
    height: 90,
    borderWidth: 1,
    gap: spacing.xxs,
    alignItems: 'center',
    borderStyle: 'dashed',
    justifyContent: 'center',
    borderRadius: spacing.xs,
  },
  imageBox: {
    width: 90,
    height: 90,
    overflow: 'hidden',
    borderRadius: spacing.xs,
    backgroundColor: colors.palette.borderColor,
  },
  selectedImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removeButton: {
    top: 2,
    right: 2,
    width: spacing.lg,
    height: spacing.lg,
    position: 'absolute',
    alignItems: 'center',
    borderRadius: spacing.sm,
    justifyContent: 'center',
    backgroundColor: colors.palette.white,
  },
  removeText: {
    color: colors.palette.red,
  },
  disabledButton: {
    opacity: 0.6,
  },
});
