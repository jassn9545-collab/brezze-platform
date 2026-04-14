import {
    useState,
    useCallback,
    useEffect,
    forwardRef,
    useImperativeHandle,
  } from 'react';
  import {
    Text as RNText,
    StyleSheet,
    TextLayoutEvent,
    TextProps,
    View,
  } from 'react-native';
  import { translate } from '../i18n';
  
  export interface ReadMoreRef {
    reset: () => void;
  }
  
  export interface ReadMoreProps extends TextProps {
    text?: string;
    numberOfLines?: number;
    onToggleReadMore?: (isExpanded: boolean) => void;
  }
  
  export const ReadMore = forwardRef<ReadMoreRef, ReadMoreProps>(
    (
      { numberOfLines = 2, text = '', style, onToggleReadMore, ...props },
      ref,
    ) => {
      const [isExpanded, setIsExpanded] = useState(false);
      const [showReadMore, setShowReadMore] = useState(false);
  
      useImperativeHandle(ref, () => ({
        reset: () => setIsExpanded(false),
      }));
  
      useEffect(() => {
        onToggleReadMore?.(isExpanded);
      // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [isExpanded]);
  
      const toggleExpanded = useCallback(() => {
        setIsExpanded(prev => !prev);
      }, []);
  
      const onTextLayout = useCallback(
        (e: TextLayoutEvent) => {
          const exceedsLines = e.nativeEvent.lines.length > numberOfLines;
          if (exceedsLines !== showReadMore) {
            setShowReadMore(exceedsLines);
          }
        },
        [numberOfLines, showReadMore],
      );
  
      return (
        <View>
          <RNText onTextLayout={onTextLayout} style={styles.hiddenText}>
            {text}
          </RNText>
  
          <RNText
            {...props}
            style={style}
            numberOfLines={isExpanded ? undefined : numberOfLines}
          >
            {text}
          </RNText>
  
          {showReadMore && (
            <RNText onPress={toggleExpanded} style={[style, styles.readMore]}>
              {isExpanded
                ? translate('common.readLess')
                : translate('common.readMore')}
            </RNText>
          )}
        </View>
      );
    },
  );
  
  const styles = StyleSheet.create({
    hiddenText: {
      position: 'absolute',
      opacity: 0,
      left: 0,
      right: 0,
      zIndex: -1,
    },
    readMore: {
      fontWeight: '600',
    },
  });
  