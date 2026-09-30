import {
  Animated,
  Image,
  ImageProps,
  ImageSourcePropType,
  TouchableWithoutFeedback,
  View,
  ViewStyle,
} from 'react-native';
import React, {
  PropsWithChildren,
  useCallback,
  useEffect,
  useState,
} from 'react';

import {hitSlop} from '../utils/util';

export interface AnimatedIconProps extends PropsWithChildren {
  source?: ImageSourcePropType;
  onPress?: () => void;
  style?: ViewStyle;
  loading?: boolean;
  animationPreset?: 'pulse' | 'rotate';
  disabled?: boolean;
  imageProps?: ImageProps;
}

const AnimatedIcon: React.FC<AnimatedIconProps> = ({
  source,
  onPress,
  style,
  loading,
  animationPreset = 'pulse',
  disabled,
  children,
  imageProps,
}) => {
  const [scale] = useState(new Animated.Value(1));
  const [rotation] = useState(new Animated.Value(0));

  useEffect(() => {
    if (loading) {
      let animationSequence;
      if (animationPreset === 'rotate') {
        animationSequence = Animated.loop(
          Animated.sequence([
            Animated.timing(rotation, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.delay(500),
          ]),
        );
      } else if (animationPreset === 'pulse') {
        animationSequence = Animated.loop(
          Animated.sequence([
            Animated.timing(scale, {
              toValue: 0.8,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.timing(scale, {
              toValue: 1,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.delay(500),
          ]),
        );
      }

      animationSequence?.start();
    } else {
      if (animationPreset === 'pulse') {
        scale.setValue(1);
      } else if (animationPreset === 'rotate') {
        rotation.setValue(0);
      }
    }
  }, [loading, animationPreset, rotation, scale]);

  const interpolatedRotation = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.8,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const getMiddleView = useCallback(() => {
    if (children) {
      return children;
    }
    return <Image source={source} {...imageProps} />;
  }, [children, source, imageProps]);

  return (
    <View style={style}>
      {(source || children) && (
        <TouchableWithoutFeedback
          onPress={onPress}
          hitSlop={hitSlop}
          disabled={disabled || !onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}>
          <Animated.View style={{transform: [{scale}]}}>
            {animationPreset === 'rotate' ? (
              <Animated.View
                style={{transform: [{rotate: interpolatedRotation}]}}>
                {getMiddleView()}
              </Animated.View>
            ) : (
              getMiddleView()
            )}
          </Animated.View>
        </TouchableWithoutFeedback>
      )}
    </View>
  );
};

export default AnimatedIcon;
