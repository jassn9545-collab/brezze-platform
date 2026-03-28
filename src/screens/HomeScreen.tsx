import { Button, Screen, Text, TextField, TextFieldAccessoryProps } from '../components';
import {
  Dimensions,
  FlatList,
  Image,
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { FC } from 'react';
import { colors, images, spacing } from '../theme';
import { AppBottomTabScreenProps } from '../navigators/BottomTabNavigator';
import { commonStyle } from '../theme/style';
import { Currency } from '../config/defaults';

type NavigationProps = AppBottomTabScreenProps<'Home'>;
// type StoreProps = ConnectedProps<typeof connector>;
type Props = NavigationProps;

const screenWidth = Dimensions.get('window').width;

const Home: FC<Props> = (props) => {
  //   const insets = useSafeAreaInsets();

  //   const [activeIndex, setActiveIndex] = useState(0);

  //   useEffect(() => {
  //     props.getHomeData();
  //     props.getCategories();
  //     props.getProfile();
  //     // eslint-disable-next-line react-hooks/exhaustive-deps
  //   }, []);

  // dummy data for categories

  const categories = [
    { title: 'Electrician', image: images.electrician },
    { title: 'Plumbing', image: images.plumbing },
    { title: 'Carpenter', image: images.carpenter },
    { title: 'Cleaning', image: images.cleaning },
    { title: 'Carpet maker', image: images.carpet },
    { title: 'Appliance', image: images.appliance },
    { title: 'AC Repair', image: images.acrepair },
    { title: 'Garden', image: images.garden },
  ];

  const professionals = [
    {
      name: 'Michael Rodriguez ',
      role: 'Master Electrician',
      rating: '4.9',
      price: 45,
      image: images.profile1,
      tags: ['Wiring', 'Emergency Repair'],
    },
    {
      name: 'Rodriguez Tony',
      role: 'Master Plumber',
      rating: '4.7',
      price: 40,
      image: images.profile2,
      tags: ['Leakage', 'Emergency Repair'],
    },
  ];

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

      <Screen
        preset="scroll"
        contentContainerStyle={styles.container}
        safeAreaEdges={['top']}
      >

        {/* HEADER */}

        <View style={styles.mainView}>
          <TouchableOpacity onPress={() => props.navigation.openDrawer()}>
            <Image source={images.navbaricon} />
          </TouchableOpacity>
          <Text
            tx="bottomTab.Home"
            weight="medium"
            size="xl"
          />
          <Image source={images.bellIcon} />
        </View>

        {/* SEARCH */}
        <View style={styles.searchContainer}>

          <TextField
            placeholderTx="home.searchPlaceholder"
            containerStyle={styles.flex}
            LeftAccessory={leftAccessory}
          />

          <Image
            source={images.filterIcon}
            style={styles.filterButton}
          />
        </View>

        {/* BANNER */}

        <View style={styles.thirdSection}>
          <ImageBackground
            source={images.homeImage}
            style={styles.imageHome}
            imageStyle={{ borderRadius: 20 }}
          >
            <View style={styles.overlay}>
              <Text style={styles.bannerText} tx="home.title" />
              <TouchableOpacity onPress={() => props.navigation.navigate('Service')}>
                <Button
                  tx="home.bookNow"
                />
              </TouchableOpacity>
            </View>
          </ImageBackground>
        </View>

        {/* CATEGORY HEADER */}

        <View style={styles.categoryHeader}>
          <Text tx="home.Categories" weight="semiBold" size="md" />
          <TouchableOpacity onPress={() => props.navigation.navigate('Categories')}>
            <Text tx="home.viewAll" size="xs" weight='semiBold' style={styles.viewAllText} />
          </TouchableOpacity>
        </View>

        {/* CATEGORY GRID */}

        <FlatList
          data={categories}
          keyExtractor={(item, index) => index.toString()}
          numColumns={4}
          contentContainerStyle={styles.categoryContainer}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <View style={styles.categoryItem}>
              <Image source={item.image} style={styles.categoryImage} />
              <Text
                text={item.title}
                weight="regular"
                size="xxs"
                style={styles.categoryText}
              />
            </View>
          )}
        />

        {/* FEATURED HEADER */}

        <View style={styles.featureHeader}>
          <Text tx="home.featuredProfessionals" weight="semiBold" size="lg" />
          <TouchableOpacity onPress={() => props.navigation.navigate('Service')}>
            <Text tx="home.viewAll" size="xxs" weight="medium" style={styles.viewAllText} />
          </TouchableOpacity>
        </View>

        {/* FEATURED LIST */}

        <FlatList
          data={professionals}
          keyExtractor={(item, index) => index.toString()}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <View style={[styles.card, commonStyle.customShadow]}>

              <View style={styles.cardContent}>
                <Image source={item.image} style={styles.profileImage} />

                <View style={{ flex: 1 }}>
                  <Text text={item.name} weight="semiBold" />
                  <Text text={item.role} size="xs" />

                  <View style={styles.tagContainer}>
                    {item.tags.map((tag, i) => (
                      <View key={i} style={styles.tag}>
                        <Text text={tag} size="xxs" />
                      </View>
                    ))}
                  </View>
                </View>

                <Text text={`⭐ ${item.rating}`} />
              </View>

              <View style={styles.cardBottom}>
                <Text
                  tx="home.servicePrice"
                  txOptions={{ value: Currency.sign + item.price }}
                  size="xs"
                />

                <TouchableOpacity style={styles.profileBtn}>
                  <Text
                    tx="home.viewProfile"
                    size="xxs"
                    weight="bold"
                    style={styles.viewAllText}
                  />
                </TouchableOpacity>
              </View>

            </View>
          )}
        />

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

      </Screen>
    </>
  );
};


const leftAccessory = (props: TextFieldAccessoryProps) => {
  return (
    <View style={[props.style, styles.inputAccessoryStyle]}>
      <Image source={images.searchIcon} />
    </View>
  );
};


const styles = StyleSheet.create({

  container: {
    flexGrow: 1,
    paddingBottom: 20,
  },

  mainView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  inputAccessoryStyle: {
    marginVertical: spacing.sm,
    height: 24,
  },


  searchContainer: {
    gap: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.md,
  },
  flex: { flex: 1 },
  filterButton: {
    height: 54,
    width: 54,
    borderRadius: spacing.xs,
  },

  thirdSection: {
    paddingHorizontal: 15,
    marginTop: 15,
  },

  imageHome: {
    width: '100%',
    height: 180,
    justifyContent: 'center',
  },

  overlay: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 20,
    alignItems: 'center',
  },

  bannerText: {
    color: colors.palette.white,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    width: '80%',
  },



  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginTop: 25,
    marginBottom: 5,
  },

  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 15,
    marginTop: 10,
  },

  categoryItem: {
    width: '25%',   // exact 4 columns
    alignItems: 'center',
    marginBottom: 20,
  },

  categoryImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginBottom: 8,
  },
  categoryText: {
    textAlign: 'center',
    marginTop: 4,
  },
  featureHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    marginTop: 10,
  },

  card: {
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: spacing.sm,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: colors.palette.offWhite,
  },

  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },

  cardContent: {
    flex: 1,
    gap: spacing.md,
    flexDirection: 'row',
  },

  tagContainer: {
    flexDirection: 'row',
    marginTop: 5,
  },

  tag: {
    backgroundColor: colors.palette.offWhite2,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 5,
    marginRight: 5,
  },

  cardBottom: {
    gap: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  profileBtn: {
    borderRadius: spacing.xs,
    paddingVertical: spacing.xxs,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.primaryDimmed,
  },
  viewAllText: {
    color: colors.primary,
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