import { BackButtom, Screen, Text, TextField } from '../components';
import {
    StyleSheet,
    TouchableOpacity,
    View,
    Image,
} from 'react-native';
import React, { FC, useState, useRef } from 'react';
import { spacing, images, colors } from '../theme';
import { AppStackScreenProps } from '../navigators/AppStack';
import { translate } from '../i18n';
import { DataType, DropDownList, sizeForSheet } from '../components/DropDownList';
import { TrueSheet } from '@lodev09/react-native-true-sheet';

type NavigationProps = AppStackScreenProps<'JobPost'>;
type Props = NavigationProps;



export const nomineeList: DataType[] = [
    { title: 'A', id: '1' },
    { title: 'B', id: '2' },
    { title: 'C', id: '3' },
    { title: 'D', id: '4' },
    { title: 'E', id: '5' },
];



const JobPost: FC<Props> = (props) => {

    const dropDownRef = useRef<TrueSheet>(null);
    const [jobTitle, setJobtitle] = useState('');
    const [relashipNominee, setRelashipNominee] = useState<DataType | null>(null);
    const [description, setDescription] = useState('');


    return (
        <Screen
            preset="scroll"
            contentContainerStyle={styles.container}
            safeAreaEdges={['top']}
        >
            {/* HEADER */}
            <BackButtom headingTx="jobPost.heading" />ß

            <View style={styles.main}>
                {/* STEP BAR */}
                <View style={styles.stepContainer}>
                    <Text tx="jobPost.step1Label" weight="semiBold" />
                    <Text tx="jobPost.step1Details" size="xs" style={styles.stepRight} />
                </View>

                <View style={styles.progressBar}>
                    <View style={styles.progressFill} />
                </View>

                {/* TITLE */}
                <Text
                    tx="jobPost.step1Title"
                    weight="bold"
                    size="lg"
                    style={styles.title}
                />
                <Text
                    tx="jobPost.step1Subtitle"
                    size="xs"
                    style={styles.subtitle}
                />

                {/* FORM */}

                <View style={styles.formContainer}>

                    {/* Job Title */}
                    <Text tx="jobPost.jobTitleLabel" weight="medium" />
                    <TextField
                        value={jobTitle}
                        onChangeText={setJobtitle}
                        placeholderTx="jobPost.jobTitlePlaceholder"
                        containerStyle={styles.input}
                    />

                    {/* Category */}
                    <Text tx="jobPost.categoryLabel" weight="medium" />

                    <TouchableOpacity
                        onPress={() => dropDownRef.current?.present()}
                        style={styles.dropdownButton}
                    >
                        <Text
                            text={relashipNominee?.title || translate('jobPost.selectCategory')}
                            size="sm"
                        />
                        <Image
                            source={images.rightArrow}
                            style={styles.dropdownArrow}
                        />
                    </TouchableOpacity>

                    <DropDownList
                        ref={dropDownRef}
                        data={nomineeList}
                        selectedId={relashipNominee?.id}
                        onSelect={(data: DataType) => setRelashipNominee(data)}
                        sizes={sizeForSheet(nomineeList.length,)}
                    />

                    {/* <TextField
                    value={category}
                    onChangeText={setCategory}
                    placeholder="Select Category"
                    containerStyle={styles.input}
                /> */}

                    {/* Job Type */}
                    {/* <Text text="Job Type" weight="medium" />
                <TextField
                    placeholder="Select Job Type"
                    containerStyle={styles.input}
                /> */}

                    {/* Description */}
                    <Text tx="jobPost.descriptionLabel" weight="medium" />
                    <TextField
                        value={description}
                        onChangeText={setDescription}
                        placeholderTx="jobPost.descriptionPlaceholder"
                        containerStyle={[styles.input, styles.textArea]}
                        multiline
                    />

                </View>

                {/* BUTTON */}
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => props.navigation.navigate("JobPostStep2")}
                >
                    <Text
                        tx="jobPost.continueButton"
                        weight="semiBold"
                        style={styles.buttonText}
                    />
                </TouchableOpacity>
            </View>
        </Screen>
    );
};

const styles = StyleSheet.create({

    container: {
        flexGrow: 1,
        backgroundColor: colors.palette.jobPostBackground,
    },

    main: {
        marginHorizontal: spacing.md,
    },

    stepContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: spacing.sm,
    },

    stepRight: {
        color: colors.palette.grayText,
    },

    progressBar: {
        height: 6,
        backgroundColor: colors.palette.lightGray,
        borderRadius: 10,
        marginTop: spacing.xs,
        marginBottom: spacing.md,
    },

    progressFill: {
        width: '50%',
        height: '100%',
        backgroundColor: colors.palette.primaryBlue,
        borderRadius: 10,
    },

    title: {
        marginTop: spacing.sm,
    },

    subtitle: {
        marginTop: 4,
        color: colors.palette.grayText,
    },

    formContainer: {
        marginTop: spacing.lg,
        gap: spacing.sm,
    },

    input: {
        marginTop: 6,
        marginBottom: spacing.sm,
    },

    dropdownButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 6,
        marginBottom: spacing.sm,
        paddingHorizontal: spacing.md,
        paddingVertical: 12,
        backgroundColor: colors.palette.white,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.palette.borderGray,
    },

    dropdownArrow: {
        width: 20,
        height: 20,
        transform: [{ rotate: '90deg' }],
    },

    textArea: {
        height: 120,
    },

    button: {
        marginTop: spacing.lg,
        backgroundColor: colors.palette.primaryBlue,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },

    buttonText: {
        color: colors.palette.white,
    },

});

export const JobPostScreen = JobPost;