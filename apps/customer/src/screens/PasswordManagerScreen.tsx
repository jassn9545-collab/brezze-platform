import React, { FC, useMemo, useRef, useState } from 'react';
import { Image, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { useToast } from 'react-native-toast-notifications';
import { buildError, changePasswordSchema } from '../apis/schema';
import { updateAccountPassword } from '../apis/account';
import { BackButtom, Button, Screen, Text } from '../components';
import { TextField, TextFieldAccessoryProps } from '../components/TextField';
import { colors, images, spacing } from '../theme';
import { TxKeyPath } from '../i18n';

type FieldError = {
  currentPassword?: TxKeyPath;
  password?: TxKeyPath;
  confirmPassword?: TxKeyPath;
};

export const PasswordManagerScreen: FC = () => {
  const toast = useToast();
  const newPasswordField = useRef<TextInput>(null);
  const confirmField = useRef<TextInput>(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<FieldError>({});
  const [submitting, setSubmitting] = useState(false);

  const visibilityAccessory = (
    visible: boolean,
    onPress: () => void,
  ) =>
    // eslint-disable-next-line react/no-unstable-nested-components
    function VisibilityAccessory(props: TextFieldAccessoryProps) {
    return (
      <TouchableOpacity style={props.style} onPress={onPress} accessibilityLabel={visible ? 'Hide password' : 'Show password'}>
        <Image source={visible ? images.eyeCloseIcon : images.eyeIcon} resizeMode="contain" />
      </TouchableOpacity>
    );
  };

  const CurrentAccessory = useMemo(
    () => visibilityAccessory(showCurrent, () => setShowCurrent(value => !value)),
    [showCurrent],
  );
  const NewAccessory = useMemo(
    () => visibilityAccessory(showNew, () => setShowNew(value => !value)),
    [showNew],
  );
  const ConfirmAccessory = useMemo(
    () => visibilityAccessory(showConfirm, () => setShowConfirm(value => !value)),
    [showConfirm],
  );

  const submit = async () => {
    if (submitting) return;
    try {
      const params = await changePasswordSchema.validate(
        { currentPassword, password, confirmPassword },
        { abortEarly: false },
      );
      setError({});
      setSubmitting(true);
      await updateAccountPassword(params.currentPassword, params.password, params.confirmPassword);
      setCurrentPassword('');
      setPassword('');
      setConfirmPassword('');
      toast.show('Password updated successfully.', { type: 'success' });
    } catch (submitError) {
      if (submitError && typeof submitError === 'object' && 'inner' in submitError) {
        setError(buildError<FieldError>(submitError as never));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen preset="auto" safeAreaEdges={['top', 'bottom']} contentContainerStyle={styles.container}>
      <BackButtom heading="Password Manager" />
      <View style={styles.form}>
        <Text text="Update your password regularly to keep your account secure." size="sm" style={styles.subtitle} />
        <TextField
          value={currentPassword}
          onChangeText={setCurrentPassword}
          placeholder="Current Password"
          secureTextEntry={!showCurrent}
          autoComplete="off"
          textContentType="none"
          importantForAutofill="no"
          RightAccessory={CurrentAccessory}
          helperTx={error.currentPassword}
          status={error.currentPassword ? 'error' : undefined}
          containerStyle={styles.field}
          onSubmitEditing={() => newPasswordField.current?.focus()}
        />
        <TextField
          ref={newPasswordField}
          value={password}
          onChangeText={setPassword}
          placeholder="New Password"
          secureTextEntry={!showNew}
          autoComplete="off"
          textContentType="none"
          importantForAutofill="no"
          RightAccessory={NewAccessory}
          helperTx={error.password}
          status={error.password ? 'error' : undefined}
          containerStyle={styles.field}
          onSubmitEditing={() => confirmField.current?.focus()}
        />
        <TextField
          ref={confirmField}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Confirm new password"
          secureTextEntry={!showConfirm}
          autoComplete="off"
          textContentType="none"
          importantForAutofill="no"
          RightAccessory={ConfirmAccessory}
          helperTx={error.confirmPassword}
          status={error.confirmPassword ? 'error' : undefined}
          containerStyle={styles.field}
          returnKeyType="done"
          onSubmitEditing={submit}
        />
        <Button
          text={submitting ? 'Updating…' : 'Update Password'}
          onPress={submit}
          disabled={submitting}
          style={styles.button}
        />
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: colors.background },
  form: { paddingHorizontal: spacing.md },
  subtitle: { marginTop: spacing.lg, marginBottom: spacing.md, color: colors.textDim, lineHeight: 20 },
  field: { marginBottom: spacing.md },
  button: { marginTop: spacing.xxs },
});
