import { Image, ImageSourcePropType, StyleSheet, View } from 'react-native';
import { Button, Screen, Text } from '../components';
import { colors, spacing } from '../theme';
import { AppStackScreenProps } from '../navigators';
import { FC } from 'react';
import { TxKeyPath } from '../i18n';
import { useAppDispatch } from '../store/hooks';
import { authActions } from '../slices/auth.slice';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Props = AppStackScreenProps<'CenterModal'>;

export type CenterModalParams = {
    from: 'logout';
    desc: TxKeyPath;
    title: TxKeyPath;
    btnText: TxKeyPath;
    image: ImageSourcePropType;
};

export const CenterModal: FC<Props> = props => {
    const dispatch = useAppDispatch();

    const onPressClose = () => {
        props.navigation.goBack();
    };

    const onConfirm = () => {
        dispatch(authActions.setAuthroized(false));
        AsyncStorage.setItem('authorized', 'false');
        // if (props.route.params.modalType === 'logout') {
        //   dispatch(userLogout())
        // }
    };

    return (
        <Screen
            preset="fixed"
            contentContainerStyle={styles.container}
            backgroundColor={colors.palette.overlay50}
        >
            <View style={styles.main}>
                <Image
                    source={props.route.params.image}
                    style={{ marginBottom: spacing.xs }}
                />
                <Text
                    tx={props.route.params.title}
                    size="lg"
                    weight="semiBold"
                    style={styles.textCenter}
                />
                <Text
                    size="sm"
                    weight="regular"
                    style={styles.description}
                    tx={props.route.params.desc}
                />

                <Button
                    tx={props.route.params.btnText}
                    style={styles.buttonStyle}
                    onPress={onConfirm}
                />
                <Text tx="common.cancel" onPress={onPressClose} />
            </View>
        </Screen>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    main: {
        width: '90%',
        gap: spacing.xxs,
        padding: spacing.lg,
        alignItems: 'center',
        borderRadius: spacing.xl,
        paddingBottom: spacing.xl,
        backgroundColor: colors.background,
    },
    textCenter: {
        textAlign: 'center',
    },
    description: {
        textAlign: 'center',
        color: colors.textDim,
    },
    buttonStyle: {
        width: '80%',
        marginTop: spacing.md,
        marginBottom: spacing.sm,
        borderRadius: spacing.xs,
    },
});
