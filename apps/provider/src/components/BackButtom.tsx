import {
  Image,
  ImageSourcePropType,
  StyleProp,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { colors, spacing } from '../theme';

import React from 'react';
import { Text } from '.';
import { TxKeyPath } from '../i18n';
import { images } from '../theme/images';
import { useNavigation } from '@react-navigation/native';

export type BackButtomProps = {
  style?: StyleProp<ViewStyle>;
  heading?: string;
  headingTx?: TxKeyPath;
  arrow?: ImageSourcePropType;
  arrowColor?: string;
  onBackPress?: () => void;
  // Extras
  rightComponent?: React.ReactNode;
};

export const BackButtom = ({
  heading,
  headingTx,
  style = { paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
  arrow,
  arrowColor,
  onBackPress,
  rightComponent,
}: BackButtomProps) => {
  const navigation = useNavigation();

  return (
    <View style={[$container, style]}>
      <TouchableOpacity
        onPress={onBackPress ?? (() => navigation.goBack())}
        style={$wrapArrow}
        accessibilityRole="button"
        accessibilityLabel="Back"
      >
        <Image
          source={arrow ? arrow : images.leftArrow}
          tintColor={arrowColor ? arrowColor : colors.palette.black}
        />
      </TouchableOpacity>
      {headingTx ? (
        <Text tx={headingTx} preset="heading" size="lg" style={$heading} />
      ) : heading ? (
        <Text text={heading} preset="heading" size="lg" style={$heading} />
      ) : null}
      <View style={$side}>{rightComponent}</View>
    </View>
  );
};

const $container: ViewStyle = {
  gap: spacing.sm,
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: colors.background,
};
const $wrapArrow: ViewStyle = {
  alignSelf: 'flex-end',
  borderRadius: spacing.xl,
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.sm + 2,
  backgroundColor: colors.palette.offWhite2,
};

const $heading: TextStyle = {
  flex: 1,
  textAlign: 'center',
};

const $side: ViewStyle = {
  width: 45,
  alignItems: 'flex-end',
};
