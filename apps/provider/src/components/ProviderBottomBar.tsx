import React from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, images, spacing } from '../theme';
import { Text } from './Text';

const tabs = [
  { name: 'Home', icon: images.home, label: 'bottomTab.Home' },
  { name: 'HireJobs', icon: images.hireJobs, label: 'bottomTab.HireJobs' },
  { name: 'Chat', icon: images.chat, label: 'bottomTab.Chat' },
  { name: 'Profile', icon: images.profile, label: 'bottomTab.Profile' },
] as const;

export type ProviderBottomTabName = (typeof tabs)[number]['name'];

type Props = {
  activeTab?: ProviderBottomTabName;
  onTabPress: (tab: ProviderBottomTabName) => void;
  onTabLongPress?: (tab: ProviderBottomTabName) => void;
  onAddCatalog: () => void;
  chatUnreadCount?: number;
  accessibilityLabels?: Partial<Record<ProviderBottomTabName, string>>;
};

export const ProviderBottomBar = ({
  activeTab,
  onTabPress,
  onTabLongPress,
  onAddCatalog,
  chatUnreadCount = 0,
  accessibilityLabels,
}: Props) => {
  const insets = useSafeAreaInsets();

  const renderTab = (tab: (typeof tabs)[number]) => (
    <TouchableOpacity
      key={tab.name}
      style={styles.dockTab}
      accessibilityRole="button"
      accessibilityState={activeTab === tab.name ? { selected: true } : undefined}
      accessibilityLabel={
        accessibilityLabels?.[tab.name] ??
        (tab.name === 'HireJobs' ? 'Hire Jobs' : tab.name)
      }
      onPress={() => onTabPress(tab.name)}
      onLongPress={() => onTabLongPress?.(tab.name)}
    >
      <View style={styles.iconContainer}>
        <Image
          source={tab.icon}
          style={styles.dockIcon}
          tintColor={colors.palette.white}
        />
        {tab.name === 'Chat' && chatUnreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text
              size="xxs"
              weight="bold"
              text={chatUnreadCount > 99 ? '99+' : String(chatUnreadCount)}
              style={styles.unreadBadgeText}
            />
          </View>
        )}
      </View>
      <Text
        tx={tab.label}
        size="xxs"
        weight="medium"
        style={styles.dockLabel}
      />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.dock, { paddingBottom: Math.max(insets.bottom, spacing.xs) }]}>
      <View style={styles.dockRow}>
        {tabs.slice(0, 2).map(renderTab)}
        <View style={styles.dockSpacer} />
        {tabs.slice(2).map(renderTab)}
      </View>
      <TouchableOpacity
        style={styles.addButton}
        accessibilityRole="button"
        accessibilityLabel="Add Catalog"
        onPress={onAddCatalog}
      >
        <View style={styles.plusHorizontal} />
        <View style={styles.plusVertical} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  dock: {
    backgroundColor: colors.primary,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  dockRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dockTab: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xxs,
  },
  dockSpacer: {
    width: spacing.xxxl,
  },
  dockIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  iconContainer: {
    position: 'relative',
  },
  unreadBadge: {
    minWidth: 18,
    height: 18,
    top: -9,
    right: -12,
    borderRadius: 9,
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1,
    borderColor: colors.palette.white,
    backgroundColor: colors.error,
  },
  unreadBadgeText: {
    color: colors.palette.white,
    lineHeight: 14,
  },
  dockLabel: {
    color: colors.palette.white,
  },
  addButton: {
    position: 'absolute',
    top: -spacing.lg,
    alignSelf: 'center',
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 5,
    borderColor: colors.palette.white,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusHorizontal: {
    position: 'absolute',
    width: spacing.lg,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.palette.white,
  },
  plusVertical: {
    position: 'absolute',
    width: 3,
    height: spacing.lg,
    borderRadius: 2,
    backgroundColor: colors.palette.white,
  },
});
