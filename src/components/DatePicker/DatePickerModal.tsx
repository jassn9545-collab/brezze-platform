import {
  Platform,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { useMemo, useRef } from 'react';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { translate } from '../../i18n';
import { colors, spacing, typography } from '../../theme';
import { Button } from '../Button';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type Display =
  | 'default'
  | 'auto'
  | 'spinner'
  | 'clock'
  | 'calendar'
  | 'compact'
  | 'inline';

let supportedDisplay = Platform.select({
  android: ['default', 'clock', 'calendar', 'spinner'],
  ios: ['default', 'compact', 'inline', 'spinner'],
  default: ['default'],
});

type DatePickerModalProps = {
  value: Date;
  visible: boolean;
  display?: Display;
  maximumDate?: Date;
  minimumDate?: Date;
  mode?: 'date' | 'time';
  onDismiss: () => void;
  onChangeDate: (date?: Date) => void;
};

export const DatePickerModal = (props: DatePickerModalProps) => {
  const insets = useSafeAreaInsets();
  const dateRef = useRef<Date>(undefined);

  const pickerDisplay = useMemo(() => {
    let valid = supportedDisplay.includes(props.display ?? 'default');
    if (valid) {
      return props.display as any;
    } else if (Platform.OS === 'android' && props.display === 'auto') {
      return props.mode === 'date' ? 'calendar' : 'clock';
    } else if (props.mode === 'time') {
      return 'spinner';
    } else {
      return 'inline';
    }
  }, [props.display, props.mode]);

  const onChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      props.onDismiss();
      if (event.type === 'set') {
        props.onChangeDate(selectedDate);
      }
    } else {
      dateRef.current = selectedDate;
    }
  };

  return props.visible ? (
    <TouchableWithoutFeedback onPress={props.onDismiss}>
      <Animated.View entering={FadeIn} exiting={FadeOut} style={[styles.view, {paddingBottom: insets.bottom}]}>
        <TouchableWithoutFeedback>
          <View style={styles.picker}>
            <DateTimePicker
              {...props}
              onChange={onChange}
              style={styles.calender}
              display={pickerDisplay}
              // themeVariant={themeName}
              accentColor={colors.primary}
              positiveButton={{
                label: translate('common.ok'),
              }}
              negativeButton={{
                label: translate('common.cancel'),
              }}
            />
            {Platform.OS === 'ios' && (
              <View style={styles.buttons}>
                <Button
                  tx="common.cancel"
                  preset="plus"
                  style={styles.button}
                  onPress={props.onDismiss}
                  textStyle={styles.btnText}
                />
                <Button
                  tx="common.apply"
                  style={styles.button}
                  onPress={() => {
                    props.onChangeDate(dateRef.current ?? props.value);
                    props.onDismiss();
                  }}
                  textStyle={styles.btnText}
                />
              </View>
            )}
          </View>
        </TouchableWithoutFeedback>
      </Animated.View>
    </TouchableWithoutFeedback>
  ) : (
    <></>
  );
};

const styles = StyleSheet.create({
  view: {
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:
      Platform.OS === 'ios' ? colors.palette.overlay20 : colors.transparent,
  },
  calender: {
    alignItems: 'center',
    padding: spacing.sm,
    backgroundColor: colors.background,
    borderTopRightRadius: spacing.md,
    borderTopLeftRadius: spacing.md,
  },
  picker: {
    alignSelf: 'center',
  },
  buttons: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
    backgroundColor: colors.background,
    borderBottomRightRadius: spacing.md,
    borderBottomLeftRadius: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.palette.grayLight2,
    paddingVertical: spacing.xxs,
  },
  button: {
    flex: 1,
    borderRadius: spacing.lg,
    margin: spacing.xs,
    padding: spacing.xs,
  },
  btnText: {
    fontFamily: typography.primary.semiBold,
    fontWeight: '600',
    fontSize: spacing.md,
  },
});
