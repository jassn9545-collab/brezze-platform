import { BackButtom, Button, Screen, Text, TextField } from '../components';
import { Keyboard, StyleSheet, TouchableOpacity, View } from 'react-native';
import React, { FC, useState, useRef } from 'react';
import { spacing, colors } from '../theme';
import { AppStackScreenProps } from '../navigators/AppStack';
import {
  DataType,
  DropDownList,
  DropDownRightAccessory,
  sizeForSheet,
} from '../components/DropDownList';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { TxKeyPath } from '../i18n';
import { connect, ConnectedProps } from 'react-redux';
import { RootState } from '../store';
import { ValidationError } from 'yup';
import { buildError, JobPostFirstSchema } from '../apis/schema';

type NavigationProps = AppStackScreenProps<'JobPost'>;
type StoreProps = ConnectedProps<typeof connector>;
type Props = NavigationProps & StoreProps;

type FieldError = {
  title?: TxKeyPath | undefined;
  category?: TxKeyPath | undefined;
  description?: TxKeyPath | undefined;
};

const JobPost: FC<Props> = props => {
  const dropDownRef = useRef<TrueSheet>(null);
  const [title, setTitle] = useState(props.route.params?.title ?? '');
  const [category, setCategory] = useState<DataType | null>(null);
  const [description, setDescription] = useState(props.route.params?.description ?? '');
  const [error, setError] = useState<FieldError>({});

  const validate = () => {
    JobPostFirstSchema.validate(
      {
        title,
        category: category?.id,
        description,
      },
      { abortEarly: false },
    )
      .then(res => {
        Keyboard.dismiss();
        props.navigation.navigate('JobPostStep2', res);
        setError({});
      })
      .catch((errors: ValidationError) => {
        const err = buildError<FieldError>(errors);
        setError(err);
      });
  };

  return (
    <>
      <Screen
        preset="auto"
        safeAreaEdges={['top']}
        contentContainerStyle={styles.container}
      >
        <BackButtom headingTx="jobPost.heading" />
        <View style={styles.main}>
          <View style={styles.stepContainer}>
            <Text tx="jobPost.step1Label" weight="semiBold" />
            <Text
              tx="jobPost.step1Details"
              size="xs"
              style={styles.stepRight}
            />
          </View>
          <View style={styles.progressBar}>
            <View style={styles.progressFill} />
          </View>

          <Text
            size="xl"
            weight="semiBold"
            style={styles.title}
            tx="jobPost.step1Title"
          />
          <Text tx="jobPost.step1Subtitle" size="xxs" />

          <View style={styles.formContainer}>
            <TextField
              value={title}
              onChangeText={setTitle}
              labelTx="jobPost.jobTitleLabel"
              placeholderTx="jobPost.jobTitlePlaceholder"
              helperTx={error?.title}
              status={error?.title ? 'error' : undefined}
            />

            <TouchableOpacity onPress={() => dropDownRef.current?.present()}>
              <TextField
                editable={false}
                pointerEvents="none"
                value={category?.title ? category?.title : ''}
                labelTx="jobPost.categoryLabel"
                placeholderTx="jobPost.selectCategory"
                helperTx={error?.category}
                status={error?.category ? 'error' : undefined}
                RightAccessory={DropDownRightAccessory}
              />
            </TouchableOpacity>

            <TextField
              value={description}
              onChangeText={setDescription}
              labelTx="jobPost.descriptionLabel"
              placeholderTx="jobPost.descriptionPlaceholder"
              multiline
              helperTx={error?.description}
              status={error?.description ? 'error' : undefined}
            />
          </View>

          <Button
            tx="jobPost.continueButton"
            onPress={validate}
            style={styles.buttonStyle}
          />
        </View>
      </Screen>
      <DropDownList
        ref={dropDownRef}
        data={
          props?.skills?.map(skill => ({ id: skill.id, title: skill.name })) ??
          []
        }
        selectedId={category?.id}
        onSelect={(data: DataType) => setCategory(data)}
        sizes={sizeForSheet(props?.skills!?.length ?? 0)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
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
    marginBottom: spacing.xxs,
  },
  formContainer: {
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  buttonStyle: {
    marginTop: spacing.lg,
    borderRadius: spacing.md,
  },
});

const mapStateToProps = (state: RootState) => ({
  skills: state.setting.basic?.skills,
});

const connector = connect(mapStateToProps);
export const JobPostScreen = connector(JobPost);
