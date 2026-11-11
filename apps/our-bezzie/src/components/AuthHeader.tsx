import { View, TouchableOpacity, Image, ViewStyle } from 'react-native';
import React from 'react';
import { colors, images, spacing } from '../theme';
import { Text } from './Text';
import { useNavigation } from '@react-navigation/native';
import { TxKeyPath } from '../i18n';

interface HeaderProps {
  tx?: TxKeyPath;
  desc?: TxKeyPath;
  descValue?: string;
  hideBackButton?: boolean;
}

export const AuthHeader: React.FC<HeaderProps> = ({
  tx,
  desc,
  descValue,
  hideBackButton = false,
}) => {
  const { goBack } = useNavigation();
  return (
    <View style={$marginHorizontal}>
      {!hideBackButton && (
        <TouchableOpacity onPress={goBack} style={$backArrow}>
          <Image source={images.leftArrow} />
        </TouchableOpacity>
      )}
      <Text tx={tx} weight="medium" size="xl" />
      {desc && (
        <Text
          tx={desc}
          weight="light"
          size="sm"
          {...(descValue && {
            txOptions: {
              value: descValue,
            },
          })}
        />
      )}
    </View>
  );
};

const $marginHorizontal: ViewStyle = {
  marginTop: spacing.xs,
  marginHorizontal: spacing.md,
};

const $backArrow: ViewStyle = {
  padding: spacing.md,
  alignSelf: 'flex-start',
  marginBottom: spacing.lg,
  borderRadius: spacing.xl,
  backgroundColor: colors.palette.offWhite,
};

export default AuthHeader;
