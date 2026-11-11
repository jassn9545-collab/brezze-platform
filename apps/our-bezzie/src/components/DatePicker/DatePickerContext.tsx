import { createContext, FC, useState } from 'react';
import { Keyboard, StyleProp, ViewStyle } from 'react-native';
import { DatePickerModal, Display } from './DatePickerModal';

export type AppDatePickerProps = {
  value: Date;
  mode?: 'date' | 'time';
  maximumDate?: Date;
  minimumDate?: Date;
  display?: Display;
};

export type DatePickerContext = {
  date?: Date;
  open: (picker: AppDatePickerProps) => void;
};

export const DatePickerContext = createContext<DatePickerContext>({ open: () => {} });

type AppDatePickerProviderProps = {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export const AppDatePickerProvider: FC<AppDatePickerProviderProps> = ({ children }) => {
  const [date, setDate] = useState<Date>();
  const [props, setConfig] = useState<AppDatePickerProps>({ value: new Date() });
  const [show, setShow] = useState(false);

  const open = (options: AppDatePickerProps) => {
    Keyboard.dismiss();
    setConfig(options);
    setShow(true);
  };

  return (
    <DatePickerContext.Provider value={{ date, open }}>
      {children}
      <DatePickerModal
        {...props}
        visible={show}
        onChangeDate={setDate}
        onDismiss={() => setShow(false)}
      />
    </DatePickerContext.Provider>
  );
};
