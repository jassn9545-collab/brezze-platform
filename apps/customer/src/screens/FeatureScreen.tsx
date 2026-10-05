import { BackButtom, ProfessionalCard, Screen, Text, TextField } from '../components';
import {
    ActivityIndicator,
    Image,
    StyleSheet,
    View,
} from 'react-native';
import React, { FC, useEffect, useMemo, useState } from 'react';
import { colors, images } from '../theme';
import { AppBottomTabScreenProps } from '../navigators/BottomTabNavigator';
import { DiscoveryProfessional, getDiscovery } from '../apis/discovery';

type Props = AppBottomTabScreenProps<'FeaturedProfessionals'>;

const Feature: FC<Props> = props => {

    const [professionals, setProfessionals] = useState<DiscoveryProfessional[]>([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState('');

    useEffect(() => {
        let active = true;
        getDiscovery()
            .then(data => {
                if (active) setProfessionals(data.professionals);
            })
            .catch(() => {
                if (active) setProfessionals([]);
            })
            .finally(() => {
                if (active) setLoading(false);
            });
        return () => { active = false; };
    }, []);

    const visibleProfessionals = useMemo(() => {
        const search = query.trim().toLowerCase();
        if (!search) return professionals;
        return professionals.filter(item =>
            [item.name, item.profile_title, ...item.categories.map(category => category.name)]
                .filter(Boolean)
                .join(' ')
                .toLowerCase()
                .includes(search),
        );
    }, [professionals, query]);

    return (
        <Screen
            preset="scroll"
            contentContainerStyle={styles.container}
            safeAreaEdges={['top']}
        >

            <BackButtom
                headingTx="Featured.Professional"
                onBackPress={() => props.navigation.goBack()}
            />

            {/* SEARCH BAR */}

            <View style={styles.secondSection}>
                <View style={styles.searchContainer}>

                    <Image
                        source={images.searchIcon}
                        style={{ width: 16, height: 16 }}
                    />

                    <TextField
                        placeholder="Search for professionals..."
                        containerStyle={styles.searchField}
                        inputWrapperStyle={{
                            borderWidth: 0,
                            backgroundColor: 'transparent',
                        }}
                        style={{
                            marginVertical: 0,
                            marginHorizontal: 0,
                            padding: 0,
                        }}
                        value={query}
                        onChangeText={setQuery}
                    />

                </View>
            </View>

            {/* FEATURED PROFESSIONAL LIST */}

            {loading ? (
                <ActivityIndicator color={colors.primary} style={styles.loading} />
            ) : visibleProfessionals.length === 0 ? (
                <Text text="No professionals found." style={styles.emptyText} />
            ) : visibleProfessionals.map(item => (
                <ProfessionalCard
                    key={item.id}
                    professional={item}
                    onPress={() => props.navigation.navigate('ProfessionalProfile', { id: item.id })}
                />
            ))}

        </Screen>
    );
};

const styles = StyleSheet.create({

    container: {
        flexGrow: 1,
        paddingBottom: 20,
        backgroundColor: "#F5F6FA"
    },

   categoryHeader: {
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 25,
        marginBottom: 10,
    },

    backIcon: {
        position: 'absolute',
        left: 15,
    },

    headerTitle: {
        textAlign: 'center',
    },

    secondSection: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        marginTop: 15
    },

    searchContainer: {
        flex: 1,
        height: 48,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        borderRadius: 10,
        paddingHorizontal: 12
    },

    searchField: {
        flex: 1,
        marginLeft: 10,
    },

    loading: { marginTop: 40 },
    emptyText: { textAlign: 'center', marginTop: 40, color: colors.textDim },

});

export const FeatureScreen = Feature;
