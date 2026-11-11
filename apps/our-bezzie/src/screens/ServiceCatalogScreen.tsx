import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { FC, useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { AppStackScreenProps } from '../navigators';
import { BackButtom, Button, ContextMenu, Screen, Text } from '../components';
import { ProviderBottomBar } from '../components/ProviderBottomBar';
import { Service } from './ProfileScreen';
import { colors, images, spacing } from '../theme';
import { getServiceCatalogs, ProviderCatalog } from '../apis/catalogs';

type Props = AppStackScreenProps<'ServiceCatalog'>;

type MenuState = { visible: false } | { visible: true; anchor: number };

const ServiceCatalog: FC<Props> = props => {
  const [catalogs, setCatalogs] = useState<ProviderCatalog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [menu, setMenu] = useState<MenuState>({ visible: false });

  const loadCatalogs = useCallback(async (refresh = false) => {
    if (refresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setLoadError(false);
    try {
      setCatalogs(await getServiceCatalogs());
    } catch {
      // The API interceptor shows a toast; keep a retry action on this screen.
      setLoadError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadCatalogs();
    }, [loadCatalogs]),
  );

  const openAddCatalog = () => {
    setMenu({ visible: false });
    props.navigation.navigate('AddCatalogModal');
  };

  return (
    <>
      <Screen
        preset="fixed"
        safeAreaEdges={['top']}
        contentContainerStyle={styles.container}
      >
        <BackButtom
          headingTx="drawer.serviceCatalogs"
          rightComponent={
            <TouchableOpacity
              style={styles.menuButton}
              accessibilityRole="button"
              accessibilityLabel="Catalog options"
              onPress={event =>
                setMenu({
                  visible: true,
                  anchor: event.nativeEvent.pageY - event.nativeEvent.locationY + spacing.xxl,
                })
              }
            >
              <Image source={images.threeDotIcon} style={styles.menuIcon} resizeMode="contain" />
            </TouchableOpacity>
          }
        />
        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : loadError && catalogs.length === 0 ? (
          <View style={styles.centered}>
            <Text tx="catalog.loadFailed" size="xs" style={styles.message} />
            <Button tx="catalog.retry" onPress={() => loadCatalogs()} style={styles.emptyAction} />
          </View>
        ) : (
          <FlatList
            style={styles.flatlist}
            data={catalogs}
            keyExtractor={item => item.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.contentContainer}
            refreshing={refreshing}
            onRefresh={() => loadCatalogs(true)}
            ListEmptyComponent={
              <View style={styles.centered}>
                <Text tx="profile.noCatalogs" size="xs" style={styles.message} />
                <Button tx="profile.addCatalog" onPress={openAddCatalog} style={styles.emptyAction} />
              </View>
            }
            renderItem={info => <Service {...info} />}
          />
        )}
        <ProviderBottomBar
          onTabPress={tab =>
            props.navigation.navigate('Drawer', {
              screen: 'BottomTab',
              params: { screen: tab },
            })
          }
          onAddCatalog={openAddCatalog}
        />
      </Screen>
      {menu.visible && (
        <ContextMenu
          type="file"
          items={['addCatalog']}
          topAnchor={menu.anchor}
          onPress={openAddCatalog}
          onHide={() => setMenu({ visible: false })}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxl,
  },
  flatlist: {
    flex: 1,
    marginHorizontal: spacing.md,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  message: {
    color: colors.textDim,
    textAlign: 'center',
  },
  emptyAction: {
    marginTop: spacing.md,
    minWidth: 170,
  },
  menuButton: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIcon: {
    width: spacing.lg,
    height: spacing.lg,
  },
});

export const ServiceCatalogScreen = ServiceCatalog;
