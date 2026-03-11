// import React, { FC, useState } from 'react';
// import { Alert, TouchableOpacity, View, ViewStyle } from 'react-native';

// import { AppStackScreenProps, navigationRef } from '../navigators';
// import { BackButtom, Screen, Text } from '../components';
// import { colors, spacing } from '../theme';
// import { i18n, translate } from '../i18n';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import api from '../apis/api';

// type Props = AppStackScreenProps<'ChangeLanguage'>;

// type LanguageItem = {
//   id: number;
//   label: string;
//   key: 'en' | 'kn';
// };
// const languageData: LanguageItem[] = [
//   { id: 1, label: translate('profile.kannada'), key: 'kn' },
//   { id: 2, label: 'English', key: 'en' },
// ];

// const ChangeLanguage: FC<Props> = () => {
//   const [selectedLang, setSelectedLang] = useState<'en' | 'kn'>(
//     i18n.locale as 'en' | 'kn',
//   );

//   const handleSelect = (lang: 'en' | 'kn') => {
//     if (lang === selectedLang) return;

//     Alert.alert(
//       translate('profile.changeLanguage'),
//       translate('profile.languageChangeAlert', {
//         language: lang === 'en' ? 'English' : 'ಕನ್ನಡ',
//       }),
//       [
//         {
//           text: translate('common.cancel'),
//           style: 'cancel',
//         },
//         {
//           text: translate('common.confirm'),
//           onPress: async () => {
//             i18n.locale = lang;
//             setSelectedLang(lang);
//             await AsyncStorage.setItem('language', lang);
//             api.defaults.headers.lang = lang ?? 'en';
//             navigationRef.resetRoot({
//               routes: [
//                 {
//                   name: 'Drawer',
//                 },
//               ],
//             });
//           },
//         },
//       ],
//       { cancelable: true },
//     );
//   };

//   return (
//     <Screen
//       safeAreaEdges={['top']}
//       preset="fixed"
//       contentContainerStyle={$container}
//     >
//       <BackButtom headingTx="profile.changeLanguage" style={$header} />

//       <View style={$listContainer}>
//         {languageData.map(item => {
//           const isSelected = selectedLang === item.key;

//           return (
//             <TouchableOpacity
//               key={item.id}
//               style={$row}
//               onPress={() => handleSelect(item.key)}
//               activeOpacity={0.7}
//             >
//               <Text size="sm" weight="medium" text={item.label} />
//               <View style={[$radioOuter, isSelected && $radioOuterActive]}>
//                 {isSelected && <View style={$radioInner} />}
//               </View>
//             </TouchableOpacity>
//           );
//         })}
//       </View>
//     </Screen>
//   );
// };

// const $container: ViewStyle = {
//   flexGrow: 1,
// };

// const $header: ViewStyle = {
//   paddingBottom: spacing.md,
//   paddingHorizontal: spacing.md,
// };

// const $listContainer: ViewStyle = {
//   paddingHorizontal: spacing.md,
// };

// const $row: ViewStyle = {
//   flexDirection: 'row',
//   alignItems: 'center',
//   paddingVertical: spacing.md,
//   justifyContent: 'space-between',
// };

// const $radioOuter: ViewStyle = {
//   borderWidth: 1,
//   width: spacing.lg,
//   height: spacing.lg,
//   alignItems: 'center',
//   justifyContent: 'center',
//   borderRadius: spacing.lg / 2,
//   borderColor: colors.palette.grayLight,
// };

// const $radioOuterActive: ViewStyle = {
//   borderColor: colors.palette.black,
// };

// const $radioInner: ViewStyle = {
//   width: spacing.sm,
//   height: spacing.sm,
//   borderRadius: spacing.sm / 2,
//   backgroundColor: colors.palette.black,
// };

// export const ChangeLanguageScreen = ChangeLanguage;
