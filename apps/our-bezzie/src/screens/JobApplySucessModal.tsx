import { Image, StyleSheet, View } from 'react-native';
import { Screen, Text } from '../components';
import { colors, images, spacing } from '../theme';
import { AppStackScreenProps } from '../navigators';
import { FC, useEffect } from 'react';

type Props = AppStackScreenProps<'JobApplySucessModal'>;

export const JobApplySucessModal: FC<Props> = (props) => {
    
  useEffect(() => {
    setTimeout(() => {
      props.navigation.reset({
        index: 0,
        routes: [{ name: 'Drawer' }],
      });
    }, 1000);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Screen
      preset="fixed"
      contentContainerStyle={styles.container}
      backgroundColor={colors.palette.overlay50}
    >
      <View style={styles.main}>
        <Image source={images.successTick} />
        <Text
          size="sm"
          weight="medium"
          tx="home.jobProposalSubmit"
          style={styles.title}
        />
        <Text
          size="xs"
          tx="home.jobProposalSubmitDesc"
          style={styles.description}
        />
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
    gap: spacing.xs,
    padding: spacing.lg,
    alignItems: 'center',
    borderRadius: spacing.md,
    paddingBottom: spacing.xl,
    marginHorizontal: spacing.lg,
    backgroundColor: colors.background,
  },
  title: {
    textAlign: 'center',
    marginHorizontal: spacing.xl,
  },
  description: {
    textAlign: 'center',
    color: colors.textDim,
  },
});
