import {
  BackButtom,
  Button,
  CustomImagePicker,
  DataType,
  DatePickerModal,
  DropDownList,
  Loader,
  Screen,
  sizeForSheet,
  Text,
  TextField,
} from '../components';
import {
  Image,
  Keyboard,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { FC, useRef, useState } from 'react';
import { colors, images, spacing } from '../theme';

import { AuthStackScreenProps } from '../navigators';
import { TxKeyPath } from '../i18n';
import moment from 'moment';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { commonStyle } from '../theme/style';
import { ImagePickerResponse } from 'react-native-image-picker';
import { ValidationError } from 'yup';
import { buildError, cardDetailSchema } from '../apis/schema';
import { connect, ConnectedProps } from 'react-redux';
import { RootState } from '../store';
import { uploadUserVerificationID } from '../slices/auth.slice';

type NavigationProps = AuthStackScreenProps<'UploadDocument'>;
type StoreProps = ConnectedProps<typeof connector>;
type Props = NavigationProps & StoreProps;

type FieldError = {
  proof_type?: TxKeyPath | undefined;
  id_number?: TxKeyPath | undefined;
  expiry_date?: TxKeyPath | undefined;
  front_image?: TxKeyPath | undefined;
  back_image?: TxKeyPath | undefined;
};

type ImagePicker = {
  visible: boolean;
  type: 'front' | 'back' | '';
};
const UploadDocument: FC<Props> = props => {
  const insets = useSafeAreaInsets();

  const IDTypeSheet = useRef<TrueSheet>(null);

  const [idType, setIDType] = useState<DataType>();
  const [idNumber, setIDNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState<Date | undefined>(undefined);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [imagePickerVisible, setImagePickerVisible] = useState<ImagePicker>({
    visible: false,
    type: '',
  });
  const [frontImageFormData, setFrontImageFormData] = useState<{
    uri: string;
    name: string;
    type: string;
  } | null>(null);

  const [backImageFormData, setBackImageFormData] = useState<{
    uri: string;
    name: string;
    type: string;
  } | null>(null);

  const uploadImage = (image: ImagePickerResponse) => {
    if ((image.assets?.length ?? 0) > 0) {
      if (imagePickerVisible.type === 'front') {
        setFrontImageFormData({
          uri: image.assets?.[0].uri!,
          name: image.assets?.[0].fileName!,
          type: image.assets?.[0].type!,
        });
      } else {
        setBackImageFormData({
          uri: image.assets?.[0].uri!,
          name: image.assets?.[0].fileName!,
          type: image.assets?.[0].type!,
        });
      }
    }
  };

  const [error, setError] = useState<FieldError>({});
  const validate = () => {
    cardDetailSchema
      .validate(
        {
          proof_type: idType?.id,
          id_number: idNumber,
          expiry_date: expiryDate,
          front_image: frontImageFormData?.uri,
          back_image: backImageFormData?.uri,
        },
        { abortEarly: false},
      )
      .then(res => {
        Keyboard.dismiss();
        const formData = new FormData();
        formData.append('proof_type', res.proof_type);
        formData.append('id_number', res.id_number);
        formData.append('expiry_date', res.expiry_date);
        formData.append('front_image', frontImageFormData);
        formData.append('back_image', backImageFormData);

        props.uploadUserVerificationID(formData);
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
        <BackButtom headingTx="document.confirmIDCard" />
        <View style={styles.mainView}>
          <TouchableOpacity onPress={() => IDTypeSheet.current?.present()}>
            <TextField
              editable={false}
              pointerEvents="none"
              value={idType?.id ? idType.id : ''}
              labelTx="document.idType"
              placeholderTx="document.idTypePlaceholder"
              containerStyle={styles.inputContainer}
              helperTx={error?.proof_type}
              status={error?.proof_type ? 'error' : undefined}
            />
          </TouchableOpacity>

          <TextField
            value={idNumber}
            onChangeText={setIDNumber}
            containerStyle={styles.inputContainer}
            placeholderTx="document.idNumberPlaceholder"
            labelTx="document.idNumber"
            keyboardType="number-pad"
            helperTx={error?.id_number}
            status={error?.id_number ? 'error' : undefined}
          />

          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            activeOpacity={0.8}
          >
            <TextField
              editable={false}
              pointerEvents="none"
              value={expiryDate ? moment(expiryDate).format('DD/MM/YYYY') : ''}
              labelTx="document.expiryDate"
              placeholderTx="document.expiryPlaceholder"
              containerStyle={styles.inputContainer}
              helperTx={error?.expiry_date}
              status={error?.expiry_date ? 'error' : undefined}
            />
          </TouchableOpacity>

          <View style={styles.imageView}>
            <Text weight="light" size="sm" tx="document.uploadFrontIDImage" />

            <TouchableOpacity
              onPress={() =>
                setImagePickerVisible({ visible: true, type: 'front' })
              }
              style={[styles.imageContainer, commonStyle.customShadow]}
            >
              {frontImageFormData?.uri ? (
                <Image
                  resizeMode="cover"
                  style={styles.image}
                  source={{ uri: frontImageFormData?.uri }}
                />
              ) : (
                <>
                  <Image source={images.uploadingIcon} />
                  <Text
                    size="sm"
                    weight="semiBold"
                    tx="document.clickUpload"
                    style={styles.primaryColor}
                  />
                  <Text
                    size="xs"
                    weight="light"
                    tx="document.imageSize"
                    style={styles.textCenter}
                  />
                </>
              )}
            </TouchableOpacity>

            {error.front_image && (
              <Text
                preset="formHelper"
                tx={error.front_image}
                style={{ color: colors.error }}
              />
            )}
          </View>

          <View style={styles.imageView}>
            <Text weight="light" size="sm" tx="document.uploadBackIDImage" />

            <TouchableOpacity
              onPress={() =>
                setImagePickerVisible({ visible: true, type: 'back' })
              }
              style={[styles.imageContainer, commonStyle.customShadow]}
            >
              {backImageFormData?.uri ? (
                <Image
                  resizeMode="cover"
                  style={styles.image}
                  source={{ uri: backImageFormData?.uri }}
                />
              ) : (
                <>
                  <Image source={images.uploadingIcon} />
                  <Text
                    size="sm"
                    weight="semiBold"
                    tx="document.clickUpload"
                    style={styles.primaryColor}
                  />
                  <Text
                    size="xs"
                    weight="light"
                    tx="document.imageSize"
                    style={styles.textCenter}
                  />
                </>
              )}
            </TouchableOpacity>

            {error.back_image && (
              <Text
                preset="formHelper"
                tx={error.back_image}
                style={{ color: colors.error }}
              />
            )}
          </View>

          <View style={styles.flex} />

          <Button
            tx="common.submit"
            onPress={validate}
            style={styles.buttonStyle}
          />
        </View>
      </Screen>
      <DropDownList
        title="document.idType"
        ref={IDTypeSheet}
        data={
          (props.proofList?.map(item => ({
            id: item.name,
            title: item.name,
          })) ?? []) as DataType[]
        }
        selectedId={idType?.id}
        onSelect={data => setIDType(data)}
        sizes={sizeForSheet(props.proofList?.length!, insets)}
      />
      <DatePickerModal
        mode="date"
        display="auto"
        visible={showDatePicker}
        onChangeDate={setExpiryDate}
        value={expiryDate ?? new Date()}
        onDismiss={() => setShowDatePicker(false)}
      />
      <CustomImagePicker
        callback={uploadImage}
        imagePickerModal={imagePickerVisible.visible}
        onDismiss={() => setImagePickerVisible({ visible: false, type: '' })}
      />
      <Loader loading={props.loading === 'loading'} />
    </>
  );
};

const styles = StyleSheet.create({
  containerStyle: {
    flexGrow: 1,
  },
  textCenter: {
    textAlign: 'center',
  },
  mainView: {
    flex: 1,
    margin: spacing.md,
  },
  inputContainer: {
    marginTop: spacing.sm,
  },
  primaryColor: { color: colors.primary },
  imageView: {
    gap: spacing.md,
    margin: spacing.lg,
  },
  imageContainer: {
    borderWidth: 0.5,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: spacing.sm,
    backgroundColor: colors.background,
    borderColor: colors.palette.borderColor,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  buttonStyle: {
    borderRadius: spacing.xs,
    marginVertical: spacing.lg,
  },
  flex: { flex: 1 },
});

const mapStateToProps = (state: RootState) => ({
  proofList: state.setting.basic?.proof_type,
  loading: state.auth.uploadUserVerificationIDLoading,
});

const mapDispatch = {
  uploadUserVerificationID,
};

const connector = connect(mapStateToProps, mapDispatch);

export const UploadDocumentScreen = connector(UploadDocument);
