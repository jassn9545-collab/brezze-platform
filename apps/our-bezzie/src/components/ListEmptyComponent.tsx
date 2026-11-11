import { Image, StyleProp, StyleSheet, TextStyle, View, ViewStyle } from 'react-native';
import { Text } from './Text';
import { FC } from 'react';
import { spacing } from '../theme';
import { TxKeyPath } from '../i18n';

const emptyBox = require('../assets/images/empty-box.png');

type ListEmptyComponentProps = {
  tx?: TxKeyPath;
  text?: string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};
const ListEmptyComponent: FC<ListEmptyComponentProps> = props => {
  return (
    <View style={[styles.root, props.style]}>
      <Image source={emptyBox} />
      <Text
        tx={props.tx}
        text={props.text}
        style={[styles.text, props.textStyle]}
        size="md"
        weight="medium"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    minHeight: 320,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
  },
  text: {
    textAlign: 'center',
  },
});

export default ListEmptyComponent;
