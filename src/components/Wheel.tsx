import React, { useEffect, useRef, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { ElementRef } from "react";
import { useTheme } from "../theme/ThemeContext";
import { getWheelIndex, WHEEL_ITEM_HEIGHT } from "../lib/wheel";

export const ITEM_H = WHEEL_ITEM_HEIGHT;

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

  // Keep the highlighted item in sync after scrolling without rendering every row per gesture.
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

  const onSettle = (offsetY: number) => {
    if (values.length === 0) return;
    const i = getWheelIndex(offsetY, values.length);
    liveRef.current = i;
    setLiveIndex(i);
    ref.current?.scrollTo({ y: i * ITEM_H, animated: false });
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
        contentOffset={{ x: 0, y: indexFromValue * ITEM_H }}
        contentContainerStyle={{ paddingVertical: ITEM_H }}
        onMomentumScrollEnd={(e) =>
          onSettle(e.nativeEvent.contentOffset.y)
        }
        onScrollEndDrag={(e) => {
          // Avoid per-item React renders during the gesture; native scrolling stays smooth.
          const velocity = e.nativeEvent.velocity?.y ?? 0;
          if (Math.abs(velocity) < 0.01) {
            onSettle(e.nativeEvent.contentOffset.y);
          }
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
