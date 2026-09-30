import { useContext } from 'react';
import type {
  IOSNativeProps,
  AndroidNativeProps,
  WindowsNativeProps,
} from '@react-native-community/datetimepicker';

export type AppDatePickerProps = IOSNativeProps | AndroidNativeProps | WindowsNativeProps;
import { DatePickerContext } from './DatePickerContext';

export const useDatePicker = () => useContext(DatePickerContext);
