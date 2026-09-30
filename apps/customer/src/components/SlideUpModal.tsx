import {
  Animated,
  Modal,
  TouchableWithoutFeedback,
  View,
  ViewStyle,
} from 'react-native';
import React, {useRef} from 'react';

import {colors} from '../theme';

type Props = {
  visible: boolean;
  onClose?: () => void;
  children?: React.ReactNode;
};

export const SlideUpModal = ({visible, onClose, children}: Props) => {
  const translateY = useRef(new Animated.Value(500)).current;

  const slideUp = () => {
    Animated.timing(translateY, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const slideDown = () => {
    Animated.timing(translateY, {
      toValue: 500,
      duration: 300,
      useNativeDriver: false,
    }).start(onClose);
  };

  const handleOutsideClick = () => {
    slideDown();
  };

  React.useEffect(() => {
    if (visible) {
      setTimeout(() => {
        slideUp();
      }, 300);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={() => slideDown()}>
      <TouchableWithoutFeedback onPress={handleOutsideClick}>
        <View style={$main}>
          <Animated.View
            style={{
              ...$animatedView,
              transform: [{translateY}],
            }}>
            {children}
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const $main: ViewStyle = {
  flex: 1,
  justifyContent: 'flex-end',
  backgroundColor: colors.palette.overlay50,
};

const $animatedView: ViewStyle = {
  backgroundColor: 'white',
  padding: 20,
  borderTopLeftRadius: 15,
  borderTopRightRadius: 15,
};
