import { Button, Screen, Text } from '../components';
import { Image, TextStyle, View, ViewStyle } from 'react-native';
import React, { FC } from 'react';
import { colors, images, spacing } from '../theme';

import { AuthStackScreenProps } from '../navigators';

type Props = AuthStackScreenProps<'CommonSucess'>;

export type CommonSucessParams = {
  from: 'resetPassword' | 'faceVerification';
};

const CommonSucess: FC<Props> = props => {
  const { from } = props.route.params;
  const onPress = () => {
    if (from === 'resetPassword') {
      props.navigation.replace('Login');
    } else {
      props.navigation.goBack();
    }
  };
  return (
    <>
      <Screen
        preset="auto"
        safeAreaEdges={['top', 'bottom']}
        contentContainerStyle={$container}
      >
        <View style={$main}>
          <Image source={images.successTick} />
          <Text
            size="md"
            weight="semiBold"
            style={$textCenter}
            tx={
              from === 'resetPassword'
                ? 'resetPassword.passwordUpdated'
                : 'document.faceCaptured'
            }
          />
          <Text
            size="sm"
            tx={
              from === 'resetPassword'
                ? 'resetPassword.passwordUpdatedDesc'
                : 'document.faceCapturedDescription'
            }
            style={$dimText}
          />
        </View>
        <Button
          tx={
            from === 'resetPassword' ? 'resetPassword.backLogin' : 'common.next'
          }
          style={$buttonStyle}
          onPress={onPress}
        />
      </Screen>
    </>
  );
};

const $container: ViewStyle = {
  flexGrow: 1,
};

const $main: ViewStyle = {
  flex: 1,
  gap: spacing.md,
  alignItems: 'center',
  marginTop: spacing.lg,
  marginHorizontal: spacing.md,
};

const $textCenter: TextStyle = {
  textAlign: 'center',
  marginHorizontal: spacing.lg,
};

const $dimText: TextStyle = {
  textAlign: 'center',
  color: colors.textDim,
  marginHorizontal: spacing.lg,
};

const $buttonStyle: ViewStyle = {
  borderRadius: spacing.xs,
  marginVertical: spacing.lg,
  marginHorizontal: spacing.md,
};

export const CommonSucessScreen = CommonSucess;
