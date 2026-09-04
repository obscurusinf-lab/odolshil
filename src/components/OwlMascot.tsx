import React, { useEffect } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

const ALERT_SOURCE = require('../../assets/mascot/owl-alert.png');
const ASLEEP_SOURCE = require('../../assets/mascot/owl-asleep.png');
const ALERT_RATIO = 224 / 300;
const ASLEEP_RATIO = 203 / 300;

interface Props {
  state: 'alert' | 'asleep';
  size?: number;
}

/**
 * Статичных исходников по одному кадру на состояние — настоящего моргания
 * (смыкания век) без второго кадра «глаза широко открыты» не получить.
 * Вместо этого: тревожный филин — быстрый нервный пульс + лёгкое дрожание,
 * спящий — медленное дыхание и всплывающие «zzz» поверх картинки.
 */
export function OwlMascot({ state, size = 32 }: Props) {
  const scale = useSharedValue(1);
  const rotate = useSharedValue(0);

  useEffect(() => {
    if (state === 'alert') {
      scale.value = withRepeat(withTiming(1.07, { duration: 550, easing: Easing.inOut(Easing.quad) }), -1, true);
      rotate.value = withRepeat(withTiming(3, { duration: 480, easing: Easing.inOut(Easing.quad) }), -1, true);
    } else {
      scale.value = withRepeat(withTiming(1.025, { duration: 1900, easing: Easing.inOut(Easing.sin) }), -1, true);
      rotate.value = withTiming(0, { duration: 300 });
    }
  }, [state, scale, rotate]);

  const bodyStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { rotate: `${rotate.value}deg` }],
  }));

  const ratio = state === 'alert' ? ALERT_RATIO : ASLEEP_RATIO;
  const height = size;
  const width = height * ratio;

  return (
    <View style={{ width, height: height * 1.2 }}>
      <Animated.View style={[{ width, height, justifyContent: 'flex-end' }, bodyStyle]}>
        <Image
          source={state === 'alert' ? ALERT_SOURCE : ASLEEP_SOURCE}
          style={{ width, height }}
          resizeMode="contain"
        />
      </Animated.View>
      {state === 'asleep' ? <SleepZs size={size} /> : null}
    </View>
  );
}

function SleepZs({ size }: { size: number }) {
  return (
    <View style={[styles.zRow, { top: -size * 0.35, right: -size * 0.1 }]} pointerEvents="none">
      <SleepZ delay={0} scale={0.5} baseX={0} baseY={16} />
      <SleepZ delay={450} scale={0.7} baseX={7} baseY={8} />
      <SleepZ delay={900} scale={0.95} baseX={15} baseY={0} />
    </View>
  );
}

function SleepZ({ delay, scale, baseX, baseY }: { delay: number; scale: number; baseX: number; baseY: number }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 1600, easing: Easing.out(Easing.quad) }),
          withTiming(0, { duration: 0 })
        ),
        -1,
        false
      )
    );
  }, [progress, delay]);

  const style = useAnimatedStyle(() => ({
    opacity: 1 - progress.value,
    transform: [
      { translateX: baseX },
      { translateY: baseY - progress.value * 16 },
      { scale },
    ],
  }));

  return (
    <Animated.Text style={[styles.z, style]}>
      z
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  zRow: {
    position: 'absolute',
  },
  z: {
    position: 'absolute',
    fontSize: 14,
    fontWeight: '700',
    color: '#8FAF9C',
  },
});
