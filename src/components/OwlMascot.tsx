import React, { useEffect } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

/** 0 = не просрочено (спит), 1..6 = ступень просрочки (1-2, 3-4, 5-6, 7-8, 9-10, 11+ дней). */
export type OwlStage = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export function stageFromDaysOverdue(days: number): OwlStage {
  if (days <= 0) return 0;
  if (days <= 2) return 1;
  if (days <= 4) return 2;
  if (days <= 6) return 3;
  if (days <= 8) return 4;
  if (days <= 10) return 5;
  return 6;
}

const SOURCES: Record<OwlStage, { source: number; ratio: number }> = {
  0: { source: require('../../assets/mascot/owl-asleep.png'), ratio: 203 / 300 },
  1: { source: require('../../assets/mascot/owl-overdue-1.png'), ratio: 299 / 300 },
  2: { source: require('../../assets/mascot/owl-overdue-2.png'), ratio: 300 / 300 },
  3: { source: require('../../assets/mascot/owl-overdue-3.png'), ratio: 254 / 300 },
  4: { source: require('../../assets/mascot/owl-overdue-4.png'), ratio: 299 / 300 },
  5: { source: require('../../assets/mascot/owl-overdue-5.png'), ratio: 300 / 300 },
  6: { source: require('../../assets/mascot/owl-overdue-6.png'), ratio: 254 / 300 },
};

/**
 * Дыхание + подрагивание, интенсивность растёт со ступенью просрочки —
 * стадия 1 еле заметно покачивается, стадия 6 почти трясётся. Каждая
 * ступень — отдельный статичный кадр (глаз(а) приоткрыты сильнее с каждой
 * ступенью), анимация здесь — только «жизнь» внутри одного кадра, не
 * переход между кадрами.
 */
export function OwlMascot({ stage, size = 32 }: { stage: OwlStage; size?: number }) {
  const scale = useSharedValue(1);
  const rotate = useSharedValue(0);

  useEffect(() => {
    if (stage === 0) {
      scale.value = withRepeat(withTiming(1.025, { duration: 1900, easing: Easing.inOut(Easing.sin) }), -1, true);
      rotate.value = withTiming(0, { duration: 300 });
      return;
    }
    // Стадия 1 → почти нет тряски, стадия 6 → быстро и заметно.
    const t = (stage - 1) / 5; // 0..1
    const duration = 900 - t * 550; // 900ms -> 350ms
    const scaleAmount = 1.02 + t * 0.09; // 1.02 -> 1.11
    const rotateAmount = 1 + t * 5; // 1deg -> 6deg

    scale.value = withRepeat(withTiming(scaleAmount, { duration, easing: Easing.inOut(Easing.quad) }), -1, true);
    rotate.value = withRepeat(withTiming(rotateAmount, { duration: duration * 0.85, easing: Easing.inOut(Easing.quad) }), -1, true);
  }, [stage, scale, rotate]);

  const bodyStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { rotate: `${rotate.value}deg` }],
  }));

  const { source, ratio } = SOURCES[stage];
  const height = size;
  const width = height * ratio;

  return (
    <View style={{ width, height: height * 1.2 }}>
      <Animated.View style={[{ width, height, justifyContent: 'flex-end' }, bodyStyle]}>
        <Image source={source} style={{ width, height }} resizeMode="contain" />
      </Animated.View>
      {stage === 0 ? <SleepZs size={size} /> : null}
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
