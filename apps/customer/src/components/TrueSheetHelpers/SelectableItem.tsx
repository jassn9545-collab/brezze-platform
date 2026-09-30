import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Text } from '../Text';
import { useState } from 'react';
import { TOptions } from 'i18next';
import { TxKeyPath } from '../../i18n';
import { colors, spacing } from '../../theme';

type SelectableItemProps = {
  onPress: () => void;
  selected: boolean;
  tx?: TxKeyPath;
  text?: string;
  txOptions?: TOptions;
};

export const SelectableItem = (props: SelectableItemProps) => {
  const [pressed, setPressed] = useState(false);
  const tap = Gesture.Tap()
    .numberOfTaps(1)
    .maxDuration(1000)
    .runOnJS(true)
    .onBegin(() => setPressed(true))
    .onFinalize(() => setPressed(false))
    .onEnd(() => {
      props.onPress();
    });
  return (
    <GestureDetector gesture={tap}>
      <View
        style={[
          styles.item,
          props.selected && styles.selected,
          pressed && styles.pressed,
        ]}
      >
        <Text tx={props.tx} text={props.text} txOptions={props.txOptions} />
      </View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  item: {
    alignItems: 'flex-start',
    padding: spacing.sm,
    marginHorizontal: spacing.xs,
    borderBottomColor: colors.palette.gray,
    borderBottomWidth: StyleSheet.hairlineWidth,
    backgroundColor: colors.background,
  },
  selected: {
    borderRadius: spacing.xs,
    backgroundColor: colors.primaryDimmed,
  },
  pressed: {
    opacity: 0.2,
  },
});
