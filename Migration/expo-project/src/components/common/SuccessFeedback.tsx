/**
 * Success Feedback Component
 * Shows animated checkmark for successful actions
 */

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from 'react-native-paper';

interface SuccessFeedbackProps {
  message?: string;
  visible: boolean;
  onComplete?: () => void;
}

export function SuccessFeedback({ message, visible, onComplete }: SuccessFeedbackProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 100,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Auto-hide after 2 seconds
        timeoutRef.current = setTimeout(() => {
          Animated.parallel([
            Animated.timing(scaleAnim, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }),
          ]).start(() => {
            onComplete?.();
          });
        }, 2000);
      });
    } else {
      scaleAnim.setValue(0);
      opacityAnim.setValue(0);
    }

    // Cleanup timeout on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [visible, scaleAnim, opacityAnim]);

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <Animated.View
        style={[
          styles.container,
          {
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          },
        ]}
      >
        <View style={styles.iconContainer}>
          <Ionicons name="checkmark-circle" size={64} color="#4CAF50" />
        </View>
        {message && <Text style={styles.message}>{message}</Text>}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    minWidth: 200,
  },
  iconContainer: {
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    textAlign: 'center',
  },
});
