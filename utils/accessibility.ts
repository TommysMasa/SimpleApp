import { AccessibilityInfo, Platform } from 'react-native';

// Accessibility roles
export const ACCESSIBILITY_ROLES = {
  BUTTON: 'button',
  LINK: 'link',
  TEXT: 'text',
  HEADING: 'header',
  IMAGE: 'image',
  INPUT: 'text',
  SEARCH: 'search',
  ALERT: 'alert',
  NONE: 'none',
} as const;

// Accessibility states
export const ACCESSIBILITY_STATES = {
  SELECTED: 'selected',
  DISABLED: 'disabled',
  CHECKED: 'checked',
  EXPANDED: 'expanded',
  BUSY: 'busy',
} as const;

// Accessibility traits (iOS)
export const ACCESSIBILITY_TRAITS = {
  BUTTON: 'button',
  LINK: 'link',
  HEADER: 'header',
  SEARCH_FIELD: 'searchField',
  IMAGE: 'image',
  SELECTED: 'selected',
  PLAYS_SOUND: 'playsSound',
  KEYBOARD_KEY: 'keyboardKey',
  STATIC_TEXT: 'staticText',
  SUMMARY_ELEMENT: 'summaryElement',
  NOT_ENABLED: 'notEnabled',
  UPDATES_FREQUENTLY: 'updatesFrequently',
  STARTS_MEDIA_SESSION: 'startsMediaSession',
  ADJUSTABLE: 'adjustable',
  ALLOWS_DIRECT_INTERACTION: 'allowsDirectInteraction',
  CAUSES_PAGE_TURN: 'causesPageTurn',
} as const;

// Common accessibility props generator
export const getAccessibilityProps = (options: {
  role?: string;
  label?: string;
  hint?: string;
  value?: string;
  state?: {
    disabled?: boolean;
    selected?: boolean;
    checked?: boolean;
    expanded?: boolean;
    busy?: boolean;
  };
  traits?: string[];
  live?: 'polite' | 'assertive' | 'off';
  labelledBy?: string;
  describedBy?: string;
}) => {
  const {
    role,
    label,
    hint,
    value,
    state = {},
    traits = [],
    live = 'polite',
    labelledBy,
    describedBy,
  } = options;

  const accessibilityProps: any = {};

  // Role
  if (role) {
    accessibilityProps.accessibilityRole = role;
  }

  // Label
  if (label) {
    accessibilityProps.accessibilityLabel = label;
  }

  // Hint
  if (hint) {
    accessibilityProps.accessibilityHint = hint;
  }

  // Value
  if (value) {
    accessibilityProps.accessibilityValue = { text: value };
  }

  // State
  if (Object.keys(state).length > 0) {
    accessibilityProps.accessibilityState = state;
  }

  // Traits (iOS)
  if (Platform.OS === 'ios' && traits.length > 0) {
    accessibilityProps.accessibilityTraits = traits;
  }

  // Live region
  if (live !== 'off') {
    accessibilityProps.accessibilityLiveRegion = live;
  }

  // Labelled by
  if (labelledBy) {
    accessibilityProps.accessibilityLabelledBy = labelledBy;
  }

  // Described by
  if (describedBy) {
    accessibilityProps.accessibilityDescribedBy = describedBy;
  }

  return accessibilityProps;
};

// Button accessibility props
export const getButtonAccessibilityProps = (options: {
  label: string;
  hint?: string;
  disabled?: boolean;
  loading?: boolean;
}) => {
  const { label, hint, disabled = false, loading = false } = options;

  return getAccessibilityProps({
    role: ACCESSIBILITY_ROLES.BUTTON,
    label: loading ? `${label}. Loading` : label,
    hint,
    state: {
      disabled: disabled || loading,
      busy: loading,
    },
    traits: [ACCESSIBILITY_TRAITS.BUTTON],
  });
};

// Input accessibility props
export const getInputAccessibilityProps = (options: {
  label: string;
  hint?: string;
  value?: string;
  placeholder?: string;
  required?: boolean;
  invalid?: boolean;
  keyboardType?: string;
}) => {
  const {
    label,
    hint,
    value,
    placeholder,
    required = false,
    invalid = false,
    keyboardType,
  } = options;

  let accessibilityLabel = label;
  if (required) {
    accessibilityLabel += ', required';
  }
  if (invalid) {
    accessibilityLabel += ', invalid';
  }

  let accessibilityHint = hint;
  if (placeholder && !hint) {
    accessibilityHint = `Placeholder: ${placeholder}`;
  }

  const role = keyboardType === 'phone-pad' ? 'text' : 'text';

  return getAccessibilityProps({
    role,
    label: accessibilityLabel,
    hint: accessibilityHint,
    value,
    state: {
      disabled: false,
    },
    traits: keyboardType === 'phone-pad' ? [ACCESSIBILITY_TRAITS.KEYBOARD_KEY] : [],
  });
};

// Link accessibility props
export const getLinkAccessibilityProps = (options: {
  label: string;
  hint?: string;
  url?: string;
}) => {
  const { label, hint, url } = options;

  let accessibilityHint = hint;
  if (url && !hint) {
    accessibilityHint = `Opens ${url}`;
  }

  return getAccessibilityProps({
    role: ACCESSIBILITY_ROLES.LINK,
    label,
    hint: accessibilityHint,
    traits: [ACCESSIBILITY_TRAITS.LINK],
  });
};

// Heading accessibility props
export const getHeadingAccessibilityProps = (options: {
  label: string;
  level?: number;
}) => {
  const { label, level = 1 } = options;

  return getAccessibilityProps({
    role: ACCESSIBILITY_ROLES.HEADING,
    label: `${label}, heading level ${level}`,
    traits: [ACCESSIBILITY_TRAITS.HEADER],
  });
};

// Alert accessibility props
export const getAlertAccessibilityProps = (options: {
  message: string;
  type?: 'error' | 'warning' | 'info' | 'success';
}) => {
  const { message, type = 'info' } = options;

  return getAccessibilityProps({
    role: ACCESSIBILITY_ROLES.ALERT,
    label: `${type}: ${message}`,
    live: 'assertive',
    traits: [ACCESSIBILITY_TRAITS.UPDATES_FREQUENTLY],
  });
};

// Check if screen reader is enabled
export const isScreenReaderEnabled = async (): Promise<boolean> => {
  try {
    return await AccessibilityInfo.isScreenReaderEnabled();
  } catch (error) {
    console.warn('Error checking screen reader status:', error);
    return false;
  }
};

// Check if reduce motion is enabled
export const isReduceMotionEnabled = async (): Promise<boolean> => {
  try {
    return await AccessibilityInfo.isReduceMotionEnabled();
  } catch (error) {
    console.warn('Error checking reduce motion status:', error);
    return false;
  }
};

// Announce message to screen reader
export const announceForAccessibility = (message: string) => {
  AccessibilityInfo.announceForAccessibility(message);
};

// Set accessibility focus
export const setAccessibilityFocus = (reactTag: number) => {
  AccessibilityInfo.setAccessibilityFocus(reactTag);
};

// Common accessibility messages
export const ACCESSIBILITY_MESSAGES = {
  LOADING: 'Loading, please wait',
  ERROR: 'An error occurred',
  SUCCESS: 'Action completed successfully',
  REQUIRED_FIELD: 'This field is required',
  INVALID_INPUT: 'Please enter a valid value',
  PHONE_NUMBER_FORMAT: 'Enter phone number with country code',
  VERIFICATION_CODE: 'Enter 6-digit verification code',
  FORM_SUBMITTED: 'Form submitted successfully',
  NAVIGATION: 'Navigate to',
  BACK: 'Go back',
  CLOSE: 'Close',
  OPEN: 'Open',
  SELECT: 'Select',
  SEARCH: 'Search',
  CLEAR: 'Clear',
  EDIT: 'Edit',
  DELETE: 'Delete',
  SAVE: 'Save',
  CANCEL: 'Cancel',
  CONFIRM: 'Confirm',
  RETRY: 'Retry',
} as const;

// Accessibility helpers for common UI patterns
export const accessibilityHelpers = {
  // Form field with validation
  getFormFieldProps: (field: {
    label: string;
    value?: string;
    placeholder?: string;
    required?: boolean;
    error?: string;
    keyboardType?: string;
  }) => {
    const { label, value, placeholder, required, error, keyboardType } = field;

    return getInputAccessibilityProps({
      label,
      value,
      placeholder,
      required,
      invalid: !!error,
      hint: error || undefined,
      keyboardType,
    });
  },

  // Loading button
  getLoadingButtonProps: (label: string, isLoading: boolean) => {
    return getButtonAccessibilityProps({
      label,
      loading: isLoading,
      hint: isLoading ? 'Please wait while processing' : undefined,
    });
  },

  // Navigation button
  getNavigationButtonProps: (destination: string) => {
    return getButtonAccessibilityProps({
      label: `${ACCESSIBILITY_MESSAGES.NAVIGATION} ${destination}`,
      hint: `Double tap to navigate to ${destination}`,
    });
  },

  // Close button
  getCloseButtonProps: () => {
    return getButtonAccessibilityProps({
      label: ACCESSIBILITY_MESSAGES.CLOSE,
      hint: 'Double tap to close',
    });
  },

  // Back button
  getBackButtonProps: () => {
    return getButtonAccessibilityProps({
      label: ACCESSIBILITY_MESSAGES.BACK,
      hint: 'Double tap to go back',
    });
  },
}; 