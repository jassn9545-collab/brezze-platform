// import {AppUrl, VersionSetting} from '../slices/setting.types';
// import {ConnectedProps, connect} from 'react-redux';
// import {Image, Linking, Platform, StyleSheet, View} from 'react-native';
// import React, {FC, useEffect, useState} from 'react';
// import {colors, images, spacing} from '../theme';

// import {Button} from '../components';
// import {RootState} from '../store';
// import {ScreenWidth} from '../utils/util';
// import {Text} from '../components/Text';
// import {getVersion} from 'react-native-device-info';
// import {useSafeAreaInsets} from 'react-native-safe-area-context';

// type Props = ConnectedProps<typeof connector>;

// const Update: FC<Props> = props => {
//   const [visible, setVisible] = useState(false);
//   const insets = useSafeAreaInsets();
//   useEffect(() => {
//     if (props.versionSetting) {
//       const key = (Platform.OS + 'User') as keyof VersionSetting;
//       const {forceUpdateStatus, forceVersion = 0} = props.versionSetting[key];
//       if (forceUpdateStatus) {
//         const version = getVersion();
//         const currentVersion = parseFloat(version);
//         setVisible(currentVersion < forceVersion);
//       }
//     }
//   }, [props.versionSetting]);

//   if (!visible) {
//     return null;
//   }

//   const updateAction = async () => {
//     if (props.appUrl) {
//       const key = ('customer_' + Platform.OS + '_app') as keyof AppUrl;
//       const url = props.appUrl[key];
//       if (await Linking.canOpenURL(url)) {
//         Linking.openURL(props.appUrl[key]);
//       } else {
//         console.log('Unable to open the URL[%s]:', key, url);
//       }
//     }
//   };

//   const bottom = {marginBottom: insets.bottom + spacing.xxl};

//   return (
//     <View style={styles.container}>
//       <Image source={images.updateRocket} style={styles.image} />
//       <Text preset="heading" style={styles.text} tx="update.new" />
//       <Text preset="semibold" style={styles.text} tx="update.newFeature" />
//       <Text preset="subheading" style={styles.text} tx="update.description" />
//       <View style={styles.flex} />
//       <Button
//         tx="update.update"
//         style={[styles.button, bottom]}
//         onPress={updateAction}
//       />
//     </View>
//   );
// };

// const mapStateToProps = (state: RootState) => ({
//   versionSetting: state.setting.basic?.versionSetting,
//   appUrl: state.setting.basic?.appUrl,
// });

// const connector = connect(mapStateToProps);

// export const UpdateView = connector(Update);

// const styles = StyleSheet.create({
//   container: {
//     ...StyleSheet.absoluteFillObject,
//     flex: 1,
//     backgroundColor: colors.palette.white,
//     gap: spacing.md,
//   },
//   image: {
//     width: ScreenWidth,
//     resizeMode: 'cover',
//   },
//   text: {
//     textAlign: 'center',
//     marginHorizontal: spacing.lg,
//   },
//   flex: {
//     flex: 1,
//   },
//   button: {
//     marginHorizontal: spacing.xxl,
//   },
// });
