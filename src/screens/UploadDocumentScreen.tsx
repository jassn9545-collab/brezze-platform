import {
  Button,
  CustomImagePicker,
  DataType,
  DatePickerModal,
  DropDownList,
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
import { translate, TxKeyPath } from '../i18n';
import moment from 'moment';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { commonStyle } from '../theme/style';
import { ImagePickerResponse } from 'react-native-image-picker';
import { ValidationError } from 'yup';
import { buildError, cardDetailSchema } from '../apis/schema';

type NavigationProps = AuthStackScreenProps<'UploadDocument'>;
// type StoreProps = ConnectedProps<typeof connector>;
// type Props = NavigationProps & StoreProps;

type FieldError = {
  idType?: TxKeyPath | undefined;
  idNumber?: TxKeyPath | undefined;
  expiryDate?: TxKeyPath | undefined;
};

export const idTypeList: DataType[] = [
  { name: 'idTypes.driverLicense', id: 'driver_license' },
  { name: 'idTypes.passport', id: 'passport' },
  { name: 'idTypes.nationalId', id: 'national_id' },
  { name: 'idTypes.voterId', id: 'voter_id' },
  { name: 'idTypes.panCard', id: 'pan_card' },
  { name: 'idTypes.aadhaarCard', id: 'aadhaar_card' },
  { name: 'idTypes.residencePermit', id: 'residence_permit' },
];

const UploadDocument: FC<NavigationProps> = props => {
  const insets = useSafeAreaInsets();

  const IDTypeSheet = useRef<TrueSheet>(null);

  const [idType, setIDType] = useState<DataType>();
  const [idNumber, setIDNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState<Date | undefined>(undefined);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // const [imageURI, setImageURI] = useState('');
  const [imagePickerVisible, setImagePickerVisible] = useState(false);
  // const [imageFormData, setImageFormData] = useState<{
  //   uri: string;
  //   name: string;
  //   type: string;
  // } | null>(null);

  const uploadImage = (image: ImagePickerResponse) => {
    if ((image.assets?.length ?? 0) > 0) {
      // setImageURI(image.assets?.[0].uri!);
      // setImageFormData({
      //   uri: image.assets?.[0].uri!,
      //   name: image.assets?.[0].fileName!,
      //   type: image.assets?.[0].type!,
      // });
    }
  };

  const [error, setError] = useState<FieldError>({});
  const validate = () => {
    cardDetailSchema
      .validate(
        {
          idType: idType?.id,
          idNumber: idNumber,
          expiryDate,
        },
        { abortEarly: false, context: { isSignup: true } },
      )
      .then(res => {
        Keyboard.dismiss();
        console.log('res', res);
        props.navigation.goBack();
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
        <View style={styles.wrapHeader}>
          <Image source={images.leftArrow} />
          <Text
            size="sm"
            weight="bold"
            tx="document.confirmIDCard"
            style={styles.textCenter}
          />
          <View style={styles.rightIcon} />
        </View>
        <View style={styles.mainView}>
          <TouchableOpacity onPress={() => IDTypeSheet.current?.present()}>
            <TextField
              editable={false}
              pointerEvents="none"
              value={idType?.name ? translate(idType.name) : ''}
              labelTx="document.idType"
              placeholderTx="document.idTypePlaceholder"
              containerStyle={styles.inputContainer}
              helperTx={error?.idType}
              status={error?.idType ? 'error' : undefined}
            />
          </TouchableOpacity>

          <TextField
            value={idNumber}
            onChangeText={setIDNumber}
            containerStyle={styles.inputContainer}
            placeholderTx="document.idNumberPlaceholder"
            labelTx="document.idNumber"
            keyboardType="number-pad"
            helperTx={error?.idNumber}
            status={error?.idNumber ? 'error' : undefined}
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
              helperTx={error?.expiryDate}
              status={error?.expiryDate ? 'error' : undefined}
            />
          </TouchableOpacity>

          <View style={styles.imageView}>
            <Text weight="light" size="sm" tx="document.uploadIDImage" />

            <TouchableOpacity
              onPress={() => setImagePickerVisible(true)}
              style={[styles.imageContainer, commonStyle.customShadow]}
            >
              {/* {imageURI ? (
                <Image source={imageURI} />
              ) : (
                <> */}
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
              {/* </>
              )} */}
            </TouchableOpacity>
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
        data={idTypeList}
        selectedId={idType?.id}
        onSelect={data => setIDType(data)}
        sizes={sizeForSheet(idTypeList.length, insets)}
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
        imagePickerModal={imagePickerVisible}
        onDismiss={() => setImagePickerVisible(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  containerStyle: {
    flexGrow: 1,
  },
  wrapHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.md,
    justifyContent: 'space-between',
  },
  textCenter: {
    textAlign: 'center',
  },
  rightIcon: {
    width: 45,
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
  buttonStyle: {
    borderRadius: spacing.xs,
    marginVertical: spacing.lg,
  },
  flex: { flex: 1 },
});

// const mapStateToProps = (state: RootState) => ({
//   loading: state.auth.loading,
// });

// const mapDispatch = {
//   user_Login: (params: Signin) => userLogin(params),
//   clearLoginLoading: () => authActions.clearLoginLoading(),
// };

// const connector = connect(mapStateToProps, mapDispatch);

export const UploadDocumentScreen = UploadDocument;
