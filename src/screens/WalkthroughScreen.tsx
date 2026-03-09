import React, { FC, useRef, useState } from 'react';
import { spacing, colors, AppImage, images } from '../theme';
import {
  View,
  ViewStyle,
  FlatList,
  Dimensions,
  type ViewToken,
  TextStyle,
  Image,
  ImageStyle,
  TouchableOpacity,
} from 'react-native';
import { Screen, Text } from '../components';
import { AuthStackScreenProps } from '../navigators';
import { TxKeyPath } from '../i18n';

type Props = AuthStackScreenProps<'Walkthrough'>;
type WalkthroughDataType = {
  id: number;
  title: TxKeyPath;
  description: TxKeyPath;
  image: AppImage;
}[];

const walkthroughData: WalkthroughDataType = [
  {
    id: 1,
    title: 'walkthrough.first',
    description: 'walkthrough.firstSubtitle',
    image: images.walkthrough1,
  },
  {
    id: 2,
    title: 'walkthrough.second',
    description: 'walkthrough.secondSubtitle',
    image: images.walkthrough2,
  },
  {
    id: 3,
    title: 'walkthrough.third',
    description: 'walkthrough.thirdSubtitle',
    image: images.walkthrough3,
  },
];

const Walkthrough: FC<Props> = (props) => {
  const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 80 });
  const flatlist = useRef<FlatList>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const onViewableItemsChanged = React.useMemo(
    () =>
      ({ viewableItems }: { viewableItems: ViewToken[] }) => {
        if (viewableItems.length > 0) {
          let item = viewableItems[0].index;
          setSelectedIndex(item ?? 0);
        }
      },
    [],
  );

  return (
    <Screen
      preset="fixed"
      contentContainerStyle={$screenContentContainer}
      safeAreaEdges={['top', 'bottom']}
    >
      <View style={$sliderView}>
        <FlatList
          data={walkthroughData}
          ref={flatlist}
          horizontal
          pagingEnabled
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewConfigRef.current}
          showsHorizontalScrollIndicator={false}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={$slide}>
              <Image source={item.image} style={$image} resizeMode="contain" />
              <Text
                size="xxxl"
                weight="bold"
                tx={item.title}
                style={$titleStyle}
              />
              <Text
                size="lg"
                weight="light"
                style={$textStyle}
                tx={item.description}
              />
            </View>
          )}
        />
        <View style={$bottomContainer}>
          <View style={$dotContainer}>
            {walkthroughData.map((data, index) => (
              <View
                key={data.id}
                style={[
                  $dotStyle,
                  index === selectedIndex && {
                    backgroundColor: colors.primary,
                  },
                ]}
              />
            ))}
          </View>
          <TouchableOpacity
            onPress={() => {
              if (selectedIndex === walkthroughData.length - 1) {
                props.navigation.replace('Login');
              } else {
                flatlist.current?.scrollToIndex({
                  index: selectedIndex + 1,
                  animated: true,
                });
              }
            }}
            style={$arrowIcon}
          >
            <Image source={images.rightArrow} />
          </TouchableOpacity>
        </View>
      </View>
    </Screen>
  );
};

const $screenContentContainer: ViewStyle = {
  flexGrow: 1,
};

const $sliderView: ViewStyle = {
  flex: 1,
  justifyContent: 'center',
};

const $slide: ViewStyle = {
  flex: 1,
  justifyContent: 'flex-end',
  width: Dimensions.get('window').width,
};

const $image: ImageStyle = {
  flex: 0.7,
  width: '95%',
  alignSelf: 'center',
};

const $titleStyle: TextStyle = {
  marginTop: spacing.xl,
  marginHorizontal: spacing.lg,
};

const $textStyle: TextStyle = {
  color: colors.text,
  marginTop: spacing.xxs,
  marginHorizontal: spacing.lg,
};

const $bottomContainer: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  marginVertical: spacing.xl,
  marginHorizontal: spacing.md,
  justifyContent: 'space-between',
};

const $dotStyle: ViewStyle = {
  width: spacing.md,
  height: spacing.xs - 1,
  borderRadius: spacing.xxs,
  marginHorizontal: spacing.xxxs,
  backgroundColor: colors.palette.darkGray1,
};

const $dotContainer: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
};

const $arrowIcon: ViewStyle = {
  borderRadius: spacing.xxl,
  paddingHorizontal: spacing.lg,
  paddingVertical: spacing.lg - 3,
  backgroundColor: colors.primary,
};

export const WalkthroughScreen = Walkthrough;
