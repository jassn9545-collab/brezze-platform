import { BackButtom, Button, Screen, Text, TextField } from '../components';
import {
    ActivityIndicator,
    Image,
    StyleSheet,
    View,
    TouchableOpacity,
} from 'react-native';
import React, { FC, useCallback, useMemo, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { images, spacing, colors } from '../theme';
import { Currency } from '../config/defaults';
import { DiscoveryService, getDiscovery } from '../apis/discovery';

type Props = {
    route?: { params?: { categoryId?: number; categoryName?: string } };
    navigation: { navigate: (screen: string, params?: Record<string, unknown>) => void };
};

const Service: FC<Props> = props => {

    const categoryId = props.route?.params?.categoryId;
    const categoryName = props.route?.params?.categoryName;
    const [services, setServices] = useState<DiscoveryService[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState(false);
    const [query, setQuery] = useState('');

    const loadServices = useCallback(() => {
        let active = true;
        setLoading(true);
        setLoadError(false);
        getDiscovery({ categoryId })
            .then(data => {
                if (active) setServices(data.services ?? []);
            })
            .catch(() => {
                if (active) setLoadError(true);
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => {
            active = false;
        };
    }, [categoryId]);

    useFocusEffect(loadServices);

    const visibleServices = useMemo(() => {
        const search = query.trim().toLowerCase();
        if (!search) return services;

        return services.filter(service =>
            [service.heading, service.description, service.provider_name, service.provider_title]
                .filter(Boolean)
                .join(' ')
                .toLowerCase()
                .includes(search),
        );
    }, [query, services]);

    const openService = (service: DiscoveryService) => {
        props.navigation.navigate('ServiceDetails', {
            providerId: service.provider_id,
            initialCatalogId: service.id,
        });
    };

    return (
        <Screen
            preset="scroll"
            contentContainerStyle={styles.container}
            safeAreaEdges={['top']}
        >

            {/* HEADER */}

            {/* <View style={styles.categoryHeader}>
                <Image source={images.leftArrow} style={styles.backIcon} />

                <Text
                    tx="Services.List"
                    weight="semiBold"
                    size="lg"
                    style={styles.headerTitle}
                />
            </View> */}
            <BackButtom headingTx='Services.List' />

            {/* SEARCH */}

            <View style={styles.searchContainer}>
                <TextField
                    placeholderTx="Services.Searchservices"
                    containerStyle={styles.flex}
                    value={query}
                    onChangeText={setQuery}
                />

                <TouchableOpacity style={styles.searchButton}>
                    <Image
                        source={images.searchService}
                    />
                </TouchableOpacity>
            </View>

            {/* <View style={styles.searchIconContainer}>
                    <Image
                        source={images.searchIcon}
                        style={styles.searchIcon}
                    />
                </View> */}

            {/* </View> */}

            {/* SERVICE LIST */}

            {loading ? (
                <ActivityIndicator color={colors.primary} style={styles.loading} />
            ) : loadError ? (
                <View style={styles.emptyState}>
                    <Image source={images.service} style={styles.emptyIcon} />
                    <Text
                        text="Services could not be loaded. Please try again."
                        size="sm"
                        style={styles.emptyText}
                    />
                    <Button
                        text="Retry"
                        style={styles.retryButton}
                        onPress={loadServices}
                    />
                </View>
            ) : visibleServices.length === 0 ? (
                <View style={styles.emptyState}>
                    <Image source={images.service} style={styles.emptyIcon} />
                    <Text
                        text={categoryName
                            ? `No ${categoryName} services have been added yet.`
                            : 'No freelancer services are available yet.'}
                        size="sm"
                        style={styles.emptyText}
                    />
                </View>
            ) : visibleServices.map(item => (

                <TouchableOpacity
                    key={item.id}
                    style={styles.serviceCard}
                    onPress={() => openService(item)}
                >

                    <View style={styles.serviceContent}>

                        <View style={styles.ratingRow}>
                            <Text text={`⭐ ${item.provider_rating || 'New'}`} size="xs" />
                            <Text text={` (${item.review_count} reviews)`} size="xs" />
                        </View>

                        <Text text={item.heading} weight="semiBold" numberOfLines={2} />
                        <Text
                            text={item.description}
                            size="xs"
                            numberOfLines={2}
                            style={styles.descriptionText}
                        />

                        <View style={styles.priceRow}>
                            <Text
                                text={`${Currency.code} ${Currency.sign}${Number(item.price).toFixed(2)}`}
                                weight="semiBold"
                                style={styles.priceText}
                            />
                            <Text text="  |  Service" size="xs" style={styles.timeText} />
                        </View>

                        <Button
                            style={styles.addButton}
                            tx="Services.addService"
                            textStyle={styles.addButtonText}
                            onPress={() => openService(item)}
                        />

                    </View>

                    <Image
                        source={item.image_urls[0] ? { uri: item.image_urls[0] } : images.service}
                        style={styles.serviceImage}
                        resizeMode="cover"
                    />

                </TouchableOpacity>

            ))}

        </Screen>
    );
};

// export const leftAccessory = (props: TextFieldAccessoryProps) => {
//     return (
//         <View style={[props.style, styles.inputAccessoryStyle]}>
//             <Image source={images.searchIcon} />
//         </View>
//     );
// };

const styles = StyleSheet.create({

    container: {
        flexGrow: 1,
        paddingBottom: 20,
        backgroundColor: colors.palette.jobPostBackground
    },
    inputAccessoryStyle: {
        marginVertical: spacing.sm,
        height: 24,
    },
  

    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: spacing.md,
        gap: spacing.xs,
        top: 5
    },

    flex: { flex: 1 },

    textFieldContainer: {
        flex: 1,
        justifyContent: 'center',
    },

    searchButton: {
        height: 54,
        width: 54,
        borderRadius: spacing.xs,
        backgroundColor: colors.palette.white,
        justifyContent: 'center',
        alignItems: 'center',
    },

  

    textFieldWrapper: {
        borderWidth: 0,
        backgroundColor: 'transparent',
        minHeight: 0,
        paddingVertical: 0,
    },

    textField: {
        paddingVertical: 0,
        marginVertical: 0,
        height: 20,
    },

    serviceContent: {
        flex: 1,
        marginTop: 10,
    },

    descriptionText: {
        marginTop: 4,
    },
    priceText: {
        color: colors.palette.primaryBlue,
    },

    timeText: {
        color: colors.palette.primaryColor,
        fontWeight: '600',
        fontSize: 10,
    },

    serviceCard: {
        flexDirection: 'row',
        backgroundColor: colors.palette.offWhite,
        marginHorizontal: 15,
        marginTop: 15,
        borderRadius: 16,
        padding: 15,
        alignItems: 'center',
        elevation: 2
    },

    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6
    },

    priceRow: {
        flexDirection: 'row',
        marginTop: 8
    },

    serviceImage: {
        width: 100,
        height: 100,
        borderRadius: 10,
        marginLeft: 10
    },

    addButton: {
        marginTop: 10,
        width: 100,
        borderRadius: 4,
        backgroundColor: colors.palette.primaryDimmed,
    },

    addButtonText: {
        fontFamily: 'Roboto',
        fontWeight: '500',
        fontSize: 10,
        lineHeight: 15,
        letterSpacing: 0,
        color: colors.palette.primaryColor,
    },
    loading: { marginTop: spacing.xl },
    emptyState: { alignItems: 'center', padding: spacing.xl },
    emptyIcon: { width: 56, height: 56, resizeMode: 'contain', tintColor: colors.primary },
    emptyText: { color: colors.textDim, textAlign: 'center', marginTop: spacing.sm },
    retryButton: { marginTop: spacing.md, minHeight: 44, width: 120 },

});

export const ServiceListScreen = Service;
