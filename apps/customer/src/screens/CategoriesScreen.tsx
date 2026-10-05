import { BackButtom, Screen, Text, } from '../components';
import {
  ActivityIndicator,
  FlatList,
  // Dimensions,
  Image,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import React, { FC, useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../theme';
import { AppBottomTabScreenProps } from '../navigators/BottomTabNavigator';
import { DiscoveryCategory, getDiscovery } from '../apis/discovery';

type NavigationProps = AppBottomTabScreenProps<'Categories'>;
// type StoreProps = ConnectedProps<typeof connector>;
type Props = NavigationProps;

// const screenWidth = Dimensions.get('window').width;

const Categories: FC<Props> = props => {
  const [categories, setCategories] = useState<DiscoveryCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(useCallback(() => {
    let active = true;
    setLoading(true);

    getDiscovery()
      .then(data => {
        if (active) setCategories(data.categories);
      })
      .catch(() => {
        if (active) setCategories([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []));



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



        <BackButtom headingTx="home.Categories" style={styles.header} />

        {/* CATEGORY GRID */}

        <FlatList
          data={categories}
          keyExtractor={item => String(item.id)}
          numColumns={4}
          contentContainerStyle={styles.categoryContainer}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.categoryItem}
              onPress={() =>
                props.navigation.navigate('CategoryServices', {
                  categoryId: item.id,
                  categoryName: item.name,
                })
              }
            >
              <Image source={{ uri: item.image_url }} style={styles.categoryImage} />
              <Text
                text={item.name}
                weight="regular"
                size="xxs"
                style={styles.categoryText}
                numberOfLines={2}
              />
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            loading ? (
              <ActivityIndicator color={colors.primary} style={styles.loading} />
            ) : (
              <Text text="No categories available." style={styles.emptyText} />
            )
          }
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
    paddingBottom: 24,
  },

  header: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },


  categoryContainer: {
    paddingHorizontal: 20,
    paddingTop: 18,
  },

  categoryItem: {
    width: '25%',
    alignItems: 'center',
    marginBottom: 24,
  },

  categoryImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 7,
  },
  categoryText: {
    textAlign: 'center',
    lineHeight: 16,
  },
  loading: { marginTop: 40 },
  emptyText: { width: '100%', textAlign: 'center', marginTop: 40 },


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
