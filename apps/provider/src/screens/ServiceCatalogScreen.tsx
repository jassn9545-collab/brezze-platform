import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { FC, useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { AppStackScreenProps } from '../navigators';
import { BackButtom, Screen, Text } from '../components';
import { Service } from './ProfileScreen';
import { colors, spacing } from '../theme';
import {
  getServiceCatalogs,
  ProviderCatalog,
} from '../apis/catalogs';

type Props = AppStackScreenProps<'ServiceCatalog'>;

const ServiceCatalog: FC<Props> = props => {
  const [catalogs, setCatalogs] = useState<ProviderCatalog[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCatalogs = useCallback(async () => {
    setLoading(true);
    try {
      setCatalogs(await getServiceCatalogs());
    } catch {
      // The API interceptor displays the server error.
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadCatalogs();
    }, [loadCatalogs]),
  );

  return (
    <Screen
      preset="fixed"
      safeAreaEdges={['top']}
      contentContainerStyle={styles.container}
    >
      <BackButtom
        headingTx="drawer.serviceCatalogs"
        rightComponent={
          <TouchableOpacity
            onPress={() => props.navigation.navigate('AddCatalogModal')}
          >
            <Text
              size="xxs"
              weight="semiBold"
              tx="profile.addCatalog"
              style={styles.primaryText}
            />
          </TouchableOpacity>
        }
      />
      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          style={styles.flatlist}
          data={catalogs}
          keyExtractor={item => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
          ListEmptyComponent={
            <Text
              size="xs"
              tx="profile.noCatalogs"
              style={styles.emptyText}
            />
          }
          renderItem={info => <Service {...info} />}
        />
      )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
  contentContainer: {
    flexGrow: 1,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
  },
  flatlist: {
    flex: 1,
    marginHorizontal: spacing.md,
  },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: colors.textDim,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  primaryText: {
    color: colors.primary,
    marginRight: spacing.md,
  },
});

export const ServiceCatalogScreen = ServiceCatalog;
