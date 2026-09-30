import {
  BackButtom,
  Button,
  Screen,
  TapRating,
  Text,
  TextField,
} from '../components';
import {
  Image,
  StyleSheet,
  Switch,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { FC, useState } from 'react';
import { AppStackScreenProps } from '../navigators';
import { colors, images, spacing, typography } from '../theme';
import { searchLeftAccessory } from './HomeScreen';
import { TxKeyPath } from '../i18n';
import RangeSlider from '../components/RangeSlider';

type NavigationProps = AppStackScreenProps<'AdvanceFilter'>;
// type StoreProps = ConnectedProps<typeof connector>;
type Props = NavigationProps;

interface DateFilterType {
  id: 'one' | 'week' | 'month' | '';
  title: TxKeyPath;
}
const dateFilters: DateFilterType[] = [
  { id: 'one', title: 'job.postedOption1' },
  { id: 'week', title: 'job.postedOption2' },
  { id: 'month', title: 'job.postedOption3' },
];

const AdvanceFilter: FC<Props> = props => {
  const [category, setCategory] = useState('');
  const [selectedDate, setSelectedDate] = useState<
    'one' | 'week' | 'month' | ''
  >('');
  const [paymentVerified, setPaymentVerified] = useState<boolean>(false);
  const [rangeFilter, setRangeFilter] = useState<{
    min: number;
    max: number;
  }>({
    min: 400,
    max: 3200,
  });
  const [rating, setRating] = useState<number>(4);

  const rightHeaderComponent = React.useMemo(
    () => (
      <TouchableOpacity>
        <Image resizeMode="contain" source={images.threeDotIcon} />
      </TouchableOpacity>
    ),
    [],
  );

  React.useEffect(() => {
    props.navigation.setOptions({
      gestureEnabled: false,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onPressDateFilter = (data: DateFilterType) => {
    setSelectedDate(prev => (prev === data.id ? '' : data.id));
  };

  const onPressFilter = () => {};
  return (
    <Screen
      preset="auto"
      safeAreaEdges={['top']}
      contentContainerStyle={styles.container}
    >
      <BackButtom
        arrow={images.crossIcon}
        arrowColor={colors.primary}
        headingTx="job.advancefilter"
        style={{
          marginHorizontal: spacing.md,
        }}
        rightComponent={rightHeaderComponent}
      />
      <View style={styles.main}>
        <TextField
          value={category}
          onChangeText={setCategory}
          LeftAccessory={searchLeftAccessory}
          labelTx="job.chooseCategory"
          LabelTextProps={{
            style: {
              fontSize: spacing.sm,
              color: colors.textDim,
              fontFamily: typography.primary.semiBold,
            },
          }}
          placeholderTx="job.searchCategory"
        />

        <View>
          <Text
            size="xxs"
            weight="semiBold"
            style={styles.textDim}
            tx="job.postedWithin"
          />
          <View style={styles.wrapDateFilters}>
            {dateFilters.map(item => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.singleDateFilter,
                  item.id === selectedDate && styles.selectedDateFilter,
                ]}
                onPress={() => onPressDateFilter(item)}
              >
                <Text
                  size="xs"
                  tx={item.title}
                  weight={item.id === selectedDate ? 'semiBold' : 'regular'}
                  style={{
                    color:
                      item.id === selectedDate
                        ? colors.palette.white
                        : undefined,
                  }}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.spaceBetween}>
          <Text
            size="xxs"
            weight="semiBold"
            style={styles.textDim}
            tx="job.paymentVerified"
          />
          <Switch
            thumbColor={colors.palette.white}
            onValueChange={value => setPaymentVerified(value)}
            value={paymentVerified}
            trackColor={{
              true: colors.primary,
              false: colors.palette.borderColor,
            }}
          />
        </View>

        <View>
          <Text
            size="xxs"
            weight="semiBold"
            style={styles.textDim}
            tx="job.price"
          />
          <RangeSlider
            min={0}
            max={4000}
            step={1}
            values={[rangeFilter.min, rangeFilter.max]}
            onValuesChange={range =>
              setRangeFilter({ min: range.min, max: range.max })
            }
          />
        </View>

        <View style={styles.alignStart}>
          <Text
            size="xxs"
            weight="semiBold"
            style={styles.textDim}
            tx="job.clientRating"
          />
          <TapRating
            size={spacing.lg}
            selectedColor="orange"
            defaultRating={rating}
            count={5}
            onFinishRating={setRating}
          />
        </View>

        <Button tx="job.applyFilter" onPress={onPressFilter} />
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
  main: {
    gap: spacing.md,
    margin: spacing.md,
  },
  wrapDateFilters: {
    flex: 1,
    gap: spacing.xs,
    flexWrap: 'wrap',
    flexDirection: 'row',
    marginTop: spacing.xs,
  },
  singleDateFilter: {
    borderWidth: 0.5,
    borderRadius: spacing.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs + 2,
    backgroundColor: colors.background,
    borderColor: colors.palette.borderColor,
  },
  selectedDateFilter: {
    backgroundColor: colors.primary,
  },
  textDim: {
    color: colors.textDim,
  },
  spaceBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ratingStarContainer: {
    gap: spacing.lg,
    paddingVertical: spacing.xs,
  },
  ratingStar: {
    gap: spacing.xxs,
    backgroundColor: colors.transparent,
    padding: spacing.xxs,
    paddingHorizontal: spacing.xs,
    borderRadius: spacing.xs,
  },
  alignStart: { gap: spacing.xxs, alignItems: 'flex-start' , marginBottom: spacing.md},
});

// const mapStateToProps = (state: RootState) => ({
//   totalcount: state.auth.totalNotifications,
//   notification: state.auth.userNotifications,
//   fetching: state.auth.userNotificationsLoading,
// });

// const mapDispatch = {
//   get: getNotifications,
// };

// const connector = connect(mapStateToProps, mapDispatch);

export const AdvanceFilterScreen = AdvanceFilter;
