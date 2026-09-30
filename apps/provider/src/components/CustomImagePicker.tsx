import Animated, { SlideInDown } from 'react-native-reanimated';
import {
  ImagePickerResponse,
  launchCamera,
  launchImageLibrary,
} from 'react-native-image-picker';
import {
  Modal,
  Pressable,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { colors, spacing } from '../theme';

import React from 'react';
import { Text } from './Text';
import { cameraPermission } from '../utils/util';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type CustomImagePickerProps = {
  imagePickerModal: boolean;
  frontCamera?: boolean;
  onDismiss: () => void;
  callback: (image: ImagePickerResponse) => void;
};

export const CustomImagePicker = ({
  imagePickerModal,
  frontCamera,
  onDismiss,
  callback,
}: CustomImagePickerProps) => {
  const insets = useSafeAreaInsets();
  const onCameraOpen = async () => {
    await cameraPermission();
    launchCamera({
      mediaType: 'photo',
      ...(frontCamera && { cameraType: 'front' }),
      maxWidth: 512,
      maxHeight: 512,
      quality: 0.6,
    })
      .then(image => {
        callback(image);

        onDismiss();
      })
      .catch(() => {
        onDismiss();
      });
  };

  const onGalleryOpen = () => {
    launchImageLibrary({
      mediaType: 'photo',
      maxWidth: 512,
      maxHeight: 512,
      quality: 0.6,
    })
      .then(image => {
        callback(image);

        onDismiss();
      })
      .catch(() => {
        onDismiss();
      });
  };

  return (
    <Modal
      visible={imagePickerModal}
      transparent={true}
      animationType={'fade'}
      onRequestClose={() => onDismiss()}
      statusBarTranslucent
    >
      <View
        style={[
          styles.modelSafeView,
          {
            marginTop: insets.top,
            marginBottom: insets.bottom,
            marginStart: insets.left,
            marginEnd: insets.right,
          },
        ]}
      >
        <TouchableWithoutFeedback onPress={() => onDismiss()}>
          <Animated.View
            entering={SlideInDown.duration(300)}
            style={styles.modelViewContainer}
          >
            <View style={styles.modelView}>
              <Pressable
                onPress={onCameraOpen}
                style={({ pressed }) => [
                  styles.modelTouchView,
                  {
                    backgroundColor: pressed
                      ? colors.primary
                      : colors.background,
                  },
                ]}
              >
                <Text tx="common.camera" preset="subheading" />
              </Pressable>
              <View style={styles.seperator} />
              <Pressable
                onPress={onGalleryOpen}
                style={({ pressed }) => [
                  styles.modelTouchView,
                  {
                    backgroundColor: pressed
                      ? colors.primary
                      : colors.background,
                  },
                ]}
              >
                <Text tx="common.gallery" preset="subheading" />
              </Pressable>
            </View>
            <Pressable
              onPress={() => onDismiss()}
              style={({ pressed }) => [
                styles.modelCancelView,
                {
                  backgroundColor: pressed
                    ? colors.errorBackground
                    : colors.palette.white,
                },
              ]}
            >
              <Text
                tx="common.cancel"
                preset="subheading"
                style={{ color: colors.error }}
              />
            </Pressable>
          </Animated.View>
        </TouchableWithoutFeedback>
      </View>
    </Modal>
  );
};

export const styles = StyleSheet.create({
  modelSafeView: {
    flex: 1,
    backgroundColor: colors.palette.overlay20,
  },
  modelViewContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modelView: {
    marginHorizontal: spacing.md,
    backgroundColor: 'white',
    borderRadius: spacing.md,
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  modelTouchView: {
    height: 50,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modelCancelView: {
    marginHorizontal: spacing.md,
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 10,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  seperator: {
    height: 1,
    borderRadius: 1,
    marginHorizontal: spacing.md,
    backgroundColor: colors.separator,
  },
});
