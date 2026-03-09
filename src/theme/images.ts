export const images = {

  // Toast
  success: require('../assets/images/success.png'),
  danger: require('../assets/images/danger.png'),
  warning: require('../assets/images/warning.png'),

  // walktthrough
  walkthrough1: require('../assets/images/walkthrough1.png'),
  walkthrough2: require('../assets/images/walkthrough2.png'),
  walkthrough3: require('../assets/images/walkthrough3.png'),
  
  //common
  rightArrow: require('../assets/images/rightArrow.png'),
  emailIcon: require('../assets/images/emailIcon.png'),
  lockIcon: require('../assets/images/lockIcon.png'),
  eyeIcon: require('../assets/images/eyeIcon.png'),
  eyeCloseIcon: require('../assets/images/eyeCloseIcon.png'),
  leftArrow: require('../assets/images/leftArrow.png'),

  // bottom tab icons
  // home: require('../assets/images/homeActive.png'),
  // search: require('../assets/images/searchActive.png'),
  // productList: require('../assets/images/shopActive.png'),
  // sip: require('../assets/images/sipActive.png'),
  // profile: require('../assets/images/profileActive.png'),
} as const;

export type AppImage = keyof typeof images;
