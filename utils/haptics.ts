/**
 * Haptic Feedback Utilities
 * Provides cross-browser haptic feedback for mobile devices
 */

/**
 * Check if haptic feedback is supported
 */
export function isHapticSupported(): boolean {
  if (typeof window === 'undefined') return false;

  // Check for Vibration API support
  return 'vibrate' in navigator || 'webkitVibrate' in navigator;
}

/**
 * Trigger very light haptic feedback (for form inputs, radio buttons, checkboxes)
 * This is the softest haptic, barely perceptible
 */
export function triggerVeryLightHaptic(): void {
  if (!isHapticSupported()) return;

  try {
    // Very light tap: 2ms vibration - barely perceptible, won't feel repetitive
    navigator.vibrate?.(2);
  } catch (error) {
    // Silently fail if vibration is blocked or unavailable
    console.debug('Haptic feedback unavailable:', error);
  }
}

/**
 * Trigger light haptic feedback (for buttons, general interactions)
 */
export function triggerLightHaptic(): void {
  if (!isHapticSupported()) return;

  try {
    // Light tap: 8ms vibration - still very subtle
    navigator.vibrate?.(8);
  } catch (error) {
    // Silently fail if vibration is blocked or unavailable
    console.debug('Haptic feedback unavailable:', error);
  }
}

/**
 * Trigger navigation haptic feedback (for bottom navigation bar)
 * Uses a distinctive heartbeat pattern to differentiate from other interactions
 */
export function triggerNavigationHaptic(): void {
  if (!isHapticSupported()) return;

  try {
    // Heartbeat pattern: 5ms, pause 30ms, 8ms - ba-dum feel, distinctive from form elements
    navigator.vibrate?.([5, 30, 8]);
  } catch (error) {
    console.debug('Haptic feedback unavailable:', error);
  }
}

/**
 * Trigger medium haptic feedback (for important actions, confirmations)
 */
export function triggerMediumHaptic(): void {
  if (!isHapticSupported()) return;

  try {
    // Medium tap: 15ms vibration
    navigator.vibrate?.(15);
  } catch (error) {
    console.debug('Haptic feedback unavailable:', error);
  }
}

/**
 * Trigger strong haptic feedback (for errors, warnings, critical actions)
 */
export function triggerStrongHaptic(): void {
  if (!isHapticSupported()) return;

  try {
    // Strong tap: 50ms vibration
    navigator.vibrate?.(50);
  } catch (error) {
    console.debug('Haptic feedback unavailable:', error);
  }
}

/**
 * Trigger success haptic pattern (for successful completions)
 */
export function triggerSuccessHaptic(): void {
  if (!isHapticSupported()) return;

  try {
    // Success pattern: two quick taps
    navigator.vibrate?.([15, 30, 15]);
  } catch (error) {
    console.debug('Haptic feedback unavailable:', error);
  }
}

/**
 * Trigger error haptic pattern (for errors or failed actions)
 */
export function triggerErrorHaptic(): void {
  if (!isHapticSupported()) return;

  try {
    // Error pattern: three distinct vibrations
    navigator.vibrate?.([30, 50, 30, 50, 30]);
  } catch (error) {
    console.debug('Haptic feedback unavailable:', error);
  }
}

/**
 * Cancel any ongoing haptic feedback
 */
export function cancelHaptic(): void {
  if (!isHapticSupported()) return;

  try {
    navigator.vibrate?.(0);
  } catch (error) {
    console.debug('Haptic feedback unavailable:', error);
  }
}
