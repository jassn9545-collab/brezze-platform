import {
  Animated,
  ImageSourcePropType,
  ImageStyle,
  StyleProp,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import React, {useState} from 'react';

import {images} from '../theme';

const STAR_SIZE = 36;

export type StarProps = {
  starImage?: ImageSourcePropType;
  fill?: boolean;
  size?: number;
  selectedColor?: string;
  unSelectedColor?: string;
  isDisabled?: boolean;
  starStyle?: StyleProp<ImageStyle>;
  position?: number;
  starSelectedInPosition?: (position: number) => void;
};

const Star: React.FunctionComponent<StarProps> = ({
  starImage = images.star,
  selectedColor = '#F2D572',
  unSelectedColor = '#EBEBEB',
  ...props
}) => {
  const [selected, setSelected] = useState<boolean>(false);
  const springValue = new Animated.Value(1);

  const spring = () => {
    const {position, starSelectedInPosition} = props;

    springValue.setValue(1.2);

    Animated.spring(springValue, {
      toValue: 1,
      friction: 2,
      tension: 1,
      useNativeDriver: true,
    }).start();

    setSelected(!selected);

    starSelectedInPosition?.(position ?? 0);
  };

  const {fill, size, isDisabled, starStyle} = props;

  return (
    <TouchableOpacity activeOpacity={1} onPress={spring} disabled={isDisabled}>
      <Animated.Image
        source={starImage}
        style={[
          styles.starStyle,
          {
            tintColor: fill && selectedColor ? selectedColor : unSelectedColor,
            width: size || STAR_SIZE,
            height: size || STAR_SIZE,
            transform: [{scale: springValue}],
          },
          starStyle,
        ]}
      />
    </TouchableOpacity>
  );
};

export default Star;

const styles = StyleSheet.create({
  starStyle: {
    margin: 3,
  },
});
