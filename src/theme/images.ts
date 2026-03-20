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
  checkboxFilled: require('../assets/images/checkboxFilled.png'),
  checkboxOutline: require('../assets/images/checkboxOutline.png'),
  successTick: require('../assets/images/successTick.png'),
  calender: require('../assets/images/calender.png'),
  downArrow: require('../assets/images/downArrow.png'),
  uploadingIcon: require('../assets/images/uploadingIcon.png'),
  search: require('../assets/images/search.png'),
  upload: require('../assets/images/upload.png'),
  star: require('../assets/images/star.png'),
  user: require('../assets/images/user.png'),
  share: require('../assets/images/share.png'),
  clock: require('../assets/images/clock.png'),
  
  //
  smileIcon: require('../assets/images/smileIcon.png'),
  smallTick: require('../assets/images/smallTick.png'),
  waitingIcon: require('../assets/images/waitingIcon.png'),
  crossIcon: require('../assets/images/crossIcon.png'),
  
  
  // app
  menuIcon: require('../assets/images/menuIcon.png'),
  notification: require('../assets/images/notification.png'),
  filter: require('../assets/images/filter.png'),
  savedIcon: require('../assets/images/savedIcon.png'),
  unsavedIcon: require('../assets/images/unsavedIcon.png'),
  threeDotIcon: require('../assets/images/threeDotIcon.png'),
  tickIcon: require('../assets/images/tickIcon.png'),
  verified: require('../assets/images/verified.png'),
  
  //drawer
  drawerSearch: require('../assets/images/drawerSearch.png'),
  document: require('../assets/images/document.png'),
  bag: require('../assets/images/bag.png'),
  

  // bottom tab icons
  home: require('../assets/images/home.png'),
  hireJobs: require('../assets/images/hireJobs.png'),
  chat: require('../assets/images/chat.png'),
  profile: require('../assets/images/profile.png'),
  // inbox: require('../assets/images/inbox.png'),
} as const;

export type AppImage = keyof typeof images;
