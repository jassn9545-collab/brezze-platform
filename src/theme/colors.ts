const palette = {
  black: '#000000',
  light: '#9FA5C0',
  gray: '#D9D9D9',
  white: '#FFFFFF',
  red: '#D9192A',
  dimRed: '#FEF2F2',

  green: '#27AE60',
  lightGreen: '#90EE90',
  dimGreen: '#DCFCE7',
  transparentGreen: '#E9FFF2',
  offGreen: '#E8F5E9',
  offWhite: '#F6F6F6',
  offWhite2: '#EFEFEF',

  primaryColor: '#0054A5',
  primaryDimmed: '#92CEFF',
  borderColor: "#CACACA",

  secondaryFontColor: '#3E4958',
  wrapperFontColor: '#6C6C70',

  // new added
  fontColor: '#252525',
  wrapperBackgroundColor: '#FFFFFF',
  darkGray1: '#231F20',
  darkGray2: '#383733',

  lightGray1: '#A2A2A7',

  lightCream: '#FCF3EC',

  // added colors
  darkRed: '#FF383C',
  lightRed: '#FF383C26',
  grayLight: '#565656',
  grayLight2: '#E5E5EA',
  grayLight3: '#E8E8E8',

  placeholderColor: '#717680',

  angry100: '#F2D6CD',
  anger200: '#EB5757',
  angry500: '#C03403',

  overlay10: 'rgba(25, 16, 21, 0.1)',
  overlay20: 'rgba(25, 16, 21, 0.2)',
  overlay50: 'rgba(25, 16, 21, 0.5)',

  // Lines Color
  verticalLine: '#3E4958',
  horizontalLine: '#EBEBEB',

  // Toast Colors
  success: '#00C851',
  info: '#33b5e5',
  warning: '#FFD54F',
  danger: '#d9534f',
  inverse: '#292b2c',
  faded: '#f7f7f7',

  // Gradient Colors
  startColor: '#3DBFFF',
  endColor: '#0A89C8',
  centerColor: 'rgba(254, 181, 18, 1)',
  purple: '#40189D'
} as const;

export const colors = {
  /**
   * The palette is available to use, but prefer using the name.
   * This is only included for rare, one-off cases. Try to use
   * semantic names as much as possible.
   */
  palette,
  /**
   * A helper for making something see-thru.
   */
  transparent: 'rgba(0, 0, 0, 0)',
  /**
   * The default text color in many components.
   */
  text: palette.fontColor,
  /**
   * Secondary text information.
   */
  textDim: palette.grayLight,
  /**
   * The main primary color.
   */
  primary: palette.primaryColor,
  /**
   * The main primary color.
   */
  primaryDimmed: palette.primaryDimmed,
  /**
   * The default color of the screen background.
   */
  background: palette.wrapperBackgroundColor,
  /**
   * Error messages.
   */
  error: palette.angry500,
  /**
   * Error Background.
   *
   */
  errorBackground: palette.angry100,
  /**
   * A separator color used for lines.
   */
  separator: palette.horizontalLine,
};
