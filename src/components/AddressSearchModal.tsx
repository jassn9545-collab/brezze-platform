import { AddressPrediction, LatLng } from './Address.types';
import {
  FlatList,
  Image,
  Modal,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, { Details, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import React, { useEffect, useReducer, useRef, useState } from 'react';
import { colors, images, spacing } from '../theme';
import { currentPosition, getCurrentLoaction } from '../utils/Location';
import {
  debouncedSearch,
  getPlaceDetails,
  reverseGeocoding,
} from '../apis/googleAPIs';

import { Button } from './Button';
import { Loader } from './Loader';
import { Screen } from './Screen';
import { Text } from './Text';
import { TextField } from './TextField';
import { TxKeyPath } from '../i18n';
import { delay, LATITUDE_DELTA, LONGITUDE_DELTA } from '../utils/util';
import moment from 'moment';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export interface AddressParam {
  address: string;
  location: LatLng;
}

export type AddressSearchModalProps = {
  showCurrent?: boolean;
  onSelect: (country: AddressParam) => void;
  isVisible: boolean;
  onClose: () => void;
  title: TxKeyPath;
  current?: LatLng;
};

export const AddressSearchModal = ({
  showCurrent = false,
  onSelect,
  isVisible,
  onClose,
  title,
  current = currentPosition,
}: AddressSearchModalProps) => {
  const input = useRef<TextInput>(null);
  const map = useRef<MapView>(null);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [, forceUpdate] = useReducer(x => x + 1, 0);
  const [results, setResults] = useState<AddressPrediction[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<AddressParam>();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (query !== '') {
      (async () => {
        try {
          const address = await debouncedSearch(query);
          if (address) {
            setResults(address);
          }
        } catch (error) {
          console.log('Error is address search:', error);
        }
      })();
    }
  }, [query]);

  const close = () => {
    onClose();
    setResults([]);
    setQuery('');
  };

  const onSelectAddress = (item: AddressPrediction) => {
    input.current?.blur();
    setLoading(true);
    setQuery(item.description ?? '');
    if (input.current) {
      input.current.setNativeProps({ text: item.description });
    }
    const time = moment();
    getPlaceDetails(item.place_id)
      .then(address => {
        setQuery(item.description ?? '');
        (async () => {
          // For a Symmetric UI Refresh
          const diff = moment().diff(time);
          if (diff < 500) {
            await delay(500 - diff);
          }
          setLoading(false);
          setSelectedAddress({
            address: item.description ?? address.formatted_address ?? '',
            location: address.geometry.location,
          });
          map.current?.animateToRegion({
            latitude: address.geometry.location.lat,
            longitude: address.geometry.location.lng,
            latitudeDelta: LATITUDE_DELTA,
            longitudeDelta: LONGITUDE_DELTA,
          });
        })();
      })
      .catch(error => toast.show(error.message, { type: 'danger' }));
  };

  const onRegionChange = async (region: Region, detail: Details) => {
    if (loading) {
      return;
    }
    if (detail.isGesture && !input.current?.isFocused()) {
      const address = await reverseGeocoding({
        lat: region.latitude,
        lng: region.longitude,
      });
      setSelectedAddress({
        address: address.formatted_address ?? '',
        location: address.geometry.location,
      });
      setQuery(address.formatted_address ?? '');
    }
  };

  const onCurrentSelect = () => {
    input.current?.blur();
    setLoading(true);
    getCurrentLoaction(position => {
      reverseGeocoding({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      }).then(address => {
        setQuery(address.formatted_address ?? '');
        setSelectedAddress({
          address: address.formatted_address ?? '',
          location: address.geometry.location,
        });
        setTimeout(() => {
          map.current?.animateToRegion({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            latitudeDelta: LATITUDE_DELTA,
            longitudeDelta: LONGITUDE_DELTA,
          });
          setLoading(false);
        }, 2000);
      });
    });
  };

  const done = () => {
    if (selectedAddress) {
      onSelect(selectedAddress);
      close();
    }
  };

  return (
    <Modal animationType="slide" transparent={false} visible={isVisible}>
      <Screen
        preset="fixed"
        statusBarProps={{ backgroundColor: colors.background }}
        safeAreaEdges={Platform.OS === 'ios' ? ['top'] : []}
        contentContainerStyle={styles.container}
      >
        <TouchableOpacity onPress={close} style={styles.header}>
          <Image
            source={images.leftArrow}
            resizeMode="contain"
            style={styles.back}
          />
          <Text tx={title} preset="heading" size="lg" />
        </TouchableOpacity>
        <View style={styles.topConatiner}>
          <TextField
            ref={input}
            autoCorrect={false}
            autoCapitalize="none"
            autoComplete="off"
            placeholderTx="countries.search"
            value={query}
            autoFocus
            onFocus={() => forceUpdate()}
            onChangeText={text => setQuery(text)}
          />
        </View>
        {!(input.current?.isFocused() ?? true) ? (
          <View style={styles.map}>
            <MapView
              ref={map}
              maxZoomLevel={17}
              showsUserLocation={true}
              showsMyLocationButton={false}
              provider={PROVIDER_GOOGLE}
              initialRegion={{
                latitude: current?.lat ?? selectedAddress?.location.lat ?? 0,
                longitude: current?.lng ?? selectedAddress?.location.lng ?? 0,
                latitudeDelta: LATITUDE_DELTA,
                longitudeDelta: LONGITUDE_DELTA,
              }}
              onRegionChange={() => input.current?.blur()}
              onRegionChangeComplete={onRegionChange}
              style={styles.mapView}
              mapPadding={{
                top: 0,
                left: 0,
                right: 0,
                bottom: insets.bottom + spacing.xl,
              }}
            />
            <View
              style={[
                styles.markerFixed,
                { marginTop: -(insets.bottom + spacing.md + 48) },
              ]}
            >
              <Image style={styles.marker} source={images.address} />
            </View>
            <Loader loading={loading} inOutAnimation={false} />
          </View>
        ) : (
          <>
            {showCurrent && (
              <TouchableOpacity
                style={styles.myLocation}
                onPress={() => onCurrentSelect()}
              >
                <Image
                  source={images.myLocationRounded}
                  style={styles.myLocationImage}
                />
                <Text tx="ride.currentAddress" />
              </TouchableOpacity>
            )}
            <Text
              tx="ride.addresses"
              preset="subheading"
              size="md"
              style={styles.subHeading}
            />
            <FlatList
              data={results}
              style={styles.flatlist}
              keyExtractor={item => item.place_id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.resultItem}
                  onPress={() => onSelectAddress(item)}
                >
                  <Text>{item.description}</Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text
                  tx="ride.noAddresses"
                  preset="subheading"
                  size="sm"
                  style={styles.noAddress}
                />
              }
            />
          </>
        )}
        {selectedAddress && !input.current?.isFocused() && (
          <Button
            tx="ride.chooseAddress"
            style={[styles.button, { bottom: insets.bottom + spacing.sm }]}
            onPress={done}
          />
        )}
      </Screen>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
  header: {
    marginBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.md,
  },
  back: {
    marginRight: spacing.xs,
  },
  subHeading: {
    marginVertical: spacing.sm,
    marginHorizontal: spacing.md,
  },
  topConatiner: {
    marginHorizontal: spacing.md,
  },
  map: {
    flex: 1,
    marginTop: spacing.md,
  },
  mapView: {
    flex: 1,
  },
  markerFixed: {
    left: '50%',
    marginLeft: -24,
    position: 'absolute',
    top: '50%',
  },
  marker: {
    height: 48,
    width: 48,
    resizeMode: 'contain',
  },
  flatlist: {
    flex: 1,
    marginHorizontal: spacing.md,
  },
  resultItem: {
    borderBottomWidth: 1,
    borderBottomColor: colors.textDim,
    padding: spacing.sm,
  },
  myLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    marginHorizontal: spacing.md,
  },
  myLocationImage: {
    height: spacing.md + spacing.xxs,
    width: spacing.md + spacing.xxs,
    resizeMode: 'center',
    marginRight: spacing.xs,
  },
  noAddress: {
    marginTop: spacing.xxl,
    textAlign: 'center',
  },
  button: {
    position: 'absolute',
    right: spacing.md,
    left: spacing.md,
  },
});
