// import * as React from 'react';

// import {
//   Dimensions,
//   StyleProp,
//   Text,
//   TextStyle,
//   TouchableOpacity,
//   TouchableWithoutFeedback,
//   View,
//   ViewStyle,
// } from 'react-native';
// import { colors, typography } from '../theme';
// import { translate } from '../i18n';

// const viewPortHeight = Dimensions.get('window').height - 80;
// const items = ['edit', 'delete', 'primary'] as const;
// export type MenuItem = (typeof items)[number];

// interface ContextMenuProps {
//   /**
//    * Data of file of folder item
//    */
//   type: 'file' | 'folder';
//   /**
//    * Press action
//    */
//   onPress: (item: MenuItem) => void;
//   /**
//    * top anchore
//    */
//   topAnchor: number;
//   /**
//    * container view port height
//    */
//   containerViewHeight?: number;
//   /**
//    * Hide event
//    */
//   onHide: () => void;
//   /**
//    * Primary Item
//    */
//   primary: boolean;
// }

// export const ContextMenu: React.FC<ContextMenuProps> = ({
//   type,
//   onPress,
//   primary,
//   topAnchor = 28,
//   containerViewHeight = viewPortHeight,
//   onHide,
// }) => {
//   const item =
//     type === 'file'
//       ? primary
//         ? items.filter(i => i !== 'primary')
//         : items
//       : items.slice(0, 2);
//   const top =
//     containerViewHeight <= topAnchor + item.length * 40
//       ? containerViewHeight - item.length * 40
//       : topAnchor;

//   return (
//     <TouchableWithoutFeedback onPress={onHide}>
//       <View style={ContainerView}>
//         <View style={[MainViewStyle, { top }]}>
//           {item.map((value, index) => {
//             const label =
//               value === 'primary'
//                 ? primary
//                   ? 'primary'
//                   : 'markPrimary'
//                 : value;

//             return (
//               <TouchableOpacity
//                 onPress={() => {
//                   onHide();
//                   onPress(value);
//                 }}
//                 style={[
//                   RowStyle,
//                   index === item.length - 1
//                     ? { backgroundColor: colors.palette.secondaryColor + 80 }
//                     : null,
//                 ]}
//                 key={value}
//               >
//                 <Text style={ItemStyle}>{translate(`payment.${label}`)}</Text>
//               </TouchableOpacity>
//             );
//           })}
//         </View>
//       </View>
//     </TouchableWithoutFeedback>
//   );
// };

// const RowStyle: StyleProp<ViewStyle> = {
//   paddingVertical: 8,
//   paddingLeft: 24,
//   paddingRight: 36,
//   borderRadius: 10,
//   backgroundColor: colors.primary + 80,
// };

// const MainViewStyle: StyleProp<ViewStyle> = {
//   position: 'absolute',
//   right: 18,
//   backgroundColor: colors.background,
//   padding: 4,
//   gap: 4,
//   borderRadius: 12,
//   boxShadow: [
//     {
//       offsetX: 0,
//       offsetY: 0,
//       blurRadius: '10px',
//       spreadDistance: '4px',
//       color: colors.palette.black + 10,
//     },
//   ],
// };

// const ContainerView: StyleProp<ViewStyle> = {
//   position: 'absolute',
//   top: 0,
//   left: 0,
//   right: 0,
//   bottom: 0,
//   backgroundColor: colors.primary + 10,
// };

// const ItemStyle: StyleProp<TextStyle> = {
//   color: colors.text,
//   fontFamily: typography.primary.semiBold,
//   fontSize: 15,
// };
