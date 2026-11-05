import React, { useEffect, useRef, useState } from "react";
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { ElementRef } from "react";
import { useTheme } from "../theme/ThemeContext";

export const ITEM_H = 44;

type Props = {
  values: number[];
  value: number;
  onChange: (v: number) => void;
  format?: (v: number) => string;
  width: number;
};

export default function Wheel({
  values,
  value,
  onChange,
  format = (v) => String(v),
  width,
}: Props) {
  const { colors } = useTheme();
  const ref = useRef<ElementRef<typeof ScrollView>>(null);
  const indexFromValue = Math.max(0, values.indexOf(value));

  // The index the wheel is showing right now. Updated while scrolling, so the
  // highlighted item and the value stay in step with the finger.
  const [liveIndex, setLiveIndex] = useState(indexFromValue);
  const liveRef = useRef(indexFromValue);

  // Follows the saved value when it changes from outside (for example, when the sheet opens)
  useEffect(() => {
    if (indexFromValue !== liveRef.current) {
      liveRef.current = indexFromValue;
      setLiveIndex(indexFromValue);
      ref.current?.scrollTo({ y: indexFromValue * ITEM_H, animated: false });
    }
  }, [indexFromValue]);

  const indexAt = (y: number) =>
    Math.min(values.length - 1, Math.max(0, Math.round(y / ITEM_H)));

  // Runs on every frame while the finger moves, so the highlight tracks the scroll
  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = indexAt(e.nativeEvent.contentOffset.y);
    if (i !== liveRef.current) {
      liveRef.current = i;
      setLiveIndex(i);
    }
  };

  // Snaps to the exact item once the scroll stops, and reports the value
  const onSettle = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = indexAt(e.nativeEvent.contentOffset.y);
    liveRef.current = i;
    setLiveIndex(i);
    ref.current?.scrollTo({ y: i * ITEM_H, animated: true });
    if (values[i] !== value) onChange(values[i]);
  };

  return (
    <View style={{ height: ITEM_H * 3, width }}>
      <View
        pointerEvents="none"
        style={[styles.band, { backgroundColor: colors.surfaceMuted }]}
      />
      <ScrollView
        ref={ref}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_H}
        decelerationRate="fast"
        scrollEventThrottle={16}
        contentOffset={{ x: 0, y: indexFromValue * ITEM_H }}
        contentContainerStyle={{ paddingVertical: ITEM_H }}
        onScroll={onScroll}
        onMomentumScrollEnd={onSettle}
        onScrollEndDrag={(e) => {
          // Only settle here when the finger lifts without momentum
          if (e.nativeEvent.velocity?.y === 0) onSettle(e);
        }}
      >
        {values.map((v, i) => {
          const selected = i === liveIndex;
          return (
            <View key={v} style={styles.item}>
              <Text
                style={{
                  fontSize: selected ? 22 : 17,
                  fontWeight: selected ? "700" : "400",
                  color: selected ? colors.text : colors.textSubtle,
                }}
              >
                {format(v)}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  band: {
    position: "absolute",
    top: ITEM_H,
    left: 6,
    right: 6,
    height: ITEM_H,
    borderRadius: 10,
  },
  item: { height: ITEM_H, alignItems: "center", justifyContent: "center" },
});
