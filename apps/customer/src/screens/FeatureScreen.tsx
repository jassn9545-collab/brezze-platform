import { Button, Screen, Text, TextField } from '../components';
import {
    Image,
    StyleSheet,
    View,
} from 'react-native';
import React, { FC } from 'react';
import { colors, images } from '../theme';


const Feature: FC = () => {

    const professionals = [
        {
            name: 'Austin Lane',
            role: 'Master Electrician & House Pipe Fitting',
            badge: 'TOP RATED',
            jobs: '450+',
            success: '98%',
            image: images.profile1,
        },
        {
            name: 'Sarah Williams',
            role: 'Interior Design & Renovation',
            badge: 'NEW EXPERT',
            jobs: '120',
            success: '100%',
            image: images.profile2,
        },
    ];

    return (
        <Screen
            preset="scroll"
            contentContainerStyle={styles.container}
            safeAreaEdges={['top']}
        >

            {/* HEADER */}

            <View style={styles.categoryHeader}>
                <Image source={images.leftArrow} style={styles.backIcon} />
                    
                <Text tx="Featured.Professional" weight="semiBold" size="lg" style={styles.headerTitle} />
            </View>

            {/* SEARCH BAR */}

            <View style={styles.secondSection}>
                <View style={styles.searchContainer}>

                    <Image
                        source={images.searchIcon}
                        style={{ width: 16, height: 16 }}
                    />

                    <TextField
                        placeholder="Search for professionals..."
                        containerStyle={{ flex: 1 }}
                        inputWrapperStyle={{
                            borderWidth: 0,
                            backgroundColor: 'transparent',
                        }}
                        style={{
                            marginVertical: 0,
                            marginHorizontal: 0,
                            padding: 0,
                        }}
                    />

                </View>
            </View>

            {/* FEATURED PROFESSIONAL LIST */}

            {professionals.map((item, index) => (
                <View key={index} style={styles.card}>

                    {/* TOP PROFILE */}

                    <View style={styles.cardTop}>
                        <Image source={item.image} style={styles.profileImage} />

                        <View style={{ flex: 1, marginLeft: 10 }}>

                            <View style={styles.nameRow}>
                                <Text text={item.name} weight="semiBold" />

                                <View
                                    style={{
                                        width: 20,
                                        height: 20,
                                        borderRadius: 10,
                                        backgroundColor: '#3B82F6',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                    }}
                                >
                                    <Image
                                        source={images.checkIcon}
                                        style={{ width: 12, height: 12, tintColor: '#fff' }}
                                    />
                                </View>
                            </View>

                            <View style={styles.badge}>
                                <Text text={item.badge} size="xxs" />
                            </View>

                            <Text text={item.role} size="xs" />

                        </View>
                    </View>

                    {/* DIVIDER */}

                    <View style={styles.divider} />

                    {/* STATS */}

                    <View style={styles.statsRow}>

                        <View style={styles.statBox}>
                            <Text text={item.jobs} weight="semiBold" />
                            <Text text="TOTAL JOBS" size="xxs" />
                        </View>

                        <View style={styles.verticalDivider} />

                        <View style={styles.statBox}>
                            <Text text={item.success} weight="semiBold" />
                            <Text text="SUCCESS RATE" size="xxs" />
                        </View>

                    </View>

                    {/* BUTTON */}

                    <Button
                        text="Hire Now"
                        style={styles.hireButton}
                    />

                </View>
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

    /* CARD */

    card: {
        backgroundColor: '#fff',
        marginHorizontal: 15,
        marginTop: 15,
        borderRadius: 16,
        padding: 15,
        elevation: 3
    },

    cardTop: {
        flexDirection: 'row',
        alignItems: 'center'
    },

    profileImage: {
        width: 60,
        height: 60,
        borderRadius: 12
    },

    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6
    },

    badge: {
        backgroundColor: '#FFE9CC',
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 4,
        marginVertical: 4
    },

    divider: {
        height: 1,
        backgroundColor: '#eee',
        marginVertical: 12
    },

    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center'
    },

    statBox: {
        alignItems: 'center'
    },

    verticalDivider: {
        width: 1,
        height: 30,
        backgroundColor: '#ddd'
    },

    hireButton: {
        marginTop: 15,
        borderRadius: 12,
        backgroundColor: colors.primary
    }

});

export const FeatureScreen = Feature;