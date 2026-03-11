// import React, {useState, useEffect} from 'react';
// import {
//   Modal,
//   View,
//   ViewStyle,
//   TextStyle,
// } from 'react-native';
// import {Text} from './Text';
// import {colors, spacing} from '../theme';

// type Props = {
//   isVisible: boolean;
//   onClose: () => void;
// };

// export const SucessModal = ({isVisible, onClose}: Props) => {
//   const [modalVisible, setModalVisible] = useState(isVisible);

//   useEffect(() => {
//     if (isVisible) {
//       setModalVisible(true);
//       const dismissTimeout = setTimeout(() => {
//         setModalVisible(false);
//         onClose();
//       }, 3000);

//       return () => clearTimeout(dismissTimeout);
//     }
//   }, [isVisible, onClose]);

//   return (
//     <Modal
//       visible={modalVisible}
//       animationType="fade"
//       transparent
//       onDismiss={() => onClose()}>
//       <View style={$main}>
//         <View style={$container}>
//           {/* <Image source={images.successGif} style={$image} /> */}
//           <Text
//             tx="createNewPassword.successHeading"
//             preset="heading"
//             size="xl"
//           />
//           <Text
//             tx="createNewPassword.successMessage"
//             preset="subheading"
//             style={$subheading}
//           />
//         </View>
//       </View>
//     </Modal>
//   );
// };

// const $main: ViewStyle = {
//   flex: 1,
//   justifyContent: 'center',
//   alignItems: 'center',
//   backgroundColor: colors.palette.overlay20,
// };

// const $container: ViewStyle = {
//   backgroundColor: colors.palette.white,
//   marginHorizontal: spacing.md,
//   borderRadius: spacing.xl,
//   padding: spacing.xl,
//   justifyContent: 'center',
//   alignItems: 'center',
// };

// // const $image: ImageStyle = {
// //   height: 144,
// //   width: 144,
// //   marginVertical: spacing.lg,
// // };

// const $subheading: TextStyle = {
//   textAlign: 'center',
//   textShadowColor: colors.palette.black,
//   marginVertical: spacing.md,
// };
