// import React, { useMemo } from 'react';
// import { spacing } from '../theme';
// import { TextStyle, useWindowDimensions, View, ViewStyle } from 'react-native';
// import { TxKeyPath } from '../i18n';
// import { AppStackParamList, AppStackScreenProps } from '../navigators';
// import { BackButtom, Button, Loader, Screen, Text } from '../components';
// import RenderHtml from 'react-native-render-html';
// import { useAppDispatch, useAppSelector } from '../store/hooks';
// import { sipTCAccept } from '../slices/home.slice';
// import { useSafeAreaInsets } from 'react-native-safe-area-context';

// export type StaticType = 'privacy' | 'terms' | 'about';

// type ParamsList = Pick<
//   AppStackParamList,
//   'PrivacyPolicy' | 'TermsCondition' | 'AboutUs'
// >;

// type RouteParams = {
//   title: TxKeyPath;
//   type: StaticType;
//   data?: string;
//   from?: string;
// };
// type Props<T extends keyof ParamsList> = AppStackScreenProps<T>;

// export const StaticScreen = <T extends keyof ParamsList>(props: Props<T>) => {
//   const dispatch = useAppDispatch();
//   const insets = useSafeAreaInsets();
//   const { width } = useWindowDimensions();
//   const {type, title, data, from } = props.route.params as RouteParams;

//   const loading = useAppSelector(state => state.home.sipTCLoading);
//   const profile = useAppSelector(state => state.auth.myProfile?.data)

//   let page = useMemo(() => {
//     switch (type) {
//       case 'privacy':
//         return profile?.privacy_policy;
//       case 'terms':
//         return profile?.term_and_condition;
//       case 'about':
//         return profile?.about_us;
//     }
//   }, [profile, type]);

//   const acceptTC = () => {
//     dispatch(sipTCAccept());
//   };

//   return (
//     <>
//       <BackButtom
//         headingTx={title}
//         style={[
//           $header,
//           {
//             paddingTop: insets.top + spacing.xs,
//           },
//         ]}
//       />
//       <Screen
//         preset="auto"
//         contentContainerStyle={$container}
//         safeAreaEdges={['bottom']}
//       >
//         {(data ?? page) ? (
//           <RenderHtml
//             contentWidth={width}
//             source={{
//               html: data ?? page ?? '',
//             }}
//           />
//         ) : (
//           <View style={$loader}>
//             <Text tx="loaderText.default" />
//           </View>
//         )}
//       </Screen>
//       {from === 'sip' && (
//         <View
//           style={{
//             marginHorizontal: spacing.md,
//             paddingBottom: insets.bottom + spacing.xs,
//           }}
//         >
//           <Button tx="home.acceptContinue" onPress={acceptTC} />
//         </View>
//       )}
//       <Loader loading={loading === 'loading'} />
//     </>
//   );
// };

// const $container: ViewStyle = {
//   flexGrow: 1,
//   marginHorizontal: spacing.md,
// };

// const $header: ViewStyle = {
//   paddingBottom: spacing.md,
//   paddingHorizontal: spacing.md,
// };

// const $loader: TextStyle = {
//   flex: 1,
//   alignItems: 'center',
//   justifyContent: 'center',
// };
