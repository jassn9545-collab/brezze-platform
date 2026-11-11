import * as React from 'react';

import {
  Dimensions,
  StyleProp,
  Text,
  TextStyle,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  ViewStyle,
} from 'react-native';
import { colors, typography } from '../theme';
import { translate, TxKeyPath } from '../i18n';

const viewPortHeight = Dimensions.get('window').height - 80;

const defaultItems = ['edit'] as const;
export type MenuItem = (typeof defaultItems)[number];

interface ContextMenuProps {
  /**
   * Data of file of folder item
   */
  type: 'file' | 'folder';
  /**
   * Press action
   */
  onPress: (item: string) => void;
  /**
   * top anchore
   */
  topAnchor: number;
  /**
   * container view port height
   */
  containerViewHeight?: number;
  /**
   * Hide event
   */
  onHide: () => void;
  /**
   * Primary Item
   */
  primary?: boolean;
  /**
   *  Item
   */
  items?: readonly string[];
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  type,
  onPress,
  primary,
  topAnchor = 28,
  containerViewHeight = viewPortHeight,
  onHide,
  items = defaultItems,
}) => {
  const menuItems =
    type === 'file' ? items : primary ? items : items.slice(0, 2);

  const top =
    containerViewHeight <= topAnchor + menuItems.length * 40
      ? containerViewHeight - menuItems.length * 40
      : topAnchor;

  return (
    <TouchableWithoutFeedback onPress={onHide}>
      <View style={ContainerView}>
        <View style={[MainViewStyle, { top }]}>
          {menuItems.map((value, index) => (
            <TouchableOpacity
              onPress={() => {
                onHide();
                onPress(value);
              }}
              style={[
                RowStyle,
                index === menuItems.length - 1
                  ? { backgroundColor: colors.primaryDimmed + '80' }
                  : null,
              ]}
              key={value}
            >
              <Text style={ItemStyle}>
                {translate(`context.${value}` as TxKeyPath)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const RowStyle: StyleProp<ViewStyle> = {
  paddingVertical: 8,
  paddingLeft: 24,
  paddingRight: 36,
  borderRadius: 10,
  backgroundColor: colors.primary + '80',
};

const MainViewStyle: StyleProp<ViewStyle> = {
  position: 'absolute',
  right: 18,
  backgroundColor: colors.background,
  padding: 4,
  gap: 4,
  borderRadius: 12,

  shadowColor: colors.palette.black,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.2,
  shadowRadius: 6,
  elevation: 5,
};

const ContainerView: StyleProp<ViewStyle> = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: colors.primary + '10',
};

const ItemStyle: StyleProp<TextStyle> = {
  color: colors.text,
  fontFamily: typography.primary.semiBold,
  fontSize: 15,
};
