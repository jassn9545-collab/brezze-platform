// import React, { FC, useEffect, useState } from 'react';
// import {
//   FlatList,
//   TextStyle,
//   TouchableOpacity,
//   View,
//   ViewStyle,
// } from 'react-native';
// import Animated, { Easing, FadeInUp, FadeOutUp } from 'react-native-reanimated';
// // import HTMLView from 'react-native-htmlview';
// import { colors, images, spacing } from '../theme';
// import { BackButtom, Loader, Screen, Text } from '../components';
// import { AppStackScreenProps } from '../navigators';
// import { connect, ConnectedProps } from 'react-redux';
// import { RootState } from '../store';
// import { FAQParams, getFaqs } from '../slices/auth.slice';

// // const HTMLViewTyped = HTMLView as React.ComponentType<any>;
// type NavigationProps = AppStackScreenProps<'FAQ'>;
// type StoreProps = ConnectedProps<typeof connector>;
// type Props = NavigationProps & StoreProps;

// export interface FAQ {
//   id: number;
//   type: string;
//   question: string;
//   answer: string;
//   created_at: string;
//   modify_at: string;
// }

// const FAQView: FC<Props> = props => {
//   const [expandedItems, setExpandedItems] = useState<number[]>([]);

//   useEffect(() => {
//     props.getFaqs({
//       type: 'GOLD',
//     });
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   const renderItem = ({ item }: { item: FAQ }) => {
//     const included = expandedItems.includes(item.id);

//     return (
//       <TouchableOpacity
//         style={[
//           $rowView,
//           { paddingBottom: included ? spacing.lg : spacing.xxxs },
//         ]}
//         key={item.id}
//         onPress={() => toggleItem(item.id)}
//       >
//         <View style={$questionContainer}>
//           <Text
//             weight="medium"
//             size="md"
//             style={$question}
//             text={item.question}
//           />
//           <Animated.Image
//             source={images.rightArrow}
//             style={{
//               transform: [{ rotate: included ? '-90deg' : '90deg' }],
//             }}
//           />
//         </View>
//         {included && (
//           <Animated.View
//             entering={FadeInUp.easing(Easing.linear)}
//             exiting={FadeOutUp.easing(Easing.linear)}
//           >
//             <Text text={item.answer} weight="medium" size="sm" />
//           </Animated.View>
//         )}
//       </TouchableOpacity>
//     );
//   };

//   const toggleItem = (itemId: number) => {
//     setExpandedItems(prev => {
//       if (prev.includes(itemId)) {
//         return prev.filter(id => id !== itemId);
//       } else {
//         return [...prev, itemId];
//       }
//     });
//   };

//   return (
//     <>
//       <Screen
//         preset="fixed"
//         safeAreaEdges={['top', 'bottom']}
//         contentContainerStyle={$container}
//       >
//         <BackButtom headingTx="profile.faq" />
//         <FlatList
//           data={props.faqs}
//           renderItem={renderItem}
//           keyExtractor={item => item.id?.toString()}
//           style={$flatlist}
//           extraData={expandedItems}
//           showsVerticalScrollIndicator={false}
//         />
//       </Screen>
//       <Loader loading={props.loading} />
//     </>
//   );
// };

// const $container: ViewStyle = {
//   flexGrow: spacing.one,
// };

// const $flatlist: ViewStyle = {
//   flex: spacing.one,
//   marginTop: spacing.md,
// };

// const $rowView: ViewStyle = {
//   marginBottom: spacing.xs,
//   marginHorizontal: spacing.md,
//   paddingHorizontal: spacing.md,
//   backgroundColor: colors.palette.white,
//   borderRadius: spacing.sm + spacing.xxxs,
// };

// const $questionContainer: ViewStyle = {
//   flexDirection: 'row',
//   alignItems: 'center',
//   paddingVertical: spacing.sm,
// };

// const $question: TextStyle = {
//   flex: spacing.one,
//   marginEnd: spacing.md,
// };

// const mapStateToProps = (state: RootState) => ({
//   loading: state.auth.faqLoading === 'loading',
//   faqs: state.auth.faqs,
// });

// const mapDispatch = {
//   getFaqs: (params: FAQParams) => getFaqs(params),
// };

// const connector = connect(mapStateToProps, mapDispatch);
// export const FAQScreen = connector(FAQView);
