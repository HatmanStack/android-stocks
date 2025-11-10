/**
 * Navigation Transition Configurations
 * Custom transitions and animations for navigators
 */

import { Animated, Easing } from 'react-native';

/**
 * Custom timing config for smooth animations
 */
export const timingConfig = {
  duration: 250,
  easing: Easing.out(Easing.cubic),
  useNativeDriver: true,
};

/**
 * Material Top Tab transition config
 * Smooth swipe animations with spring physics
 */
export const materialTopTabOptions = {
  animationEnabled: true,
  swipeEnabled: true,
  lazy: false,
  lazyPreloadDistance: 1,
  tabBarScrollEnabled: false,
  timingConfig: {
    duration: 200,
    easing: Easing.out(Easing.ease),
  },
  springConfig: {
    stiffness: 1000,
    damping: 500,
    mass: 3,
    overshootClamping: true,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 0.01,
  },
};

/**
 * Bottom tab transition config
 */
export const bottomTabOptions = {
  animationEnabled: true,
  tabBarHideOnKeyboard: true,
};

/**
 * Custom fade transition for modals
 */
export const fadeTransition = {
  cardStyleInterpolator: ({ current }: any) => ({
    cardStyle: {
      opacity: current.progress,
    },
  }),
};

/**
 * Horizontal slide transition (iOS style)
 */
export const horizontalSlideTransition = {
  gestureDirection: 'horizontal' as const,
  transitionSpec: {
    open: {
      animation: 'timing' as const,
      config: timingConfig,
    },
    close: {
      animation: 'timing' as const,
      config: timingConfig,
    },
  },
  cardStyleInterpolator: ({ current, next, layouts }: any) => {
    return {
      cardStyle: {
        transform: [
          {
            translateX: current.progress.interpolate({
              inputRange: [0, 1],
              outputRange: [layouts.screen.width, 0],
            }),
          },
          {
            translateX: next
              ? next.progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -layouts.screen.width * 0.3],
                })
              : 0,
          },
        ],
      },
      overlayStyle: {
        opacity: current.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 0.3],
        }),
      },
    };
  },
};

/**
 * Scale transition for emphasis
 */
export const scaleTransition = {
  transitionSpec: {
    open: {
      animation: 'spring' as const,
      config: {
        stiffness: 500,
        damping: 50,
        mass: 1,
      },
    },
    close: {
      animation: 'timing' as const,
      config: timingConfig,
    },
  },
  cardStyleInterpolator: ({ current }: any) => {
    return {
      cardStyle: {
        transform: [
          {
            scale: current.progress.interpolate({
              inputRange: [0, 1],
              outputRange: [0.85, 1],
            }),
          },
        ],
        opacity: current.progress,
      },
    };
  },
};
