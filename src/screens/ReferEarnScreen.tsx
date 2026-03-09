// /* eslint-disable react/no-unstable-nested-components */
// import React, {
//   FC,
//   useCallback,
//   useEffect,
//   useMemo,
//   useRef,
//   useState,
// } from 'react';
// import { AppStackScreenProps } from '../navigators';
// import {
//   BackButtom,
//   Button,
//   Loader,
//   Screen,
//   Text,
//   TextField,
//   TextFieldAccessoryProps,
// } from '../components';
// import {
//   Animated,
//   Image,
//   ImageSourcePropType,
//   Share,
//   StyleSheet,
//   TouchableOpacity,
//   View,
// } from 'react-native';
// import { colors, images, spacing } from '../theme';
// import { translate, TxKeyPath } from '../i18n';
// import Clipboard from '@react-native-clipboard/clipboard';
// import { Currency } from '../config/defaults';
// import { connect, ConnectedProps } from 'react-redux';
// import { RootState } from '../store';
// import URLs from '../config/urls';
// import {
//   getReferEarnDetail,
//   withDrawRequest,
//   withDrawRequestParams,
// } from '../slices/auth.slice';
// import moment from 'moment';

// type NavigationProps = AppStackScreenProps<'ReferEarn'>;
// type Props = NavigationProps & ConnectedProps<typeof connector>;

// const ReferEarn: FC<Props> = props => {
//   const [activeTab, setActiveTab] = useState<'ReferEarn' | 'MyEarning'>(
//     'ReferEarn',
//   );
//   const [upiId, setUpiId] = useState('');
//   const [error, setError] = useState<TxKeyPath | undefined>(undefined);

//   const copyCode = useCallback(async () => {
//     Clipboard.setString(props.user?.data?.refral_code!);
//     const text = await Clipboard.getString();
//     toast.show(translate('referEarn.copied', { code: text }), {
//       type: 'success',
//     });
//   }, [props.user?.data?.refral_code]);

//   const scale = useRef(new Animated.Value(1)).current;

//   useEffect(() => {
//     Animated.sequence([
//       Animated.timing(scale, {
//         toValue: 0.95,
//         duration: 100,
//         useNativeDriver: true,
//       }),
//       Animated.timing(scale, {
//         toValue: 1,
//         duration: 100,
//         useNativeDriver: true,
//       }),
//     ]).start();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [activeTab]);

//   useEffect(() => {
//     props.getReferEarnDetail();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   const rightAccessory = useMemo(
//     () =>
//       function (prop: TextFieldAccessoryProps) {
//         return (
//           <TouchableOpacity style={prop.style} onPress={shereCode}>
//             <Image source={images.shareTabIcon} resizeMode="contain" />
//           </TouchableOpacity>
//         );
//       },
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//     [],
//   );

//   const shereCode = () => {
//     const shareMessage = translate('referEarn.inviteMessage', {
//       code: props.user?.data?.refral_code ?? '',
//       url: URLs.SHARE_URL + '?code=' + props.user?.data?.refral_code,
//     });
//     Share.share({ message: shareMessage });
//   };

//   const withdraw = () => {
//     if (upiId.trim() === '') {
//       setError('validation.required');
//       return;
//     }
//     setError(undefined);
//     setUpiId('');
//     props.withDrawRequest({
//       info: upiId,
//       amount: (props.data?.available_amount ?? 0)?.toString(),
//     });
//   };

//   return (
//     <>
//       <Screen
//         preset="auto"
//         safeAreaEdges={['top']}
//         contentContainerStyle={styles.container}
//       >
//         <BackButtom headingTx="referEarn.heading" style={styles.header} />
//         <Animated.View style={[styles.wrapTopTabs, { transform: [{ scale }] }]}>
//           <Button
//             tx="referEarn.referEarn"
//             preset={activeTab === 'ReferEarn' ? 'filled' : 'outline'}
//             onPress={() => setActiveTab('ReferEarn')}
//             textStyle={styles.tabTextStyle}
//             style={styles.singleTab}
//           />
//           <Button
//             tx="referEarn.myEarning"
//             preset={activeTab === 'MyEarning' ? 'filled' : 'outline'}
//             style={styles.singleTab}
//             textStyle={styles.tabTextStyle}
//             onPress={() => setActiveTab('MyEarning')}
//           />
//         </Animated.View>
//         {activeTab === 'ReferEarn' ? (
//           <View style={styles.wrapTabContent}>
//             <Text size="xl" weight="semiBold" tx="referEarn.inviteFriendEarn" />
//             <TextField
//               editable={false}
//               pointerEvents="none"
//               style={styles.inputStyle}
//               value={URLs.SHARE_URL + '?code=' + props.user?.data?.refral_code}
//               inputWrapperStyle={styles.inputWrapper}
//               RightAccessory={rightAccessory}
//             />
//             <Button
//               onPress={copyCode}
//               tx="referEarn.copyCode"
//               style={{ borderRadius: spacing.sm }}
//             />
//           </View>
//         ) : (
//           <View style={styles.wrapTabContent}>
//             <View style={styles.wrapEarningDetail}>
//               <SingleEarningDetail
//                 icon={images.loveEmoji}
//                 tx="referEarn.availableAmount"
//                 earning={
//                   Currency.sign +
//                   props.data?.available_amount?.toFixed(2)?.toString()
//                 }
//               />
//               <SingleEarningDetail
//                 icon={images.referEarn}
//                 tx="referEarn.totalEarning"
//                 earning={
//                   Currency.sign +
//                   props.data?.total_earned?.toFixed(2)?.toString()
//                 }
//               />
//             </View>
//             <TextField
//               HelperTextProps={{
//                 style: styles.helperInputText,
//               }}
//               placeholderTx="referEarn.addUPIId"
//               placeholderTextColor={colors.palette.grayLight}
//               inputWrapperStyle={styles.inputWrapper}
//               style={styles.inputStyle}
//               value={upiId}
//               onChangeText={setUpiId}
//               helperTx={error}
//               status={error ? 'error' : undefined}
//             />
//             <Button
//               tx="referEarn.moneyWithdraw"
//               style={{ borderRadius: spacing.sm }}
//               onPress={withdraw}
//             />
//           </View>
//         )}

//         {activeTab === 'ReferEarn' ? (
//           <>
//             <Text
//               size="xl"
//               weight="semiBold"
//               style={{ marginStart: spacing.md }}
//               tx="referEarn.howWorks"
//             />
//             <View style={styles.wrapTermsCond}>
//               {props.data?.how_it_works?.map((item, index) => (
//                 <SingleStep key={index} tx={item} />
//               ))}
//               <View style={styles.wrapInviteFriendText}>
//                 <Text
//                   size="xxs"
//                   weight="regular"
//                   tx="referEarn.watchRewardText"
//                 />
//               </View>
//             </View>

//             {(props.data?.referer?.length ?? 0) > 0 && (
//               <View
//                 style={{
//                   gap: spacing.xs,
//                   marginTop: spacing.xs,
//                   marginBottom: spacing.xl,
//                 }}
//               >
//                 <Text
//                   size="md"
//                   weight="medium"
//                   style={{ marginStart: spacing.md }}
//                   tx="referEarn.referList"
//                 />

//                 {props.data?.referer?.map((item, index) => (
//                   <View key={index} style={styles.singleUserCard}>
//                     <Image
//                       resizeMode="cover"
//                       style={styles.userImage}
//                       source={{ uri: props.baseURl + '/' + item.profile }}
//                     />
//                     <View style={styles.flex}>
//                       <Text size="sm" weight="medium" text={item.name} />
//                       <Text size="xxs" weight="medium" text={item.phone} />
//                     </View>

//                     <Text
//                       size="xxs"
//                       weight="regular"
//                       text={moment(item.created_at).format('MMM Do, YYYY')}
//                       style={styles.date}
//                     />
//                   </View>
//                 ))}
//               </View>
//             )}
//           </>
//         ) : (
//           (props.data?.withdrawls?.length ?? 0) > 0 && (
//             <>
//               <Text
//                 size="xl"
//                 weight="semiBold"
//                 style={{ marginStart: spacing.md }}
//                 tx="referEarn.withdrawList"
//               />
//               <View style={styles.singleTransection}>
//                 {props.data?.withdrawls?.map(item => (
//                   <Text
//                     key={item.id}
//                     size="xs"
//                     weight="regular"
//                     tx="referEarn.withdrawTransecton"
//                     txOptions={{
//                       value1: `${Currency.sign}${item.amount}`,
//                       value2: item.status,
//                     }}
//                     style={styles.singleTransectionText}
//                   />
//                 ))}
//               </View>
//             </>
//           )
//         )}
//       </Screen>
//       <Loader loading={props.loading === 'loading'} />
//     </>
//   );
// };

// type SingleEarningDetailType = {
//   icon: ImageSourcePropType;
//   tx: TxKeyPath;
//   earning: string;
// };
// const SingleEarningDetail = (props: SingleEarningDetailType) => {
//   return (
//     <View style={styles.wrapSingleEarningDetail}>
//       <Image source={props.icon} />
//       <View>
//         <Text size="xxs" weight="regular" tx={props.tx} />
//         <Text size="sm" weight="medium" text={props.earning} />
//       </View>
//     </View>
//   );
// };

// type SingleStepType = {
//   tx: string;
// };
// const SingleStep = (props: SingleStepType) => {
//   return (
//     <View style={styles.wrapSingleStep}>
//       <Text
//         size="sm"
//         weight="regular"
//         text={'• ' + props.tx}
//         style={{ flex: spacing.one }}
//       />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   header: {
//     paddingBottom: spacing.md,
//     paddingHorizontal: spacing.md,
//   },
//   container: {
//     flexGrow: 1,
//   },
//   wrapTopTabs: {
//     borderWidth: 1,
//     alignItems: 'center',
//     flexDirection: 'row',
//     borderRadius: spacing.md,
//     marginHorizontal: spacing.md,
//     borderColor: colors.palette.black,
//   },
//   singleTab: {
//     flex: 1,
//     borderWidth: 0,
//   },
//   tabTextStyle: {
//     color: colors.palette.black,
//   },
//   wrapTabContent: {
//     gap: spacing.md,
//     marginVertical: spacing.md,
//     marginHorizontal: spacing.md,
//   },
//   helperInputText: {
//     marginStart: 0,
//     marginVertical: spacing.md,
//   },
//   inputWrapper: {
//     borderWidth: 1,
//     borderRadius: spacing.xs,
//     backgroundColor: colors.palette.white,
//   },
//   inputStyle: {
//     color: colors.palette.black,
//   },
//   wrapEarningDetail: {
//     gap: spacing.sm,
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   wrapSingleEarningDetail: {
//     flex: 1,
//     borderWidth: 1,
//     gap: spacing.sm,
//     flexDirection: 'row',
//     alignItems: 'center',
//     borderRadius: spacing.sm,
//     paddingVertical: spacing.sm,
//     paddingHorizontal: spacing.xs,
//     backgroundColor: colors.palette.white,
//   },
//   wrapTermsCond: {
//     padding: spacing.sm,
//     marginTop: spacing.xs,
//     borderRadius: spacing.sm,
//     marginHorizontal: spacing.md,
//     backgroundColor: colors.palette.white,
//   },
//   singleTransection: {
//     marginTop: spacing.xs,
//     marginHorizontal: spacing.md,
//   },
//   singleTransectionText: {
//     padding: spacing.sm,
//     borderRadius: spacing.sm,
//     marginBottom: spacing.xs,
//     backgroundColor: colors.palette.white,
//   },
//   wrapSingleStep: {
//     gap: spacing.sm,
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: spacing.sm,
//   },
//   wrapInviteFriendText: {
//     borderWidth: 1,
//     borderRadius: spacing.xs,
//     borderColor: colors.primary,
//     paddingHorizontal: spacing.md,
//     paddingVertical: spacing.sm,
//     backgroundColor: colors.palette.primaryDimmed,
//   },
//   singleUserCard: {
//     gap: spacing.xs,
//     borderTopWidth: 1,
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingTop: spacing.sm,
//     marginBottom: spacing.xxs,
//     marginHorizontal: spacing.md,
//     justifyContent: 'space-between',
//   },
//   userImage: {
//     width: spacing.xl + spacing.xs,
//     height: spacing.xl + spacing.xs,
//     borderRadius: spacing.lg - spacing.xxs,
//     backgroundColor: colors.palette.grayLight,
//   },
//   flex: { flex: 1 },
//   date: { maxWidth: 120 },
// });

// const mapState = (state: RootState) => ({
//   baseURl: state.home.baseURl,
//   user: state.auth.myProfile,
//   data: state.auth.referEarnDetail,
//   loading: state.auth.withDrawLoading,
// });

// const mapDispatch = {
//   getReferEarnDetail,
//   withDrawRequest: (params: withDrawRequestParams) => withDrawRequest(params),
// };
// const connector = connect(mapState, mapDispatch);

// export const ReferEarnScreen = connector(ReferEarn);
