import { BackButtom, Screen, Text, } from '../components';
import {
  FlatList,
  // Dimensions,
  Image,
  StyleSheet,
  View,
} from 'react-native';
import React, { FC } from 'react';
import { images } from '../theme';
import { AppBottomTabScreenProps } from '../navigators/BottomTabNavigator';

type NavigationProps = AppBottomTabScreenProps<'Categories'>;
// type StoreProps = ConnectedProps<typeof connector>;
type Props = NavigationProps;

// const screenWidth = Dimensions.get('window').width;

const Categories: FC<Props> = () => {

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
    { title: 'Electrician', image: images.electrician },
    { title: 'Plumbing', image: images.plumbing },
    { title: 'Carpenter', image: images.carpenter },
    { title: 'Cleaning', image: images.cleaning },
    { title: 'Carpet maker', image: images.carpet },
    { title: 'Appliance', image: images.appliance },
    { title: 'AC Repair', image: images.acrepair },
    { title: 'Garden', image: images.garden },
    { title: 'Electrician', image: images.electrician },
    { title: 'Plumbing', image: images.plumbing },
    { title: 'Carpenter', image: images.carpenter },
    { title: 'Cleaning', image: images.cleaning },
    { title: 'Carpet maker', image: images.carpet },
    { title: 'Appliance', image: images.appliance },
    { title: 'AC Repair', image: images.acrepair },
    { title: 'Garden', image: images.garden },
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

        {/* CATEGORY HEADER */}



        <BackButtom headingTx='home.Categories' />

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
                size="xs"
                style={styles.categoryText}
              />
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




const styles = StyleSheet.create({

  container: {
    flexGrow: 1,
    paddingBottom: 20,
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

export const CategoriesScreen = Categories;