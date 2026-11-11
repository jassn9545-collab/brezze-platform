import React, {FC, useCallback, useMemo, useState} from 'react';
import {AppState, Image, ScrollView, StyleSheet, TextInput, TouchableOpacity, View} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import {Screen, Text} from '../components';
import {AppStackScreenProps} from '../navigators';
import {colors, images, typography} from '../theme';
import {useAppDispatch, useAppSelector} from '../store/hooks';
import {homeActions} from '../slices/home.slice';
import {DEFAULT_JOB_FILTERS, filterJobs, JobFilters, validateJobFilters} from '../utils/jobFilters';
import {watchJobLocation} from '../utils/jobLocation';
import {logFilterStage} from '../utils/jobSearchTiming';

const PRESETS = [5, 25, 50, 100, 150, 300];
const DATE_OPTIONS: {value: JobFilters['postedWithin']; label: string}[] = [
  {value: 'anytime', label: 'Anytime'},
  {value: 'day', label: 'Past 24 hours'},
  {value: 'week', label: 'Past week'},
  {value: 'month', label: 'Past month'},
];

const RadiusMarker = () => <View style={styles.sliderMarker} />;

export const AdvanceFilterScreen: FC<AppStackScreenProps<'AdvanceFilter'>> = ({navigation}) => {
  const dispatch = useAppDispatch();
  const applied = useAppSelector(state => state.home.jobFilters);
  const jobs = useAppSelector(state => state.home.jobSearchSourceJobs);
  const center = useAppSelector(state => state.home.jobSearchLocation);
  const loading = useAppSelector(state => state.home.jobListLoading === 'loading');
  const [draft, setDraft] = useState<JobFilters>({...applied});
  const [sliderWidth, setSliderWidth] = useState(260);
  useFocusEffect(useCallback(() => {
    let stop: (() => void) | undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;
    logFilterStage('focus');
    const frame = requestAnimationFrame(() => logFilterStage('frame'));
    const transition = navigation.addListener('transitionEnd', event => {
      if (!event.data.closing) logFilterStage('transition');
    });
    const updateWatch = () => {
      if (timer) clearTimeout(timer);
      stop?.();
      stop = undefined;
      if (AppState.currentState === 'active') {
        // Let the controls paint before starting native GPS work.
        timer = setTimeout(() => {
          stop = watchJobLocation(location => dispatch(homeActions.updateJobSearchLocation(location)));
        }, 500);
      }
    };
    updateWatch();
    const subscription = AppState.addEventListener('change', updateWatch);
    return () => {if (timer) clearTimeout(timer); stop?.(); subscription.remove();
      cancelAnimationFrame(frame); transition();};
  }, [dispatch, navigation]));
  const error = validateJobFilters(draft);
  const count = useMemo(() => center && !error ? filterJobs(jobs, center, draft).length : 0,
    [jobs, center, draft, error]);
  const setRadius = (radiusKm: number) => setDraft(previous => ({...previous, radiusKm}));
  const apply = () => {
    if (error || !center || loading) return;
    dispatch(homeActions.setJobFilters(draft));
    navigation.goBack();
  };

  return (
    <Screen preset="fixed" safeAreaEdges={['top', 'bottom']} contentContainerStyle={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Close filters"
          onPress={() => navigation.goBack()} style={styles.headerAction}>
          <Image source={images.crossIcon} style={styles.closeIcon} />
        </TouchableOpacity>
        <Text text="Filters" weight="semiBold" style={styles.title} />
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Reset filters"
          onPress={() => setDraft({...DEFAULT_JOB_FILTERS})} style={styles.headerAction}>
          <Text text="Reset" weight="semiBold" style={styles.reset} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.radiusCard}>
          <View style={styles.row}>
            <View style={styles.grow}>
              <Text text="Distance Radius" weight="semiBold" style={styles.sectionTitle} />
              <Text text={`Showing jobs within ${draft.radiusKm} km`} style={styles.description} />
            </View>
            <View style={styles.radiusBadge}>
              <Text text={`${draft.radiusKm} km`} weight="semiBold" style={styles.radiusBadgeText} />
            </View>
          </View>
          <View style={styles.sliderWrap} onLayout={event => setSliderWidth(Math.max(100, event.nativeEvent.layout.width - 24))}
            accessible accessibilityRole="adjustable" accessibilityLabel="Distance radius"
            accessibilityValue={{min: 5, max: 300, now: draft.radiusKm, text: `${draft.radiusKm} kilometres`}}
            accessibilityActions={[{name: 'increment'}, {name: 'decrement'}]}
            onAccessibilityAction={event => setRadius(Math.max(5, Math.min(300,
              draft.radiusKm + (event.nativeEvent.actionName === 'increment' ? 5 : -5))))}>
            <MultiSlider min={5} max={300} step={1} values={[draft.radiusKm]}
              sliderLength={sliderWidth} onValuesChange={(values: number[]) => setRadius(values[0])}
              containerStyle={styles.sliderContainer} trackStyle={styles.sliderTrack}
              selectedStyle={styles.sliderTrack} unselectedStyle={styles.sliderTrack}
              customMarker={RadiusMarker} />
          </View>
          <View style={styles.row}>
            <Text text="5 km" style={styles.scaleLabel} />
            <Text text="150 km" style={styles.scaleLabel} />
            <Text text="300 km Max" style={styles.scaleLabel} />
          </View>
          <Text text="QUICK PRESETS" weight="semiBold" style={styles.presetsLabel} />
          <View style={styles.presets}>
            {PRESETS.map(radius => (
              <TouchableOpacity key={radius} accessibilityRole="button"
                accessibilityLabel={`Radius ${radius} kilometres`} accessibilityState={{selected: draft.radiusKm === radius}}
                onPress={() => setRadius(radius)} style={[styles.preset, draft.radiusKm === radius && styles.selectedPreset]}>
                <Text text={`${radius}\nkm`} weight={draft.radiusKm === radius ? 'semiBold' : 'regular'}
                  style={[styles.presetText, draft.radiusKm === radius && styles.selectedPresetText]} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text text="Budget Range (AUD)" weight="semiBold" style={styles.sectionTitle} />
          <View style={styles.budgetRow}>
            {([{key: 'minBudget', label: 'Minimum (AUD)', placeholder: '0'},
              {key: 'maxBudget', label: 'Maximum (AUD)', placeholder: 'No limit'}] as const).map(field => (
              <View key={field.key} style={styles.grow}>
                <Text text={field.label} style={styles.inputLabel} />
                <View style={styles.budgetInputWrap}>
                  <Text text="$" style={styles.currency} />
                  <TextInput accessibilityLabel={field.label} keyboardType="decimal-pad" maxLength={12}
                    placeholder={field.placeholder} placeholderTextColor={colors.palette.placeholderColor}
                    value={draft[field.key]} onChangeText={value => setDraft(previous => ({...previous, [field.key]: value}))}
                    style={styles.budgetInput} />
                </View>
              </View>
            ))}
          </View>
          {error ? <Text text={error} style={styles.error} accessibilityLiveRegion="polite" /> : null}
        </View>

        <View style={styles.section}>
          <Text text="Date Posted" weight="semiBold" style={styles.sectionTitle} />
          <View style={styles.dateOptions}>
            {DATE_OPTIONS.map(option => (
              <TouchableOpacity key={option.value} accessibilityRole="radio" accessibilityLabel={option.label}
                accessibilityState={{checked: draft.postedWithin === option.value}}
                onPress={() => setDraft(previous => ({...previous, postedWithin: option.value}))}
                style={[styles.dateOption, draft.postedWithin === option.value && styles.selectedOption]}>
                <View style={[styles.radio, draft.postedWithin === option.value && styles.selectedRadio]}>
                  {draft.postedWithin === option.value ? <View style={styles.radioDot} /> : null}
                </View>
                <Text text={option.label} weight={draft.postedWithin === option.value ? 'semiBold' : 'regular'}
                  style={[styles.dateText, draft.postedWithin === option.value && styles.blueText]} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <Text text={`Distance is measured from your current device location. Jobs without a valid location are excluded.`}
          style={styles.note} />
      </ScrollView>

      <View style={styles.footer}>
        {!center && !loading ? <Text text="Waiting for current location. You can set your filters now; allow location access on Jobs if needed." style={styles.error} /> : null}
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Apply filters"
          accessibilityState={{disabled: !!error || !center || loading}}
          disabled={!!error || !center || loading} onPress={apply}
          style={[styles.applyButton, (!!error || !center || loading) && styles.disabled]}>
          <Text text="Apply Filters" weight="semiBold" style={styles.applyText} />
          <View style={styles.countBadge}>
            <Text text={!center ? 'Finding location…' : loading ? 'Checking jobs…' : `${count} ${count === 1 ? 'Job' : 'Jobs'} Found`}
              weight="semiBold" style={styles.countText} />
          </View>
        </TouchableOpacity>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  screen: {flex: 1},
  header: {height: 64, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16,
    borderBottomWidth: 1, borderBottomColor: colors.separator},
  headerAction: {minWidth: 48, minHeight: 48, alignItems: 'center', justifyContent: 'center'},
  closeIcon: {width: 22, height: 22, resizeMode: 'contain', tintColor: colors.text},
  title: {fontSize: 20, color: colors.palette.black},
  reset: {fontSize: 16, color: colors.primary},
  scroll: {flex: 1},
  content: {padding: 16, paddingBottom: 24, gap: 24},
  radiusCard: {borderWidth: 1, borderColor: colors.palette.grayLight2, borderRadius: 18, padding: 16,
    backgroundColor: colors.palette.white},
  row: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8},
  grow: {flex: 1},
  sectionTitle: {fontSize: 16, lineHeight: 24, color: colors.palette.black},
  description: {fontSize: 13, lineHeight: 20, color: colors.textDim, marginTop: 2},
  radiusBadge: {paddingHorizontal: 12, paddingVertical: 6, borderRadius: 24, backgroundColor: colors.primary},
  radiusBadgeText: {fontSize: 16, lineHeight: 24, color: colors.palette.white},
  sliderWrap: {alignItems: 'center', marginTop: 22},
  sliderContainer: {height: 42},
  sliderTrack: {height: 8, borderRadius: 4, backgroundColor: colors.palette.grayLight2},
  sliderMarker: {width: 28, height: 28, borderRadius: 14, borderWidth: 3, borderColor: colors.primary,
    backgroundColor: colors.palette.white, elevation: 3, shadowColor: colors.primary,
    shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.2, shadowRadius: 3},
  scaleLabel: {fontSize: 11, lineHeight: 18, color: colors.palette.placeholderColor},
  presetsLabel: {fontSize: 12, lineHeight: 20, color: colors.palette.placeholderColor, marginTop: 22, marginBottom: 10},
  presets: {flexDirection: 'row', gap: 7},
  preset: {flex: 1, minHeight: 48, borderWidth: 1, borderColor: colors.palette.grayLight2, borderRadius: 9,
    alignItems: 'center', justifyContent: 'center', backgroundColor: colors.palette.offWhite},
  selectedPreset: {backgroundColor: colors.primary, borderColor: colors.primary},
  presetText: {fontSize: 12, lineHeight: 17, textAlign: 'center'},
  selectedPresetText: {color: colors.palette.white},
  section: {gap: 12},
  selectedOption: {borderColor: colors.primary, backgroundColor: '#F3F8FF'},
  blueText: {color: colors.primary},
  note: {fontSize: 11, lineHeight: 17, color: colors.textDim},
  budgetRow: {flexDirection: 'row', gap: 12},
  inputLabel: {fontSize: 11, lineHeight: 18, color: colors.textDim, marginBottom: 6},
  budgetInputWrap: {flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.palette.grayLight2,
    borderRadius: 12, minHeight: 48, paddingHorizontal: 12, gap: 8},
  currency: {fontSize: 17, color: colors.palette.placeholderColor},
  budgetInput: {flex: 1, minWidth: 0, paddingVertical: 10, fontSize: 15,
    color: colors.text, fontFamily: typography.primary.semiBold},
  error: {fontSize: 12, lineHeight: 18, color: colors.error},
  dateOptions: {flexDirection: 'row', flexWrap: 'wrap', gap: 8},
  dateOption: {width: '48%', flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12,
    minHeight: 48, borderWidth: 1, borderColor: colors.palette.grayLight2, borderRadius: 12},
  radio: {width: 18, height: 18, borderWidth: 1, borderColor: colors.textDim,
    borderRadius: 9, alignItems: 'center', justifyContent: 'center'},
  selectedRadio: {backgroundColor: colors.primary, borderColor: colors.primary},
  radioDot: {width: 7, height: 7, borderRadius: 4, backgroundColor: colors.palette.white},
  dateText: {flex: 1, fontSize: 12, lineHeight: 18},
  footer: {padding: 16, gap: 8, borderTopWidth: 1, borderTopColor: colors.palette.grayLight2},
  applyButton: {minHeight: 56, paddingHorizontal: 12, paddingVertical: 12, flexDirection: 'row', flexWrap: 'wrap',
    gap: 8, alignItems: 'center', justifyContent: 'center', borderRadius: 13, backgroundColor: colors.primary},
  applyText: {fontSize: 17, lineHeight: 24, color: colors.palette.white},
  countBadge: {borderRadius: 16, paddingHorizontal: 10, paddingVertical: 3, backgroundColor: '#1164C6'},
  countText: {fontSize: 12, lineHeight: 18, color: colors.palette.white},
  disabled: {opacity: 0.5},
});
