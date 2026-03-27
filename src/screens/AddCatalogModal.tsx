import {
  Image,
  Keyboard,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Button, Screen, Text, TextField } from '../components';
import { colors, images, spacing } from '../theme';
import { AppStackScreenProps } from '../navigators';
import { FC, useState } from 'react';
import { TxKeyPath } from '../i18n';
import { AddCatalogParams, addCatalogSchema, buildError } from '../apis/schema';
import { scale } from 'react-native-size-matters';
import { commonStyle } from '../theme/style';

type Props = AppStackScreenProps<'AddCatalogModal'>;

type FieldError = {
  heading?: TxKeyPath | undefined;
  description?: TxKeyPath | undefined;
  price?: TxKeyPath | undefined;
  images?: TxKeyPath | undefined;
};

export const AddCatalogModal: FC<Props> = props => {
  const [heading, setHeading] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');

  const [error, setError] = useState<FieldError>({});

  const validate = () => {
    let addCatalogParams: AddCatalogParams = {
      heading,
      description,
      price,
      images: [],
    };
    addCatalogSchema
      .validate(addCatalogParams, { abortEarly: false })
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
            helperTx={error?.heading}
            status={error?.heading ? 'error' : undefined}
          />
          <TextField
            multiline
            value={description}
            onChangeText={setDescription}
            containerStyle={styles.inputContainer}
            placeholderTx="catalog.addServiceDescription"
            helperTx={error?.description}
            status={error?.description ? 'error' : undefined}
          />
          <TextField
            value={price}
            onChangeText={setPrice}
            containerStyle={styles.inputContainer}
            placeholderTx="catalog.AddServicePrice"
            helperTx={error?.price}
            status={error?.price ? 'error' : undefined}
          />

          <View style={styles.imageHeading}>
            <Text
              size="xs"
              weight="semiBold"
              tx="catalog.addCatalogImages"
              style={{ color: colors.textDim }}
            />
            <Text
              size="xxs"
              tx="catalog.maxphotos"
              style={{ color: colors.textDim }}
            />
          </View>

          <View style={styles.photoUpload}>
            <Image source={images.camera} />
            <Text
              size="xxs"
              tx="catalog.addPhoto"
              style={{ color: colors.textDim }}
            />
          </View>
        </View>
        <Button onPress={validate} tx="catalog.submit" />
      </View>
    </Screen>
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
  photoUpload: {
    borderWidth: 1,
    gap: spacing.xxs,
    alignItems: 'center',
    padding: spacing.md,
    borderStyle: 'dashed',
    marginTop: spacing.sm,
    alignSelf: 'flex-start',
    borderRadius: spacing.xs,
    paddingVertical: spacing.lg,
  },
});
