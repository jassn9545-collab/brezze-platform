import { Screen, Text } from '../components';
import {
  Dimensions,
  StyleSheet,
} from 'react-native';
import React, { FC } from 'react';
import { colors, spacing } from '../theme';
import { AppBottomTabScreenProps } from '../navigators/BottomTabNavigator';

type NavigationProps = AppBottomTabScreenProps<'Home'>;
// type StoreProps = ConnectedProps<typeof connector>;
type Props = NavigationProps;

const screenWidth = Dimensions.get('window').width;



const Home: FC<Props> = () => {
//   const insets = useSafeAreaInsets();

//   const [activeIndex, setActiveIndex] = useState(0);

//   useEffect(() => {
//     props.getHomeData();
//     props.getCategories();
//     props.getProfile();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);


  return (
    <>
      {/* <View style={[styles.wrapHeader, { marginTop: insets.top + spacing.sm }]}>
        <TouchableOpacity onPress={() => props.navigation.openDrawer()}>
          <Image source={images.menuIcon} />
        </TouchableOpacity>
        <Image source={images.appLogo} />
        <TouchableOpacity
          onPress={() => props.navigation.navigate('Notification')}
        >
          <Image source={images.notification} />
        </TouchableOpacity>
      </View> */}
      <Screen preset="auto" contentContainerStyle={styles.container}>
        {/* <View>
          <Carousel
            width={screenWidth}
            height={scale(250)}
            data={props.data?.banner ?? []}
            loop={true}
            autoPlay={true}
            autoPlayInterval={2000}
            style={styles.carouselStyle}
            onSnapToItem={index => setActiveIndex(index)}
            renderItem={({ item, index }) => {
              return (
                <FastImage
                  key={index}
                  source={{
                    uri: `${props.data?.image_base_url}/${item.photo}`,
                  }}
                  style={styles.carouselImage}
                  resizeMode="cover"
                />
              );
            }}
          />
          <View style={styles.wrapCarouselDots}>
            {(props.data?.banner ?? []).map((_, index) => (
              <View
                key={index}
                style={
                  activeIndex === index ? styles.activeDot : styles.inactiveDot
                }
              />
            ))}
          </View>
        </View> */}
 

 <Text text='Home screen' />
       
      </Screen>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
  wrapHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: spacing.md,
  },
  carouselStyle: {
    paddingStart: spacing.md,
    marginVertical: spacing.md,
  },
  carouselImage: {
    height: '100%',
    overflow: 'hidden',
    alignSelf: 'center',
    borderRadius: spacing.md,
    width: screenWidth - spacing.md * 2,
    backgroundColor: colors.primaryDimmed,
  },
  wrapCarouselDots: {
    bottom: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    position: 'absolute',
  },
  inactiveDot: {
    width: spacing.xs,
    height: spacing.xs,
    borderRadius: spacing.xxs,
    marginHorizontal: spacing.xxs,
    backgroundColor: colors.palette.white,
  },
  activeDot: {
    width: spacing.sm,
    height: spacing.sm,
    borderRadius: spacing.xs,
    marginHorizontal: spacing.xxs,
    backgroundColor: colors.primary,
  },
});

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

export const HomeScreen = Home;
