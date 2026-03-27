import { BackButtom, Button, Screen, Text, TextField } from '../components';
import { Image, Keyboard, TextStyle, View, ViewStyle } from 'react-native';
import React, { FC, useState } from 'react';
import { AppStackScreenProps } from '../navigators';
import { colors, images, spacing } from '../theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TripCell } from './ActiveJobScreen';
import { TxKeyPath } from '../i18n';
import { buildError, SubmitWorkParams, submitWorkSchema } from '../apis/schema';

type NavigationProps = AppStackScreenProps<'SubmitWork'>;
// type StoreProps = ConnectedProps<typeof connector>;
type Props = NavigationProps;

type FieldError = {
  description?: TxKeyPath | undefined;
};

const SubmitWork: FC<Props> = () => {
  const insets = useSafeAreaInsets();
  const [description, setDescription] = useState('');

  const [error, setError] = useState<FieldError>({});

  const validate = () => {
    let addCatalogParams: SubmitWorkParams = {
      description,
    };
    submitWorkSchema
      .validate(addCatalogParams, { abortEarly: false })
      .then(params => {
        Keyboard.dismiss();
        console.log('params', params);
        setError({});
      })
      .catch(errors => {
        const err = buildError<FieldError>(errors);
        setError(err);
      });
  };

  return (
    <>
      <BackButtom
        headingTx="job.submitWork"
        style={{
          paddingHorizontal: spacing.md,
          paddingTop: insets.top + spacing.sm,
        }}
      />
      <Screen preset="auto" contentContainerStyle={$container}>
        <TripCell item={1} index={1} />

        <View style={$main}>
          <TextField
            multiline
            value={description}
            onChangeText={setDescription}
            containerStyle={$input}
            inputWrapperStyle={{ borderRadius: spacing.md }}
            labelTx="job.explainWorkDetails"
            placeholderTx="job.explainWorkDetailsPlaceholder"
            helperTx={error?.description}
            status={error?.description ? 'error' : undefined}
          />

          <View style={$imageHeading}>
            <Text
              size="xs"
              weight="semiBold"
              tx="job.proofWork"
              style={{ color: colors.textDim }}
            />
            <Text
              size="xxs"
              tx="job.maxphotos"
              style={{ color: colors.textDim }}
            />
          </View>

          <View style={$photoUpload}>
            <Image source={images.camera} />
            <Text
              size="xxs"
              tx="job.addPhoto"
              style={{ color: colors.textDim }}
            />
          </View>

          <View style={$paymentProccess}>
            <Image
              source={images.infoIcon}
              style={{ marginTop: spacing.xxs }}
            />
            <View style={$flexShrink}>
              <Text
                size="sm"
                weight="semiBold"
                style={$darkRedText}
                tx="job.paymentProcess"
              />
              <Text
                size="xxs"
                style={$darkRedText}
                tx="job.paymentProcessDescription"
              />
            </View>
          </View>
        </View>
      </Screen>
      <Button
        tx="job.submitWorkLabel"
        onPress={validate}
        style={[$buttonStyle, { marginBottom: insets.bottom + spacing.sm }]}
      />
    </>
  );
};

const $container: ViewStyle = {
  flexGrow: 1,
};

const $main: ViewStyle = {
  margin: spacing.md,
};

const $input: ViewStyle = {
  marginBottom: spacing.sm,
};

const $imageHeading: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
};

const $photoUpload: ViewStyle = {
  borderWidth: 1,
  gap: spacing.xxs,
  alignItems: 'center',
  padding: spacing.md,
  borderStyle: 'dashed',
  marginTop: spacing.sm,
  alignSelf: 'flex-start',
  borderRadius: spacing.xs,
  paddingVertical: spacing.lg,
};

const $paymentProccess: ViewStyle = {
  gap: spacing.sm,
  padding: spacing.md,
  flexDirection: 'row',
  borderRadius: spacing.md,
  marginVertical: spacing.md,
  backgroundColor: colors.palette.lightYellow,
};

const $flexShrink: ViewStyle = {
  flexShrink: 1,
};

const $darkRedText: TextStyle = {
  color: colors.error,
};

const $buttonStyle: ViewStyle = {
  marginHorizontal: spacing.md,
};

// const mapStateToProps = (state: RootState) => ({
//   totalcount: state.auth.totalNotifications,
//   notification: state.auth.userNotifications,
//   fetching: state.auth.userNotificationsLoading,
// });

// const mapDispatch = {
//   get: getNotifications,
// };

// const connector = connect(mapStateToProps, mapDispatch);

export const SubmitWorkScreen = SubmitWork;
