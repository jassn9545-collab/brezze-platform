// import React, {FC, useImperativeHandle, useState} from 'react';
// import {
//   Image,
//   Platform,
//   StatusBar,
// } from 'react-native';
// import BootSplash from 'react-native-bootsplash';
// import {colors} from '../theme';
// import Animated, {
//   runOnJS,
//   useAnimatedStyle,
//   useSharedValue,
//   withTiming,
// } from 'react-native-reanimated';
// import { HeaderGradient } from './HeaderGradient';

// export type AnimatedBootSplashRef = {
//   hide: () => void;
// };

// type AnimatedBootSplashProps = {
//   ref: React.Ref<AnimatedBootSplashRef>;
//   onAnimationEnd: () => void;
// };

// export const AnimatedBootSplash: FC<AnimatedBootSplashProps> = ({
//   ref,
//   onAnimationEnd,
// }) => {
//   const [visible, setVisible] = useState(true);
//   const topColor = useSharedValue<string>(colors.palette.centerColor);
//   const bottomColor = useSharedValue<string>(colors.palette.centerColor);
//   const opacity = useSharedValue(1);

//   useImperativeHandle(ref, () => ({
//     hide: () => {
//       opacity.value = withTiming(0, {duration: 350}, finish => {
//         if (finish) {
//           runOnJS(onAnimationEnd)();
//           runOnJS(setVisible)(false);
//         }
//       });
//     },
//   }));

//   const {container, logo} = BootSplash.useHideAnimation({
//     manifest: require('../assets/bootsplash/manifest.json'),
//     logo: require('../assets/bootsplash/logo.png'),
//     statusBarTranslucent: true,
//     navigationBarTranslucent: true,
//     animate: () => {
//       if (Platform.OS === 'android') {
//         StatusBar.setBackgroundColor(colors.palette.startColor, true);
//       }
//       topColor.value = withTiming(colors.palette.startColor, {duration: 500});
//       bottomColor.value = withTiming(colors.palette.info, {duration: 500});
//     },
//   });

//   const style = useAnimatedStyle(() => ({
//     opacity: opacity.value,
//   }));

//   if (!visible) {
//     return <></>;
//   }

//   return (
//     <Animated.View {...container} style={[container.style, style]}>
// <HeaderGradient />
//       <Image {...logo} />
//     </Animated.View>
//   );
// };
