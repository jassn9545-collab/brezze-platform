// import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
// import { Button, Screen, Text } from '../components';
// import { colors, spacing } from '../theme';
// import { AppStackScreenProps } from '../navigators';
// import { useAppDispatch } from '../store/hooks';
// import { userLogout } from '../slices/auth.slice';

// type Props = AppStackScreenProps<'BottomModal'>;

// export const BottomModal = (props: Props) => {
//   const dispatch = useAppDispatch();

//   const onPressClose = () => {
//     props.navigation.goBack();
//   };

//   const onConfirm = () => {
//     if (props.route.params.modalType === 'logout') {
//       dispatch(userLogout())
//     }
//   };

//   return (
//     <Screen
//       preset="fixed"
//       contentContainerStyle={styles.container}
//       backgroundColor={colors.palette.overlay20}
//     >
//       <TouchableOpacity style={styles.topTap} onPress={onPressClose} />
//       <View style={styles.main}>
//         <Image source={props.route.params.image} />
//         <Text
//           tx={props.route.params.title}
//           style={{ color: colors.palette.white }}
//           size="lg"
//           weight="medium"
//         />
//         <Text
//           tx={props.route.params.desc}
//           style={{ color: colors.palette.white }}
//           size="sm"
//           weight="regular"
//         />

//         <View style={styles.buttons}>
//           <Button
//             tx="common.cancel"
//             onPress={onPressClose}
//             style={styles.buttonStyle}
//           />
//           <Button
//             tx={props.route.params.btnText}
//             style={styles.buttonStyle}
//             onPress={onConfirm}
//             preset="plus"
//           />
//         </View>
//       </View>
//     </Screen>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'flex-end',
//   },
//   topTap: {
//     flex: 1,
//   },
//   main: {
//     gap: spacing.xs,
//     padding: spacing.lg,
//     paddingBottom: spacing.xl,
//     borderTopLeftRadius: spacing.xl,
//     borderTopRightRadius: spacing.xl,
//     backgroundColor: colors.palette.darkGray1,
//   },
//   buttons: {
//     gap: spacing.sm,
//     alignItems: 'center',
//     flexDirection: 'row',
//     marginTop: spacing.xs,
//   },
//   buttonStyle: { width: '48%', borderRadius: spacing.xs },
// });
