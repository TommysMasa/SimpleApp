import { Dimensions, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Base dimensions (iPhone 12 Pro)
const BASE_WIDTH = 390;
const BASE_HEIGHT = 844;

// Screen size categories
export const SCREEN_SIZES = {
  SMALL: 'small',   // <= 375px width
  MEDIUM: 'medium', // 376px - 414px width
  LARGE: 'large',   // >= 415px width
} as const;

export type ScreenSize = typeof SCREEN_SIZES[keyof typeof SCREEN_SIZES];

// Get current screen size category
export const getScreenSize = (): ScreenSize => {
  if (SCREEN_WIDTH <= 375) return SCREEN_SIZES.SMALL;
  if (SCREEN_WIDTH <= 414) return SCREEN_SIZES.MEDIUM;
  return SCREEN_SIZES.LARGE;
};

// Scale font size based on screen size
export const scaleFontSize = (size: number): number => {
  const scale = SCREEN_WIDTH / BASE_WIDTH;
  const newSize = size * scale;
  
  // Ensure minimum font size for readability
  const minSize = size * 0.8;
  const maxSize = size * 1.2;
  
  return Math.max(minSize, Math.min(maxSize, newSize));
};

// Scale spacing based on screen size
export const scaleSpacing = (spacing: number): number => {
  const scale = SCREEN_WIDTH / BASE_WIDTH;
  return spacing * scale;
};

// Get responsive padding based on screen size
export const getResponsivePadding = () => {
  const screenSize = getScreenSize();
  
  switch (screenSize) {
    case SCREEN_SIZES.SMALL:
      return {
        horizontal: 16,
        vertical: 12,
      };
    case SCREEN_SIZES.MEDIUM:
      return {
        horizontal: 20,
        vertical: 16,
      };
    case SCREEN_SIZES.LARGE:
      return {
        horizontal: 24,
        vertical: 20,
      };
    default:
      return {
        horizontal: 20,
        vertical: 16,
      };
  }
};

// Get responsive button height
export const getResponsiveButtonHeight = (): number => {
  const screenSize = getScreenSize();
  
  switch (screenSize) {
    case SCREEN_SIZES.SMALL:
      return 44;
    case SCREEN_SIZES.MEDIUM:
      return 48;
    case SCREEN_SIZES.LARGE:
      return 52;
    default:
      return 48;
  }
};

// Get responsive input height
export const getResponsiveInputHeight = (): number => {
  const screenSize = getScreenSize();
  
  switch (screenSize) {
    case SCREEN_SIZES.SMALL:
      return 44;
    case SCREEN_SIZES.MEDIUM:
      return 48;
    case SCREEN_SIZES.LARGE:
      return 52;
    default:
      return 48;
  }
};

// Check if device is tablet
export const isTablet = (): boolean => {
  const pixelDensity = PixelRatio.get();
  const adjustedWidth = SCREEN_WIDTH * pixelDensity;
  const adjustedHeight = SCREEN_HEIGHT * pixelDensity;
  
  return (
    (adjustedWidth >= 1000 || adjustedHeight >= 1000) ||
    (SCREEN_WIDTH >= 768 && SCREEN_HEIGHT >= 1024)
  );
};

// Get responsive margin based on screen size
export const getResponsiveMargin = () => {
  const screenSize = getScreenSize();
  
  switch (screenSize) {
    case SCREEN_SIZES.SMALL:
      return {
        small: 8,
        medium: 16,
        large: 24,
      };
    case SCREEN_SIZES.MEDIUM:
      return {
        small: 12,
        medium: 20,
        large: 32,
      };
    case SCREEN_SIZES.LARGE:
      return {
        small: 16,
        medium: 24,
        large: 40,
      };
    default:
      return {
        small: 12,
        medium: 20,
        large: 32,
      };
  }
};

// Get responsive border radius
export const getResponsiveBorderRadius = () => {
  const screenSize = getScreenSize();
  
  switch (screenSize) {
    case SCREEN_SIZES.SMALL:
      return {
        small: 8,
        medium: 12,
        large: 16,
      };
    case SCREEN_SIZES.MEDIUM:
      return {
        small: 10,
        medium: 14,
        large: 18,
      };
    case SCREEN_SIZES.LARGE:
      return {
        small: 12,
        medium: 16,
        large: 20,
      };
    default:
      return {
        small: 10,
        medium: 14,
        large: 18,
      };
  }
};

// Common responsive styles
export const responsiveStyles = {
  container: {
    paddingHorizontal: getResponsivePadding().horizontal,
    paddingVertical: getResponsivePadding().vertical,
  },
  
  title: {
    fontSize: scaleFontSize(28),
    marginBottom: getResponsiveMargin().large,
  },
  
  subtitle: {
    fontSize: scaleFontSize(16),
    marginBottom: getResponsiveMargin().medium,
  },
  
  button: {
    height: getResponsiveButtonHeight(),
    borderRadius: getResponsiveBorderRadius().medium,
    paddingHorizontal: getResponsivePadding().horizontal,
  },
  
  input: {
    height: getResponsiveInputHeight(),
    borderRadius: getResponsiveBorderRadius().medium,
    paddingHorizontal: getResponsivePadding().horizontal,
    fontSize: scaleFontSize(16),
  },
  
  card: {
    borderRadius: getResponsiveBorderRadius().large,
    padding: getResponsivePadding().horizontal,
    marginBottom: getResponsiveMargin().medium,
  },
};

// Screen dimensions
export const screenDimensions = {
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
  isSmallScreen: SCREEN_WIDTH <= 375,
  isMediumScreen: SCREEN_WIDTH > 375 && SCREEN_WIDTH <= 414,
  isLargeScreen: SCREEN_WIDTH > 414,
  isTablet: isTablet(),
}; 