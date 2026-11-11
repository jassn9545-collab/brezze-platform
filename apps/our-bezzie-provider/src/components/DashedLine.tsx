import React, {FC, useMemo, useState} from 'react';
import {StyleProp, ViewStyle} from 'react-native';
import {StyleSheet, View} from 'react-native';

export interface DashedLineProps {
  axis?: 'horizontal' | 'vertical';
  dashColor?: string;
  dashGap?: number;
  dashLength?: number;
  dashStyle?: StyleProp<ViewStyle>;
  dashThickness?: number;
  style?: StyleProp<ViewStyle>;
}

export const DashedLine: FC<DashedLineProps> = ({
  axis = 'horizontal',
  dashGap = 2,
  dashLength = 4,
  dashThickness = 2,
  dashColor = '#000',
  dashStyle,
  style = {flex: 1, alignItems: 'center'},
}) => {
  const [lineLength, setLineLength] = useState(0);
  const isRow = axis === 'horizontal';
  const numOfDashes = Math.ceil(lineLength / (dashGap + dashLength));

  const dashStyles = useMemo(
    () => ({
      width: isRow ? dashLength : dashThickness,
      height: isRow ? dashThickness : dashLength,
      marginRight: isRow ? dashGap : 0,
      marginBottom: isRow ? 0 : dashGap,
      backgroundColor: dashColor,
    }),
    [dashColor, dashGap, dashLength, dashThickness, isRow],
  );

  return (
    <View
      onLayout={event => {
        if (lineLength > 0) {
          return;
        }
        const {width, height} = event.nativeEvent.layout;
        setLineLength(isRow ? width : height);
      }}
      style={[style, isRow ? styles.row : styles.column]}>
      {[...Array(numOfDashes)].map((_, i) => {
        return <View key={i} style={[dashStyles, dashStyle]} />;
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
  },
  column: {
    flexDirection: 'column',
  },
});
