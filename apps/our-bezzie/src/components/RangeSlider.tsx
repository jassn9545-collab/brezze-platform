import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Dimensions,
  StyleProp,
  ViewStyle,
  StyleSheet,
} from 'react-native';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import { Text } from './Text';
import { debounce } from '../utils/util';
import { colors, spacing } from '../theme';
import { Currency } from '../config/defaults';

const { width } = Dimensions.get('window');
const SLIDER_WIDTH = width - 35;

type RangeSliderProps = {
  min: number;
  max: number;
  step?: number;
  values?: [number, number];
  onValuesChange?: (range: { min: number; max: number }) => void;
  disableLeftMarker?: boolean;
  disableRightMarker?: boolean;
  hideMarkers?: boolean;
  hideLabel?: boolean;
  contentContainerStyle?: StyleProp<ViewStyle>;
};

const RangeSlider: React.FC<RangeSliderProps> = ({
  min,
  max,
  step = 1,
  values = [min, max],
  onValuesChange,
  disableLeftMarker = false,
  disableRightMarker = false,
  hideMarkers = false,
  hideLabel = false,
  contentContainerStyle,
}) => {
  const [sliderValues, setSliderValues] = useState<[number, number]>(values);
  // const [markerPositions, setMarkerPositions] = useState<{
  //   leftMarker: number;
  //   rightMarker: number;
  // }>({
  //   leftMarker: 0,
  //   rightMarker: 0,
  // });
  const ref = useRef<View>(null);

  const handleChange = (val: number[]) => {
    const range: [number, number] = [val[0], val[1]];
    setSliderValues(range);
    onValuesChange?.({
      min: range[0],
      max: range[1],
    });
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debounceChange = useMemo(() => debounce(handleChange, 100), []);
  // useEffect(() => {
  //   const sliderUsableWidth = SLIDER_WIDTH;

  //   const leftMarkerPercentage = (sliderValues[0] - min) / (max - min);
  //   const rightMarkerPercentage = (sliderValues[1] - min) / (max - min);

  //   const leftMarkerPosition = leftMarkerPercentage * sliderUsableWidth;
  //   const rightMarkerPosition = rightMarkerPercentage * sliderUsableWidth - 35;

  //   setMarkerPositions({
  //     leftMarker: leftMarkerPosition,
  //     rightMarker: rightMarkerPosition,
  //   });
  // }, [sliderValues, min, max]);

  // Memoized custom marker component to avoid re-creation on each render
  const renderCustomMarker = useCallback(
    () => <View style={hideMarkers ? styles.hiddenMarker : styles.mark} />,
    [hideMarkers],
  );

  return (
    <View ref={ref} style={[styles.container, contentContainerStyle]}>
      {!hideLabel && (
        <View style={styles.markerPositionContainer}>
          <View style={styles.markerThumb}>
            <Text weight='semiBold' text={Currency.sign + sliderValues[0]} />
          </View>
          <View style={styles.line} />
          <View style={styles.markerThumb}>
            <Text weight='semiBold' text={Currency.sign + sliderValues[1]} />
          </View>
        </View>
      )}

      <MultiSlider
        values={sliderValues}
        min={min}
        max={max}
        step={step}
        minMarkerOverlapDistance={50}
        sliderLength={SLIDER_WIDTH}
        onValuesChange={debounceChange}
        containerStyle={styles.sliderContainer}
        selectedStyle={{
          backgroundColor: colors.primary,
        }}
        unselectedStyle={{
          height: spacing.xxxs + 1,
          backgroundColor: colors.palette.gray,
        }}
        enabledOne={!disableLeftMarker}
        enabledTwo={!disableRightMarker}
        customMarker={renderCustomMarker}
      />
    </View>
  );
};

interface SliderProps {
  values: number[];
  min: number;
  max: number;
  onValuesChange?: (values: number[]) => void;
  contentContainerStyle?: StyleProp<ViewStyle>;
}
const Slider = ({
  values,
  min,
  max,
  onValuesChange,
  contentContainerStyle,
}: SliderProps) => {
  const [sliderValues, setSliderValues] = useState<number[]>(values);
  const ref = useRef<View>(null);
  const [markerPosition, setMarkerPosition] = useState<number>(0);
  const sliderOneValuesChange = (sliderValuesArray: number[]) => {
    setSliderValues(sliderValuesArray);
    onValuesChange?.(sliderValuesArray);
  };
  const debounceChange = useMemo(
    () => debounce(sliderOneValuesChange, 50),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useEffect(() => {
    if (ref.current) {
      ref.current.measure((_, __, ___, ____, pageX, _____) => {
        setMarkerPosition(pageX);
      });
    }
  }, [sliderValues]);

  const renderCustomMarker = useCallback(
    () => <View ref={ref} style={styles.singleMarkerStyle} />,
    [ref],
  );

  return (
    <View style={[styles.container, contentContainerStyle]}>
      <MultiSlider
        values={sliderValues}
        min={min}
        max={max}
        sliderLength={SLIDER_WIDTH}
        onValuesChange={debounceChange}
        customMarker={renderCustomMarker}
        selectedStyle={{
          backgroundColor: colors.primary,
        }}
        unselectedStyle={{
          backgroundColor: colors.palette.grayLight2,
        }}
      />
      <View style={styles.markerPositionContainer}>
        <Text
          text={`${sliderValues[0] / 10}km`}
          style={[
            styles.markerPositionText,
            {
              left:
                width * 0.8 < markerPosition
                  ? markerPosition - 20
                  : markerPosition,
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  track: {
    width: SLIDER_WIDTH,
    height: 6,
    borderRadius: spacing.xxs,
    backgroundColor: colors.palette.offWhite,
  },
  canvas: {
    position: 'absolute',
    height: 6,
  },
  sliderContainer: {
    height: 40,
    marginTop: -15,
  },
  transparent: {
    backgroundColor: 'transparent',
  },
  hiddenMarker: {
    height: 0,
    width: 0,
  },
  labels: {
    width: SLIDER_WIDTH,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -10,
  },
  singleMarkerStyle: {
    width: 20,
    height: 20,
    backgroundColor: colors.palette.white,
    borderWidth: 6,
    borderColor: colors.primary,
    borderRadius: 15,
  },
  mark: {
    width: spacing.lg,
    height: spacing.lg,
    borderRadius: spacing.lg / 2,
    backgroundColor: colors.primary,
  },
  markerPositionText: {
    position: 'relative',
    padding: spacing.xxs,
    borderRadius: spacing.xs,
  },
  markerPositionTextLeft: {
    position: 'relative',
    padding: spacing.xxs,
    borderRadius: spacing.xs,
  },
  markerPositionTextRight: {
    position: 'relative',
    padding: spacing.xxs,
    borderRadius: spacing.xs,
  },
  markerPositionContainer: {
    flex: 1,
    gap: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  markerThumb: {
    flex: 1,
    marginTop: spacing.xs,
    borderRadius: spacing.sm,
    marginBottom: spacing.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.palette.offWhite2,
  },
  line: {
    height: 0.5,
    width: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: colors.textDim,
  },
});

export default RangeSlider;
export { Slider };
