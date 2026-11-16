import { useEffect, useRef, useState } from "react";
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
import { getWheelIndex, WHEEL_ITEM_HEIGHT } from "../lib/wheel";
import React from "react";

export const ITEM_H = WHEEL_ITEM_HEIGHT;

// Wait for scroll events to go quiet before settling when no momentum event follows.
const SETTLE_DELAY_MS = 120;

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
  const [liveIndex, setLiveIndex] = useState(indexFromValue);
  const liveRef = useRef(indexFromValue);

  const readyRef = useRef(false);
  const momentumRef = useRef(false);
  const settlePendingRef = useRef(false);
  const latestOffsetYRef = useRef(indexFromValue * ITEM_H);
  const settleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearSettleTimer = () => {
    if (settleTimer.current) {
      clearTimeout(settleTimer.current);
      settleTimer.current = null;
    }
  };

  const jumpTo = (index: number, animated: boolean) => {
    ref.current?.scrollTo({ y: index * ITEM_H, animated });
  };

  const scheduleSettle = () => {
    clearSettleTimer();
    settleTimer.current = setTimeout(() => {
      if (!momentumRef.current) settle(latestOffsetYRef.current);
    }, SETTLE_DELAY_MS);
  };

  // Sets the starting position once the items have been measured.
  // contentOffset alone isn't reliable inside a Modal on Android.
  const onContentSizeChange = () => {
    if (readyRef.current) return;
    readyRef.current = true;
    jumpTo(liveRef.current, false);
  };

  // Follows the saved value when it changes from outside (for example, when the sheet reopens)
  useEffect(() => {
    if (!readyRef.current) return;
    if (indexFromValue !== liveRef.current) {
      liveRef.current = indexFromValue;
      setLiveIndex(indexFromValue);
      jumpTo(indexFromValue, false);
    }
  }, [indexFromValue]);

  useEffect(() => clearSettleTimer, []);

  // Commits the centred item as the value
  const settle = (offsetY: number) => {
    if (values.length === 0) return;
    clearSettleTimer();
    settlePendingRef.current = false;
    const i = getWheelIndex(offsetY, values.length);
    liveRef.current = i;
    setLiveIndex(i);
    if (values[i] !== value) onChange(values[i]);
  };

  // Keep the latest offset for the no-momentum fallback without re-rendering every row.
  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = e.nativeEvent.contentOffset.y;
    latestOffsetYRef.current = offsetY;
    if (settlePendingRef.current && !momentumRef.current) scheduleSettle();
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
        contentContainerStyle={{ paddingVertical: ITEM_H }}
        onContentSizeChange={onContentSizeChange}
        onScroll={onScroll}
        onMomentumScrollBegin={() => {
          momentumRef.current = true;
          clearSettleTimer();
        }}
        onMomentumScrollEnd={(e) => {
          momentumRef.current = false;
          latestOffsetYRef.current = e.nativeEvent.contentOffset.y;
          settle(e.nativeEvent.contentOffset.y);
        }}
        onScrollEndDrag={(e) => {
          latestOffsetYRef.current = e.nativeEvent.contentOffset.y;
          settlePendingRef.current = true;
          scheduleSettle();
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
