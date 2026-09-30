import {
  Pressable,
  PressableProps,
  PressableStateCallbackType,
  StyleProp,
  TextStyle,
  ViewStyle,
} from 'react-native';
import React, { ComponentType } from 'react';
import { Text, TextProps } from './Text';
import { colors, spacing, typography } from '../theme';

type Presets = keyof typeof $viewPresets;

export interface ButtonAccessoryProps {
  style: StyleProp<any>;
  pressableState: PressableStateCallbackType;
}

export interface ButtonProps extends PressableProps {
  /**
   * Text which is looked up via i18n.
   */
  tx?: TextProps['tx'];
  /**
   * The text to display if not using `tx` or nested components.
   */
  text?: TextProps['text'];
  /**
   * Optional options to pass to i18n. Useful for interpolation
   * as well as explicitly setting locale or translation fallbacks.
   */
  txOptions?: TextProps['txOptions'];
  /**
   * An optional style override useful for padding & margin.
   */
  style?: StyleProp<ViewStyle>;
  /**
   * An optional style override for the "pressed" state.
   */
  pressedStyle?: StyleProp<ViewStyle>;
  /**
   * An optional style override for the button text.
   */
  textStyle?: StyleProp<TextStyle>;
  /**
   * An optional style override for the button text when in the "pressed" state.
   */
  pressedTextStyle?: StyleProp<TextStyle>;
  /**
   * One of the different types of button presets.
   */
  preset?: Presets;
  /**
   * An optional component to render on the right side of the text.
   * Example: `RightAccessory={(props) => <View {...props} />}`
   */
  RightAccessory?: ComponentType<ButtonAccessoryProps>;
  /**
   * An optional component to render on the left side of the text.
   * Example: `LeftAccessory={(props) => <View {...props} />}`
   */
  LeftAccessory?: ComponentType<ButtonAccessoryProps>;
  /**
   * Children components.
   */
  children?: React.ReactNode;
}

/**
 * A component that allows users to take actions and make choices.
 * Wraps the Text component with a Pressable component.
 *
 * - [Documentation and Examples](https://github.com/infinitered/ignite/blob/master/docs/Components-Button.md)
 */
export function Button(props: ButtonProps) {
  const {
    tx,
    text,
    txOptions,
    style: $viewStyleOverride,
    pressedStyle: $pressedViewStyleOverride,
    textStyle: $textStyleOverride,
    pressedTextStyle: $pressedTextStyleOverride,
    children,
    RightAccessory,
    LeftAccessory,
    ...rest
  } = props;

  const preset: Presets = $viewPresets[props.preset ?? 'default']
    ? props.preset ?? 'default'
    : 'default';
  function $viewStyle({ pressed }: { pressed: boolean }) {
    return [
      $viewPresets[preset],
      $viewStyleOverride,
      !!pressed && [$pressedViewPresets[preset], $pressedViewStyleOverride],
    ];
  }
  function $textStyle({ pressed }: { pressed: boolean }) {
    return [
      $textPresets[preset],
      $textStyleOverride,
      !!pressed && [$pressedTextPresets[preset], $pressedTextStyleOverride],
    ];
  }

  return (
    <Pressable style={$viewStyle} accessibilityRole="button" {...rest}>
      {state => (
        <>
          {!!LeftAccessory && (
            <LeftAccessory style={$leftAccessoryStyle} pressableState={state} />
          )}

          <Text
            tx={tx}
            text={text}
            txOptions={txOptions}
            style={$textStyle(state)}
          >
            {children}
          </Text>

          {!!RightAccessory && (
            <RightAccessory
              style={$rightAccessoryStyle}
              pressableState={state}
            />
          )}
        </>
      )}
    </Pressable>
  );
}

const $baseViewStyle: ViewStyle = {
  minHeight: 56,
  borderRadius: spacing.xxs,
  justifyContent: 'center',
  alignItems: 'center',
  flexDirection: 'row',
  paddingVertical: spacing.sm,
  paddingHorizontal: spacing.sm,
  overflow: 'hidden',
};

const $baseTextStyle: TextStyle = {
  fontSize: 18,
  lineHeight: 27,
  fontFamily: typography.primary.bold,
  textAlign: 'center',
  flexShrink: 1,
  flexGrow: 0,
  zIndex: 2,
  color: colors.palette.white,
};

const $rightAccessoryStyle: ViewStyle = { marginStart: spacing.xs, zIndex: 1 };
const $leftAccessoryStyle: ViewStyle = { marginEnd: spacing.xs, zIndex: 1 };

const $viewPresets = {
  default: [
    $baseViewStyle,
    { backgroundColor: colors.primary },
  ] as StyleProp<ViewStyle>,

  outline: [
    $baseViewStyle,
    {
      backgroundColor: colors.transparent,
      borderWidth: 0.6,
      borderColor: colors.primary,
    },
  ] as StyleProp<ViewStyle>,

  filled: [
    $baseViewStyle,
    { backgroundColor: colors.primary },
  ] as StyleProp<ViewStyle>,

  reversed: [
    $baseViewStyle,
    { backgroundColor: colors.palette.lightRed },
  ] as StyleProp<ViewStyle>,

  plus: [
    $baseViewStyle,
    {
      borderRadius: 6,
      backgroundColor: colors.palette.white,
    },
  ] as StyleProp<ViewStyle>,
};

const $textPresets: Record<Presets, StyleProp<TextStyle>> = {
  default: $baseTextStyle,
  outline: [$baseTextStyle, { color: colors.primary }],
  filled: $baseTextStyle,
  reversed: [$baseTextStyle, { color: colors.palette.red }],
  plus: [
    $baseTextStyle,
    {
      color: colors.palette.black,
    },
  ],
};

const $pressedViewPresets: Record<Presets, StyleProp<ViewStyle>> = {
  default: { opacity: 0.7 },
  outline: { backgroundColor: colors.separator },
  filled: { backgroundColor: colors.primary },
  reversed: { backgroundColor: colors.palette.lightRed },
  plus: { opacity: 0.7 },
};

const $pressedTextPresets: Record<Presets, StyleProp<TextStyle>> = {
  default: { opacity: 0.9 },
  outline: { opacity: 0.9 },
  filled: { opacity: 0.9 },
  reversed: { opacity: 0.9 },
  plus: { opacity: 0.8 },
};
