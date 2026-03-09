// import {
//   ImageSourcePropType,
//   StyleProp,
//   StyleSheet,
//   View,
//   ViewStyle,
// } from 'react-native';
// import React, {useEffect, useState} from 'react';
// import Star from './Star';

// export type TapRatingProps = {
//   /**
//    * Total number of ratings to display.
//    *
//    * @default 5
//    */
//   count?: number;

//   /**
//    * Initial value for the rating
//    *
//    * @default 0
//    */
//   defaultRating?: number;

//   /**
//    * Style for star container
//    *
//    * @default undefined
//    */
//   starContainerStyle?: StyleProp<ViewStyle>;

//   /**
//    * Callback method when the user finishes rating. Gives you the final rating value as a whole number
//    */
//   onFinishRating?: (rating: number) => void;

//   /**
//    * Whether the rating can be modiefied by the user
//    *
//    * @default false
//    */
//   isDisabled?: boolean;

//   /**
//    * Color value for filled stars.
//    *
//    * @default #004666
//    */
//   selectedColor?: string;

//   /**
//    * Size of rating image
//    *
//    * @default 40
//    */
//   size?: number;

//   /**
//    * Pass in a custom base image source
//    */
//   starImage?: ImageSourcePropType;
// };

// export const TapRating: React.FunctionComponent<TapRatingProps> = ({
//   count = 5,
//   defaultRating = 0,
//   onFinishRating,
//   ...rest
// }) => {
//   const [position, setPosition] = useState<number>(defaultRating ?? 0);

//   useEffect(() => {
//     if (defaultRating === undefined) {
//       setPosition(0);
//     } else {
//       setPosition(defaultRating);
//     }
//   }, [defaultRating]);

//   const renderStars = (rating_array: React.ReactNode[]) => {
//     return rating_array.map(star => {
//       return star;
//     });
//   };

//   const starSelectedInPosition = (index: number) => {
//     if (typeof onFinishRating === 'function') {
//       onFinishRating(index);
//     }

//     setPosition(index);
//   };

//   const rating_array: React.ReactNode[] = [];
//   const starContainerStyle: StyleProp<ViewStyle>[] = [styles.starContainer];

//   if (rest.starContainerStyle) {
//     starContainerStyle.push(starContainerStyle);
//   }

//   [...Array(count).keys()].map(index => {
//     rating_array.push(
//       <Star
//         key={index}
//         position={index + 1}
//         starSelectedInPosition={value => {
//           starSelectedInPosition(value);
//         }}
//         fill={position >= index + 1}
//         {...rest}
//       />,
//     );
//   });

//   return <View style={starContainerStyle}>{renderStars(rating_array)}</View>;
// };

// const styles = StyleSheet.create({
//   starContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
// });
