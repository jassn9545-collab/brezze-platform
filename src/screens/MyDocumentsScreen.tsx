import {
  AuthHeader,
  Button,
  CustomImagePicker,
  Loader,
  Screen,
  Text,
} from '../components';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import React, { FC, useState } from 'react';
import { colors, images, spacing } from '../theme';

import { AuthStackScreenProps } from '../navigators';
import { translate, TxKeyPath } from '../i18n';
import { ImagePickerResponse } from 'react-native-image-picker';
import { RootState } from '../store';
import { connect, ConnectedProps } from 'react-redux';
import { uploadProfilePhoto } from '../slices/auth.slice';

type NavigationProps = AuthStackScreenProps<'MyDocuments'>;
type StoreProps = ConnectedProps<typeof connector>;
type Props = NavigationProps & StoreProps;

interface DocumentTypes {
  title: TxKeyPath;
  description: TxKeyPath;
  screen?: 'UploadUserDetail' | 'UploadDocument';
  status: boolean;
}

const MyDocuments: FC<Props> = props => {
  const [imagePickerVisible, setImagePickerVisible] = useState(false);
  const documentList: DocumentTypes[] = [
    {
      title: 'document.basicDetailsProvide',
      description: 'document.basicDetailsProvideDesc',
      screen: 'UploadUserDetail',
      status: !!props.myProfile?.basic_info,
    },
    {
      title: 'document.faceVerification',
      description: 'document.faceVerificationDesc',
      status: !!props.myProfile?.profile_pic,
    },
    {
      title: 'document.IDVerification',
      description: 'document.IDVerificationDesc',
      screen: 'UploadDocument',
      status: !!props.myProfile?.proof,
    },
  ];

  const uploadImage = (image: ImagePickerResponse) => {
    if ((image.assets?.length ?? 0) > 0) {
      var body = new FormData();
      body.append('profile_image', {
        uri: image.assets?.[0].uri,
        name: image.assets?.[0].fileName,
        type: image.assets?.[0].type,
      });
      props.uploadProfilePhoto(body);
    }
  };

  const onPressDetail = (data: DocumentTypes) => {
    if (data.status) {
      return;
    }

    if (data.screen) {
      props.navigation.navigate(data.screen);
    } else {
      setImagePickerVisible(true);
    }
  };

  const validate = () => {
    if (documentList.some(item => !item.status)) {
      toast.show(translate('document.required'), { type: 'warning' });
      return;
    }
    props.navigation.replace('CommonSucess', {
      from: 'documentVerification',
    });
  };

  return (
    <>
      <Screen
        preset="auto"
        contentContainerStyle={styles.containerStyle}
        safeAreaEdges={['top', 'bottom']}
      >
        <AuthHeader tx="document.heading" desc="document.description" />
        <View style={styles.mainView}>
          <Text
            style={styles.listHeading}
            size="sm"
            weight="semiBold"
            tx="document.documentRequirement"
          />
          {documentList?.map((item, index) => (
            <TouchableOpacity
              key={index}
              activeOpacity={0.9}
              style={styles.card}
              onPress={() => onPressDetail(item)}
            >
              <Image source={images.smileIcon} />
              <View style={styles.cardTextWrapper}>
                <Text
                  size="sm"
                  weight="semiBold"
                  tx={item.title}
                  style={{ color: colors.primary }}
                />
                <Text
                  size="sm"
                  tx={item.description}
                  style={{ color: colors.textDim }}
                />
              </View>
              {item.status && (
                <Image
                  source={images.tickIcon}
                  style={{ marginTop: spacing.xxs }}
                />
              )}
            </TouchableOpacity>
          ))}

          <View style={styles.flex} />
          <Text size="xs" tx="document.footerText" style={styles.footerText} />
          <Button
            tx="document.submit"
            style={styles.buttonStyle}
            onPress={validate}
          />
        </View>
      </Screen>
      <CustomImagePicker
        frontCamera
        callback={uploadImage}
        imagePickerModal={imagePickerVisible}
        onDismiss={() => setImagePickerVisible(false)}
      />
      <Loader loading={props.photoLoading === 'loading'} />
    </>
  );
};

const styles = StyleSheet.create({
  containerStyle: {
    flexGrow: 1,
  },
  mainView: {
    flex: 1,
    marginHorizontal: spacing.md,
  },
  listHeading: {
    marginVertical: spacing.md,
  },
  card: {
    gap: spacing.sm,
    borderWidth: 0.5,
    padding: spacing.sm,
    flexDirection: 'row',
    marginBottom: spacing.md,
    borderRadius: spacing.xs,
    borderColor: colors.palette.borderColor,
  },
  cardTextWrapper: {
    flexShrink: 1,
  },
  flex: {
    flex: 1,
  },
  footerText: {
    textAlign: 'center',
    color: colors.textDim,
    marginHorizontal: spacing.lg,
  },
  buttonStyle: {
    borderRadius: spacing.xs,
    marginVertical: spacing.lg,
  },
});

const mapStateToProps = (state: RootState) => ({
  photoLoading: state.auth.uploadProfilePhotoLoading,
  myProfile: state.auth.myProfile,
});

const mapDispatch = {
  uploadProfilePhoto: (params: FormData) => uploadProfilePhoto(params),
};

const connector = connect(mapStateToProps, mapDispatch);

export const MyDocumentsScreen = connector(MyDocuments);
