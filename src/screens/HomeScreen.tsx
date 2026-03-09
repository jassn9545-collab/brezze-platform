// import { Screen, Text } from '../components';
// import {
//   Dimensions,
//   FlatList,
//   Image,
//   ImageSourcePropType,
//   StyleSheet,
//   TouchableOpacity,
//   View,
// } from 'react-native';
// import { connect, ConnectedProps } from 'react-redux';
// import React, { FC, useEffect, useState } from 'react';
// import { colors, images, spacing } from '../theme';
// import { AppBottomTabScreenProps } from '../navigators/BottomTabNavigator';
// import { useSafeAreaInsets } from 'react-native-safe-area-context';
// import Carousel from 'react-native-reanimated-carousel';
// import { scale } from 'react-native-size-matters';
// import { TxKeyPath } from '../i18n';
// import { SingleItem } from './ProductListScreen';
// import { getProfile } from '../slices/auth.slice';
// import { AddCartParams, addToCart, addToWishlist, getCategories, getHomeData, removeToWishlist, WishlistParams } from '../slices/home.slice';
// import { RootState } from '../store';
// import FastImage from '@d11/react-native-fast-image';
// import { Category, Product } from '../slices/types';

// type NavigationProps = AppBottomTabScreenProps<'Home'>;
// type StoreProps = ConnectedProps<typeof connector>;
// type Props = NavigationProps & StoreProps;

// const screenWidth = Dimensions.get('window').width;

// type NavigationTarget =
//   | { name: 'AdvanceBooking'; params: { type: 'gold' | 'silver' } }
//   | { name: 'Sip' }
//   | { name: 'CustomOrders' };
// interface PlanBookResponse {
//   _id: number;
//   title: TxKeyPath;
//   description: TxKeyPath;
//   screen?: NavigationTarget;
//   image: ImageSourcePropType;
// }

// const planBook: PlanBookResponse[] = [
//   {
//     _id: 1,
//     title: 'home.title1',
//     description: 'home.description1',
//     screen: {
//       name: 'AdvanceBooking',
//       params: { type: 'gold' },
//     },
//     image: images.goldImage,
//   },
//   {
//     _id: 2,
//     title: 'home.title2',
//     description: 'home.description2',
//     screen: {
//       name: 'AdvanceBooking',
//       params: { type: 'silver' },
//     },
//     image: images.silver,
//   },
//   {
//     _id: 3,
//     title: 'home.title3',
//     description: 'home.description3',
//     screen: { name: 'Sip' },
//     image: images.sipPlan,
//   },
//   {
//     _id: 4,
//     title: 'home.title4',
//     description: 'home.description4',
//     screen: {
//       name: 'CustomOrders',
//     },
//     image: images.customOrder,
//   },
// ];

// const { width: SCREEN_WIDTH } = Dimensions.get('window');
// const ITEM_WIDTH = SCREEN_WIDTH / 2 - spacing.lg;

// const Home: FC<Props> = props => {
//   const insets = useSafeAreaInsets();

//   const [activeIndex, setActiveIndex] = useState(0);

//   useEffect(() => {
//     props.getHomeData();
//     props.getCategories();
//     props.getProfile();
//     // (async () => {
//     //   await delay(1000);
//     //   props.navigation.navigate('SpecialOfferModal');
//     // })();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   const onPressCategory = (data: Category) => {
//     props.navigation.navigate('ProductList', {
//       categoryId: data.id,
//     });
//   };

//   const pressViewProductList = () => {
//     props.navigation.navigate('ProductList');
//   };

//   const pressPlan = (target?: NavigationTarget) => {
//     if (!target) return;

//     if ('params' in target) {
//       props.navigation.navigate(target.name, target.params);
//     } else {
//       props.navigation.navigate(target.name);
//     }
//   };

//   const onPressCartAction = (data: Product, quantity: number) => {
//     props.addToCart({
//       product_id: data.id,
//       quantity: quantity ?? 0,
//     });
//   };

//   const onPressWishlistAction = (data: Product) => {
//     if (data.liked) {
//       props.removeToWishlist({
//         product_id: data.id,
//       });
//     } else {
//       props.addToWishlist({
//         product_id: data.id,
//       });
//     }
//   };
//   return (
//     <>
//       <View style={[styles.wrapHeader, { marginTop: insets.top + spacing.sm }]}>
//         <TouchableOpacity onPress={() => props.navigation.openDrawer()}>
//           <Image source={images.menuIcon} />
//         </TouchableOpacity>
//         <Image source={images.appLogo} />
//         <TouchableOpacity
//           onPress={() => props.navigation.navigate('Notification')}
//         >
//           <Image source={images.notification} />
//         </TouchableOpacity>
//       </View>
//       <Screen preset="auto" contentContainerStyle={styles.container}>
//         <View>
//           <Carousel
//             width={screenWidth}
//             height={scale(250)}
//             data={props.data?.banner ?? []}
//             loop={true}
//             autoPlay={true}
//             autoPlayInterval={2000}
//             style={styles.carouselStyle}
//             onSnapToItem={index => setActiveIndex(index)}
//             renderItem={({ item, index }) => {
//               return (
//                 <FastImage
//                   key={index}
//                   source={{
//                     uri: `${props.data?.image_base_url}/${item.photo}`,
//                   }}
//                   style={styles.carouselImage}
//                   resizeMode="cover"
//                 />
//               );
//             }}
//           />
//           <View style={styles.wrapCarouselDots}>
//             {(props.data?.banner ?? []).map((_, index) => (
//               <View
//                 key={index}
//                 style={
//                   activeIndex === index ? styles.activeDot : styles.inactiveDot
//                 }
//               />
//             ))}
//           </View>
//         </View>
//         <View>
//           <View style={styles.wrapCategoryHeading}>
//             <Text size="md" weight="medium" tx="home.category" />
//             <TouchableOpacity
//               onPress={() => props.navigation.navigate('CategoryList')}
//             >
//               <Text size="xs" weight="medium" tx="home.seeAll" />
//             </TouchableOpacity>
//           </View>
//           <FlatList
//             horizontal
//             data={props.data?.categories}
//             style={styles.flatlist}
//             contentContainerStyle={{ paddingRight: spacing.md }}
//             keyExtractor={item => item.id?.toString()}
//             renderItem={({ item, index }) => (
//               <SingleCategory
//                 item={item}
//                 index={index}
//                 baseUrl={props.data?.image_base_url!}
//                 onPress={onPressCategory}
//               />
//             )}
//             showsHorizontalScrollIndicator={false}
//           />
//         </View>
//         <View>
//           <Text
//             style={styles.servicesText}
//             tx="home.ourServices"
//             weight="medium"
//             size="md"
//           />
//           <View style={styles.wrapPlan}>
//             {planBook.map(item => (
//               <View key={item._id} style={styles.singlePlanDetail}>
//                 <View style={styles.wrapGoldImage}>
//                   <Image resizeMode="contain" source={item.image} />
//                 </View>
//                 <Text tx={item.title} size="sm" weight="medium" />
//                 <Text tx={item.description} size="xxs" weight="medium" />
//                 <View style={styles.flexOne} />
//                 <TouchableOpacity
//                   onPress={() => pressPlan(item.screen)}
//                   style={styles.arrowIcon}
//                 >
//                   <Image
//                     style={styles.transformImage}
//                     source={images.leftArrowIcon}
//                     tintColor={colors.palette.white}
//                   />
//                 </TouchableOpacity>
//               </View>
//             ))}
//           </View>
//         </View>
//         <View style={styles.wrapPriceInfo}>
//           <PriceDetail
//             goldPrice={props.data?.gold_price!}
//             silverPrice={props.data?.silver_price!}
//           />
//         </View>
//         <View style={{ marginTop: spacing.md }}>
//           <View style={styles.wrapSaleHeading}>
//             <Text tx="home.flashSale" weight="medium" size="md" />
//             <TouchableOpacity onPress={pressViewProductList}>
//               <Text size="xs" weight="medium" tx="home.seeAll" />
//             </TouchableOpacity>
//           </View>
//           <View style={styles.jewellryContainer}>
//             {props.data?.products.map((item: Product, index: number) => (
//               <SingleItem
//                 key={index}
//                 item={item}
//                 index={index}
//                 baseUrl={props.data?.image_base_url!}
//                 onPressProduct={(data: Product) =>
//                   props.navigation.navigate('ProductDetail', {
//                     data,
//                   })
//                 }
//                 onPressCartAction={onPressCartAction}
//                 onPressWishlistAction={onPressWishlistAction}
//               />
//             ))}
//           </View>
//         </View>
//         <View style={styles.certifiedJewellery}>
//           <Image source={images.certifiedJewllery} />
//           <View style={styles.wrapCertifiedText}>
//             <Text
//               size="md"
//               weight="medium"
//               style={styles.primaryColorText}
//               tx="home.certifiedTitle"
//             />
//             <Text
//               size="xs"
//               weight="regular"
//               style={styles.whiteText}
//               tx="home.certifiedMessage"
//             />
//           </View>
//         </View>
//         <View style={styles.wrapSocialLink}>
//           <Image source={images.facebook} />
//           <Image source={images.instagram} />
//           <Image source={images.whatsapp} />
//           <Image source={images.twitter} />
//         </View>
//         <Text
//           tx="home.poweredBy"
//           style={styles.poweredBy}
//           size="md"
//           weight="semiBold"
//         />
//       </Screen>
//     </>
//   );
// };

// const SingleCategory = ({
//   item,
//   index,
//   onPress,
//   baseUrl,
// }: {
//   item: Category;
//   index: number;
//   baseUrl: string;
//   onPress: (data: Category) => void;
// }) => (
//   <TouchableOpacity
//     style={styles.singleCategory}
//     activeOpacity={0.7}
//     key={index}
//     onPress={() => onPress(item)}
//   >
//     <View style={styles.categoryImageWrapper}>
//       <FastImage
//         source={{ uri: `${baseUrl}/${item.photo}` }}
//         style={styles.categoryImage}
//         resizeMode="contain"
//       />
//     </View>
//     <Text text={item.name} size="xs" weight="medium" numberOfLines={1} />
//   </TouchableOpacity>
// );

// const PriceDetail = ({
//   goldPrice,
//   silverPrice,
// }: {
//   goldPrice: string;
//   silverPrice: string;
// }) => {
//   return (
//     <View style={styles.wrapSinglePriceDetail}>
//       <Text
//         size="xxs"
//         tx="home.marketRate"
//         weight="semiBold"
//         style={styles.marketRateText}
//       />
//       <View style={styles.wrapPriceUpdatedDetail}>
//         <View style={styles.updateTimeInfp}>
//           <Text
//             size="xxs"
//             weight="medium"
//             tx="home.gold"
//             style={styles.whiteColor}
//           />
//           <Text
//             weight="medium"
//             size="sm"
//             text={goldPrice + ' /g'}
//             style={styles.whiteColor}
//           />
//         </View>
//         <View style={styles.verticalLine} />
//         <View style={styles.updateTimeInfp}>
//           <Text
//             size="xxs"
//             weight="medium"
//             tx="home.silver"
//             style={styles.whiteColor}
//           />
//           <Text
//             weight="medium"
//             size="sm"
//             text={silverPrice + ' /g'}
//             style={styles.whiteColor}
//           />
//         </View>
//         <Image source={images.graph} />
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flexGrow: 1,
//   },
//   wrapHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     marginHorizontal: spacing.md,
//   },
//   carouselStyle: {
//     paddingStart: spacing.md,
//     marginVertical: spacing.md,
//   },
//   carouselImage: {
//     height: '100%',
//     overflow: 'hidden',
//     alignSelf: 'center',
//     borderRadius: spacing.md,
//     width: screenWidth - spacing.md * 2,
//     backgroundColor: colors.primaryDimmed,
//   },
//   wrapCarouselDots: {
//     bottom: spacing.lg,
//     flexDirection: 'row',
//     alignItems: 'center',
//     alignSelf: 'center',
//     position: 'absolute',
//   },
//   inactiveDot: {
//     width: spacing.xs,
//     height: spacing.xs,
//     borderRadius: spacing.xxs,
//     marginHorizontal: spacing.xxs,
//     backgroundColor: colors.palette.white,
//   },
//   activeDot: {
//     width: spacing.sm,
//     height: spacing.sm,
//     borderRadius: spacing.xs,
//     marginHorizontal: spacing.xxs,
//     backgroundColor: colors.primary,
//   },
//   wrapCategoryHeading: {
//     alignItems: 'center',
//     flexDirection: 'row',
//     marginBottom: spacing.sm,
//     marginHorizontal: spacing.md,
//     justifyContent: 'space-between',
//   },
//   singleCategory: {
//     width: scale(90),
//     alignItems: 'center',
//     marginEnd: spacing.xxxs,
//   },
//   categoryImageWrapper: {
//     overflow: 'hidden',
//     padding: spacing.sm,
//     borderRadius: scale(50),
//     backgroundColor: colors.palette.black,
//   },
//   categoryImage: {
//     width: scale(60),
//     height: scale(60),
//   },
//   flatlist: {
//     paddingEnd: spacing.md,
//     paddingHorizontal: spacing.md,
//   },
//   wrapPlan: {
//     flex: 1,
//     flexWrap: 'wrap',
//     flexDirection: 'row',
//     marginHorizontal: spacing.md,
//     justifyContent: 'space-between',
//   },
//   servicesText: {
//     marginTop: spacing.lg,
//     marginStart: spacing.md,
//     marginBottom: spacing.xs,
//   },
//   singlePlanDetail: {
//     gap: spacing.xs,
//     width: ITEM_WIDTH,
//     padding: spacing.sm,
//     marginBottom: spacing.sm,
//     borderRadius: spacing.sm,
//     backgroundColor: colors.palette.primaryDimmed,
//   },
//   flexOne: {
//     flex: 1,
//   },
//   wrapGoldImage: {
//     width: 70,
//     height: 70,
//     padding: spacing.sm,
//     alignItems: 'center',
//     justifyContent: 'center',
//     borderRadius: spacing.xs,
//     backgroundColor: colors.palette.gray,
//   },
//   arrowIcon: {
//     padding: spacing.xs,
//     alignSelf: 'flex-start',
//     borderRadius: spacing.xs,
//     backgroundColor: colors.palette.black,
//   },
//   transformImage: {
//     transform: [{ rotate: '180deg' }],
//   },
//   wrapSaleHeading: {
//     alignItems: 'center',
//     flexDirection: 'row',
//     marginHorizontal: spacing.md,
//     justifyContent: 'space-between',
//   },
//   wrapPriceInfo: {
//     flex: 1,
//     gap: spacing.sm,
//     alignItems: 'center',
//     flexDirection: 'row',
//     marginTop: spacing.xs,
//     marginHorizontal: spacing.md,
//   },
//   wrapSinglePriceDetail: {
//     flex: 1,
//     padding: spacing.lg,
//     marginEnd: spacing.md,
//     borderRadius: spacing.sm,
//     backgroundColor: colors.palette.darkGray2,
//   },
//   marketRateText: {
//     color: colors.primary,
//   },
//   wrapPriceUpdatedDetail: {
//     gap: spacing.xxs,
//     alignItems: 'center',
//     flexDirection: 'row',
//     marginTop: spacing.xs,
//     marginBottom: spacing.xxs,
//     justifyContent: 'space-between',
//   },
//   wrapPriceDetailIcon: {
//     padding: spacing.xxs,
//     borderRadius: spacing.xs,
//     backgroundColor: colors.palette.black,
//   },
//   priceDetailIcon: {
//     width: 36,
//     height: 36,
//   },
//   updateTimeInfp: {
//     flexShrink: 1,
//     gap: spacing.xxs,
//   },
//   verticalLine: {
//     width: 1,
//     height: scale(40),
//     backgroundColor: colors.palette.white,
//   },
//   priceUpdatedTime: {
//     fontSize: 8,
//     lineHeight: 12,
//   },
//   jewellryContainer: {
//     flexWrap: 'wrap',
//     flexDirection: 'row',
//     paddingTop: spacing.md,
//     paddingHorizontal: spacing.md,
//     justifyContent: 'space-between',
//   },
//   whiteText: {
//     color: colors.palette.white,
//   },
//   certifiedJewellery: {
//     gap: spacing.md,
//     margin: spacing.md,
//     padding: spacing.md,
//     alignItems: 'center',
//     flexDirection: 'row',
//     borderRadius: spacing.md,
//     backgroundColor: colors.palette.darkGray2,
//   },
//   wrapCertifiedText: {
//     flex: 1,
//   },
//   primaryColorText: {
//     color: colors.primary,
//   },
//   wrapSocialLink: {
//     gap: spacing.sm,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   poweredBy: {
//     textAlign: 'center',
//     marginVertical: spacing.md,
//   },
//   whiteColor: {
//     color: colors.palette.white,
//   },
// });

// const mapStateToProps = (state: RootState) => ({
//   data: state.home.homeData,
// });

// const mapDispatch = {
//   getProfile,
//   getHomeData,
//   getCategories,
//   addToCart: (params: AddCartParams) => addToCart(params),
//   addToWishlist: (params: WishlistParams) => addToWishlist(params),
//   removeToWishlist: (params: WishlistParams) => removeToWishlist(params),
// };

// const connector = connect(mapStateToProps, mapDispatch);

// export const HomeScreen = connector(Home);
