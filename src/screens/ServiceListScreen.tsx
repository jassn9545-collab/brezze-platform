import { BackButtom, Button, Screen, Text, TextField,  } from '../components';
import {
    Image,
    StyleSheet,
    View,
    TouchableOpacity,
} from 'react-native';
import React, { FC } from 'react';
import { images, spacing, colors } from '../theme';
import { AppBottomTabScreenProps } from '../navigators/BottomTabNavigator';

type NavigationProps = AppBottomTabScreenProps<'Service'>;
type Props = NavigationProps;

const Service: FC<Props> = () => {

    const services = [
        {
            title: 'Switchbox Installation',
            description: 'Installed in specified area for new power outlet',
            price: 'AUD $49.00',
            time: '30 mins',
            rating: '4.8',
            image: images.switchbox,
        },
        {
            title: 'AC Switchbox Installation',
            description: 'Installed in specified area for new power outlet',
            price: 'AUD $49.00',
            time: '30 mins',
            rating: '4.8',
            image: images.switchbox,
        },
        {
            title: 'Fan Regulator Installation',
            description: 'Installed in specified area for new power outlet',
            price: 'AUD $49.00',
            time: '30 mins',
            rating: '4.8',
            image: images.switchbox,
        },
    ];

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
                    // LeftAccessory={leftAccessory}

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

            {services.map((item, index) => (

                <View key={index} style={styles.serviceCard}>

                    <View style={styles.serviceContent}>

                        <View style={styles.ratingRow}>
                            <Text text={'⭐ ' + item.rating} size="xs" />
                            <Text tx="Services.reviews" text=" (20K Reviews)" size="xs" />
                        </View>

                        <Text text={item.title} weight="semiBold" />

                        <Text
                            text={item.description}
                            size="xs"
                            style={styles.descriptionText}
                        />

                        <View style={styles.priceRow}>
                            <Text text={item.price} weight="semiBold" style={styles.priceText} />
                            <Text text={'  |  ' + item.time} size="xs" style={styles.timeText} />
                        </View>

                        <Button
                            style={styles.addButton}
                            tx="Services.addService"
                            textStyle={styles.addButtonText}
                        />

                    </View>

                    <Image
                        source={item.image}
                        style={styles.serviceImage}
                    />

                </View>

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
    }

});

export const ServiceListScreen = Service;