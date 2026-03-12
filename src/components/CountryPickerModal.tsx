import React, {useState} from 'react';
import {
  Modal,
  FlatList,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
  Platform,
  Image,
  ImageStyle,
} from 'react-native';

import CountriesArray from './countries.json';
import {Screen} from './Screen';
import {TextField} from './TextField';
import {Text} from './Text';
import { images, spacing} from '../theme';

export type Country = {
  name: string;
  flag: string;
  code: string;
  dial_code: string;
};

export const countries: Country[] = CountriesArray;

export type CountryPickerProps = {
  onSelect: (country: Country) => void;
  modalVisible: boolean;
  onClose: () => void;
};

export const CountryPickerModal = ({
  onSelect,
  modalVisible,
  onClose,
}: CountryPickerProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const filteredCountries = countries.filter(
    country =>
      country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      country.dial_code.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const close = () => {
    onClose();
    setSearchTerm('');
  };

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={modalVisible}
      onRequestClose={close}>
      <Screen
        preset="fixed"
        safeAreaEdges={Platform.OS === 'ios' ? ['top', 'bottom'] : ['bottom']}
        contentContainerStyle={$modal}>
        <TouchableOpacity onPress={close} style={$header}>
          <Image source={images.leftArrow} resizeMode="contain" style={$back} />
          <Text tx="countries.heading" preset="heading" size="lg" />
        </TouchableOpacity>
        <TextField
          placeholderTx="countries.search"
          value={searchTerm}
          onChangeText={text => setSearchTerm(text)}
        />
        <Text
          tx="countries.countries"
          preset="subheading"
          size="md"
          style={$subHeading}
        />
        <FlatList
          data={filteredCountries}
          style={$main}
          showsVerticalScrollIndicator={false}
          keyExtractor={item => item.code}
          renderItem={({item}) => (
            <TouchableOpacity
              onPress={() => {
                onSelect(item);
                setSearchTerm('');
              }}>
              <Text
                size="sm"
                style={
                  $texts
                }>{`${item.flag}  ${item.dial_code} ${item.name}`}</Text>
            </TouchableOpacity>
          )}
        />
      </Screen>
    </Modal>
  );
};

const $modal: ViewStyle = {
  flexGrow: 1,
  paddingHorizontal: spacing.md,
};

const $header: ViewStyle = {
  marginBottom: spacing.md,
  flexDirection: 'row',
  alignItems: 'center',
};

const $back: ImageStyle = {
  marginRight: spacing.xs,
};

const $subHeading: TextStyle = {
  marginVertical: spacing.sm,
};

const $main: ViewStyle = {
  flex: 1,
};

const $texts: TextStyle = {
  marginBottom: spacing.sm,
  marginLeft: spacing.sm,
};
