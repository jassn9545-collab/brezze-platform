import {
  BackButtom,
  Button,
  CustomImagePicker,
  Loader,
  Screen,
  Text,
  TextField,
} from '../components';
import {
  Image,
  ImageStyle,
  Keyboard,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import React, { FC, useState } from 'react';
import { AppStackScreenProps } from '../navigators';
import { colors, images, spacing } from '../theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TripCell } from './ActiveJobScreen';
import { TxKeyPath } from '../i18n';
import { buildError, SubmitWorkParams, submitWorkSchema } from '../apis/schema';
import { RootState } from '../store';
import { connect, ConnectedProps } from 'react-redux';
import { ImagePickerResponse } from 'react-native-image-picker';
import { submitJob } from '../slices/home.slice';

type NavigationProps = AppStackScreenProps<'SubmitWork'>;
type StoreProps = ConnectedProps<typeof connector>;
type Props = NavigationProps & StoreProps;

type FieldError = {
  description?: TxKeyPath | undefined;
  images?: TxKeyPath | undefined;
};

type ImageItem = {
  uri: string;
  name: string;
  type: string;
};

const SubmitWork: FC<Props> = props => {
  const insets = useSafeAreaInsets();
  const [description, setDescription] = useState('');
  const [selectedImages, setSelectedImages] = useState<ImageItem[]>([]);
  const [imagePickerModal, setImagePickerModal] = useState(false);

  const [error, setError] = useState<FieldError>({});

  const uploadImage = (image: ImagePickerResponse) => {
    if ((image.assets?.length ?? 0) > 0) {
      const asset = image.assets![0];
      const body: ImageItem = {
        uri: asset.uri ?? '',
        name: asset.fileName ?? `image_${Date.now()}.jpg`,
        type: asset.type ?? 'image/jpeg',
      };
      setSelectedImages([body]);
      // setSelectedImages(prev => [...prev, body]);
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const validate = () => {
    let addCatalogParams: SubmitWorkParams = {
      description,
      images: selectedImages,
    };
    submitWorkSchema
      .validate(addCatalogParams, { abortEarly: false })
      .then(res => {
        Keyboard.dismiss();
        const formData = new FormData();
        formData.append('project_id', props.data?.id?.toString() ?? '');
        formData.append('work_description', res.description);
        if (res.images) {
          formData.append('work_attachment', {
            uri: res.images?.[0]?.uri,
            name: res.images?.[0]?.name,
            type: res.images?.[0]?.type,
          });
        }    
        props.submit(formData);
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
        headingTx="job.submitWork"
        style={{
          paddingHorizontal: spacing.md,
          paddingTop: insets.top + spacing.sm,
        }}
      />
      <Screen preset="auto" contentContainerStyle={$container}>
        <TripCell item={props.data!} index={0} baseURl={props.baseURl!} />

        <View style={$main}>
          <TextField
            multiline
            value={description}
            onChangeText={setDescription}
            containerStyle={$input}
            inputWrapperStyle={{ borderRadius: spacing.md }}
            labelTx="job.explainWorkDetails"
            placeholderTx="job.explainWorkDetailsPlaceholder"
            helperTx={error?.description}
            status={error?.description ? 'error' : undefined}
          />

          <View style={$imageHeading}>
            <Text
              size="xs"
              weight="semiBold"
              tx="job.proofWork"
              style={{ color: colors.textDim }}
            />
            {/* <Text
              size="xxs"
              tx="job.maxphotos"
              style={{ color: colors.textDim }}
            /> */}
          </View>

          <View style={$uploadRow}>
            <TouchableOpacity
              style={$photoUpload}
              onPress={() => setImagePickerModal(true)}
            >
              <Image source={images.camera} />
              <Text
                size="xxs"
                tx="job.addPhoto"
                style={{ color: colors.textDim }}
              />
            </TouchableOpacity>

            {selectedImages.map((image, index) => (
              <TouchableOpacity
                key={index}
                style={$imageBox}
                onPress={() => removeImage(index)}
              >
                <Image
                  source={{ uri: image.uri ?? '' }}
                  style={$selectedImage}
                />
                <View style={$removeButton}>
                  <Text text="✕" size="xs" style={$redText} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
          {error.images && (
            <Text
              preset="formHelper"
              tx={error.images}
              style={$redText}
            />
          )}

          <View style={$paymentProccess}>
            <Image
              source={images.infoIcon}
              style={{ marginTop: spacing.xxs }}
            />
            <View style={$flexShrink}>
              <Text
                size="sm"
                weight="semiBold"
                style={$darkRedText}
                tx="job.paymentProcess"
              />
              <Text
                size="xxs"
                style={$darkRedText}
                tx="job.paymentProcessDescription"
              />
            </View>
          </View>
        </View>
      </Screen>
      <Button
        tx="job.submitWorkLabel"
        onPress={validate}
        style={[$buttonStyle, { marginBottom: insets.bottom + spacing.sm }]}
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

const $container: ViewStyle = {
  flexGrow: 1,
};

const $main: ViewStyle = {
  margin: spacing.md,
};

const $input: ViewStyle = {
  marginBottom: spacing.sm,
};

const $imageHeading: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
};

const $uploadRow: ViewStyle = {
  flex: 1,
  gap: spacing.sm,
  flexWrap: 'wrap',
  flexDirection: 'row',
  alignItems: 'center',
  marginTop: spacing.xs,
};

const $imageBox: ViewStyle = {
  width: 90,
  height: 90,
  overflow: 'hidden',
  borderRadius: spacing.xs,
  backgroundColor: colors.palette.borderColor,
};

const $selectedImage: ImageStyle = {
  width: '100%',
  height: '100%',
  resizeMode: 'cover',
};

const $photoUpload: ViewStyle = {
  width: 90,
  height: 90,
  borderWidth: 1,
  gap: spacing.xxs,
  alignItems: 'center',
  borderStyle: 'dashed',
  justifyContent: 'center',
  borderRadius: spacing.xs,
};

const $removeButton: ViewStyle = {
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
};

const $redText: TextStyle = {
  color: colors.palette.red,
};

const $paymentProccess: ViewStyle = {
  gap: spacing.sm,
  padding: spacing.md,
  flexDirection: 'row',
  borderRadius: spacing.md,
  marginVertical: spacing.md,
  backgroundColor: colors.palette.lightYellow,
};

const $flexShrink: ViewStyle = {
  flexShrink: 1,
};

const $darkRedText: TextStyle = {
  color: colors.error,
};

const $buttonStyle: ViewStyle = {
  marginHorizontal: spacing.md,
};

const mapStateToProps = (state: RootState) => ({
  data: state.home.jobDetail,
  baseURl: state.setting.basic?.base_url,
  loading: state.home.submitJobLoading,
});

const mapDispatch = {
  submit: (params: FormData) => submitJob(params),
};

const connector = connect(mapStateToProps, mapDispatch);

export const SubmitWorkScreen = connector(SubmitWork);
