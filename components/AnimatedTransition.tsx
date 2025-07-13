import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Dimensions,
    Easing,
    StyleSheet,
    View,
} from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export type AnimationType = 
  | 'fadeIn'
  | 'fadeOut'
  | 'slideInLeft'
  | 'slideInRight'
  | 'slideInUp'
  | 'slideInDown'
  | 'slideOutLeft'
  | 'slideOutRight'
  | 'slideOutUp'
  | 'slideOutDown'
  | 'scaleIn'
  | 'scaleOut'
  | 'bounceIn'
  | 'bounceOut';

interface AnimatedTransitionProps {
  children: React.ReactNode;
  animation: AnimationType;
  duration?: number;
  delay?: number;
  easing?: any;
  style?: any;
  onAnimationComplete?: () => void;
}

const AnimatedTransition: React.FC<AnimatedTransitionProps> = ({
  children,
  animation,
  duration = 300,
  delay = 0,
  easing = Easing.out(Easing.ease),
  style,
  onAnimationComplete,
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.timing(animatedValue, {
        toValue: 1,
        duration,
        easing,
        useNativeDriver: true,
      }).start(() => {
        if (onAnimationComplete) {
          onAnimationComplete();
        }
      });
    }, delay);

    return () => clearTimeout(timer);
  }, [animatedValue, duration, delay, easing, onAnimationComplete]);

  const getAnimatedStyle = () => {
    switch (animation) {
      case 'fadeIn':
        return {
          opacity: animatedValue,
        };
      
      case 'fadeOut':
        return {
          opacity: animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 0],
          }),
        };
      
      case 'slideInLeft':
        return {
          transform: [
            {
              translateX: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [-screenWidth, 0],
              }),
            },
          ],
        };
      
      case 'slideInRight':
        return {
          transform: [
            {
              translateX: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [screenWidth, 0],
              }),
            },
          ],
        };
      
      case 'slideInUp':
        return {
          transform: [
            {
              translateY: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [screenHeight, 0],
              }),
            },
          ],
        };
      
      case 'slideInDown':
        return {
          transform: [
            {
              translateY: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [-screenHeight, 0],
              }),
            },
          ],
        };
      
      case 'slideOutLeft':
        return {
          transform: [
            {
              translateX: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -screenWidth],
              }),
            },
          ],
        };
      
      case 'slideOutRight':
        return {
          transform: [
            {
              translateX: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [0, screenWidth],
              }),
            },
          ],
        };
      
      case 'slideOutUp':
        return {
          transform: [
            {
              translateY: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -screenHeight],
              }),
            },
          ],
        };
      
      case 'slideOutDown':
        return {
          transform: [
            {
              translateY: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [0, screenHeight],
              }),
            },
          ],
        };
      
      case 'scaleIn':
        return {
          transform: [
            {
              scale: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 1],
              }),
            },
          ],
        };
      
      case 'scaleOut':
        return {
          transform: [
            {
              scale: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 0],
              }),
            },
          ],
        };
      
      case 'bounceIn':
        return {
          transform: [
            {
              scale: animatedValue.interpolate({
                inputRange: [0, 0.3, 0.7, 1],
                outputRange: [0, 1.1, 0.9, 1],
              }),
            },
          ],
        };
      
      case 'bounceOut':
        return {
          transform: [
            {
              scale: animatedValue.interpolate({
                inputRange: [0, 0.3, 0.7, 1],
                outputRange: [1, 0.9, 1.1, 0],
              }),
            },
          ],
        };
      
      default:
        return {
          opacity: animatedValue,
        };
    }
  };

  return (
    <Animated.View style={[getAnimatedStyle(), style]}>
      {children}
    </Animated.View>
  );
};

// Preset animation configurations
export const AnimationPresets = {
  slideInFromRight: {
    animation: 'slideInRight' as AnimationType,
    duration: 300,
    easing: Easing.out(Easing.ease),
  },
  slideInFromLeft: {
    animation: 'slideInLeft' as AnimationType,
    duration: 300,
    easing: Easing.out(Easing.ease),
  },
  fadeInSlow: {
    animation: 'fadeIn' as AnimationType,
    duration: 500,
    easing: Easing.out(Easing.ease),
  },
  fadeInFast: {
    animation: 'fadeIn' as AnimationType,
    duration: 200,
    easing: Easing.out(Easing.ease),
  },
  bounceInDelayed: {
    animation: 'bounceIn' as AnimationType,
    duration: 600,
    delay: 200,
    easing: Easing.out(Easing.back(1.7)),
  },
  scaleInSpring: {
    animation: 'scaleIn' as AnimationType,
    duration: 400,
    easing: Easing.out(Easing.back(1.2)),
  },
};

// Staggered animation component
interface StaggeredAnimationProps {
  children: React.ReactNode[];
  animation: AnimationType;
  staggerDelay?: number;
  duration?: number;
  easing?: any;
}

export const StaggeredAnimation: React.FC<StaggeredAnimationProps> = ({
  children,
  animation,
  staggerDelay = 100,
  duration = 300,
  easing = Easing.out(Easing.ease),
}) => {
  return (
    <View>
      {React.Children.map(children, (child, index) => (
        <AnimatedTransition
          key={index}
          animation={animation}
          duration={duration}
          delay={index * staggerDelay}
          easing={easing}
        >
          {child}
        </AnimatedTransition>
      ))}
    </View>
  );
};

// Sequence animation component
interface SequenceAnimationProps {
  children: React.ReactNode[];
  animations: AnimationType[];
  duration?: number;
  easing?: any;
}

export const SequenceAnimation: React.FC<SequenceAnimationProps> = ({
  children,
  animations,
  duration = 300,
  easing = Easing.out(Easing.ease),
}) => {
  return (
    <View>
      {React.Children.map(children, (child, index) => (
        <AnimatedTransition
          key={index}
          animation={animations[index] || 'fadeIn'}
          duration={duration}
          delay={index * duration}
          easing={easing}
        >
          {child}
        </AnimatedTransition>
      ))}
    </View>
  );
};

// Page transition wrapper
interface PageTransitionProps {
  children: React.ReactNode;
  entering?: boolean;
  exiting?: boolean;
  direction?: 'left' | 'right' | 'up' | 'down';
}

export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  entering = true,
  exiting = false,
  direction = 'right',
}) => {
  const getAnimation = (): AnimationType => {
    if (entering) {
      switch (direction) {
        case 'left':
          return 'slideInLeft';
        case 'right':
          return 'slideInRight';
        case 'up':
          return 'slideInUp';
        case 'down':
          return 'slideInDown';
        default:
          return 'slideInRight';
      }
    } else if (exiting) {
      switch (direction) {
        case 'left':
          return 'slideOutLeft';
        case 'right':
          return 'slideOutRight';
        case 'up':
          return 'slideOutUp';
        case 'down':
          return 'slideOutDown';
        default:
          return 'slideOutLeft';
      }
    }
    return 'fadeIn';
  };

  return (
    <AnimatedTransition
      animation={getAnimation()}
      duration={300}
      easing={Easing.out(Easing.ease)}
    >
      {children}
    </AnimatedTransition>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default AnimatedTransition; 