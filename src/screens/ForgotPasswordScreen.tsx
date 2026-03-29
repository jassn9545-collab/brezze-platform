import { AuthHeader, Button, Screen } from '../components';
import { Keyboard, View, ViewStyle } from 'react-native';
import React, { FC, useState } from 'react';
import { TextField } from '../components/TextField';
import { buildError, forgotPasswordSchema } from '../apis/schema';
import { spacing } from '../theme';

import { AuthStackScreenProps } from '../navigators';
import { TxKeyPath } from '../i18n';
import { emailLeftAccessory } from './LoginScreen';

type Props = AuthStackScreenProps<'ForgotPassword'>;

type FieldError = {
    email?: TxKeyPath | undefined;
};

const ForgotPassword: FC<Props> = props => {
    //   const dispatch = useAppDispatch();
    //   const loadingState = useAppSelector(
    //     store => store.auth.forgotPasswordLoading,
    //   );
    const [email, setEmail] = useState('');
    const [error, setError] = useState<FieldError>({});

    //   useEffect(() => {
    //     if (loadingState === 'loaded') {
    //       dispatch(authActions.resetForgotPasswordLoading());
    //     }
    //   }, [dispatch, loadingState]);

    const validate = () => {
        forgotPasswordSchema
            .validate(
                {
                    email,
                },
                { abortEarly: false },
            )
            .then(res => {
                Keyboard.dismiss();
                props.navigation.navigate('Verification', {
                    email: res.email,
                    from: 'forgotPassword',
                    serviceSid: '',
                    user_id: 1,
                });
                // dispatch(forgotPassword(res));
                setError({});
            })
            .catch(errors => {
                const err = buildError<FieldError>(errors);
                setError(err);
            });
    };

    return (
        <>
            <Screen
                preset="auto"
                safeAreaEdges={['top']}
                contentContainerStyle={$containerStyle}
            >
                <AuthHeader
                    tx="forgotPassword.heading"
                    desc="forgotPassword.description"
                />
                <View style={$main}>
                    <TextField
                        value={email}
                        onChangeText={setEmail}
                        containerStyle={$inputContainer}
                        keyboardType="email-address"
                        placeholderTx="forgotPassword.emailPlaceholder"
                        returnKeyType="done"
                        LeftAccessory={emailLeftAccessory}
                        helperTx={error?.email}
                        status={error?.email ? 'error' : undefined}
                    />
                    <Button
                        tx="forgotPassword.send"
                        onPress={validate}
                        style={$buttonStyle}
                    />
                </View>
            </Screen>
            {/* <Loader loading={loadingState === 'loading'} /> */}
        </>
    );
};

const $containerStyle: ViewStyle = {
    flexGrow: 1,
};

const $main: ViewStyle = {
    flex: 1,
    marginHorizontal: spacing.md,
};

const $inputContainer: ViewStyle = {
    marginTop: spacing.xl,
};

const $buttonStyle: ViewStyle = {
    borderRadius: spacing.xs,
    marginVertical: spacing.lg,
};
export const ForgotPasswordScreen = ForgotPassword;
