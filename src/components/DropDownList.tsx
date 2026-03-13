import {
  Dimensions,
  FlatList,
  Image,
  Insets,
  Platform,
  StyleSheet,
  View,
} from 'react-native';
import { SheetSize, TrueSheet } from '@lodev09/react-native-true-sheet';
import {
  FC,
  forwardRef,
  Ref,
  RefObject,
  useImperativeHandle,
  useRef,
} from 'react';
import { TextFieldAccessoryProps } from './TextField';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { TxKeyPath } from '../i18n';
import { Text } from './Text';
import { colors, images, spacing } from '../theme';
import { TOptions } from 'i18next';
import { SelectableItem } from './TrueSheetHelpers/SelectableItem';

const screenHeight = Dimensions.get('window').height;

export type DataType = {
  id: string;
  name?: TxKeyPath;
  title?: string;
  txOptions?: TOptions;
};

export type DropDownListProps = {
  ref: Ref<TrueSheet>;
  title?: TxKeyPath;
  data: DataType[];
  sizes?: SheetSize[];
  onSelect: (item: DataType) => void;
  selectedId?: string;
};

const headerHeight = 70;
const itemHeight = 52;
export const sizeForSheet = (
  length: number,
  insets: Insets = { bottom: 0, top: 0 },
) => {
  const platformExtra = Platform.OS === 'android' ? insets.bottom ?? 0 : 0;
  const heightMain = length * itemHeight + headerHeight + platformExtra;
  const safeHeight = screenHeight - (insets.top ?? 0);
  return [heightMain > safeHeight ? safeHeight : heightMain];
};

export const DropDownList = forwardRef<TrueSheet, DropDownListProps>(function (
  props,
  sheetRef,
) {
  const ref = useRef<TrueSheet>(null);
  const scrollRef = useRef<FlatList<DataType>>(null);
  useImperativeHandle(sheetRef, () => ref.current as TrueSheet);
  const sizes = props.sizes || ['auto', 'large'];

  return (
    <TrueSheet
      ref={ref}
      edgeToEdge
      sizes={sizes}
      cornerRadius={24}
      style={styles.bottomSheet}
      scrollRef={scrollRef as RefObject<any>}
      backgroundColor={colors.background}
    >
      <GestureHandlerRootView style={styles.gesture}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalHeaderText} tx={props.title} />
        </View>
        <FlatList
          ref={scrollRef}
          data={props.data}
          nestedScrollEnabled
          contentContainerStyle={styles.container}
          renderItem={({ item }) => (
            <SelectableItem
              onPress={() => {
                ref.current?.dismiss();
                props.onSelect(item);
              }}
              selected={props.selectedId === item.id}
              tx={item.name}
              text={item.title}
              txOptions={item.txOptions}
            />
          )}
        />
      </GestureHandlerRootView>
    </TrueSheet>
  );
});

export const DropDownRightAccessory: FC<TextFieldAccessoryProps> = props => {
  return (
    <View style={[props.style, styles.dropDown]}>
      <Image
        source={images.rightArrow}
        style={{
          transform: [{ rotate: '90deg' }],
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  bottomSheet: {
    backgroundColor: colors.background,
    borderTopEndRadius: 24,
    borderTopStartRadius: 24,
  },
  modalHeader: {
    zIndex: 10,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomColor: colors.palette.grayLight,
    borderBottomWidth: StyleSheet.hairlineWidth,
    backgroundColor: colors.background,
  },
  modalHeaderText: {
    textAlign: 'center',
  },
  gesture: { flexGrow: 1 },
  container: {
    paddingTop: Platform.OS === 'ios' ? 69 : 4,
  },
  dropDown: {
    marginStart: spacing.sm,
  },
});
