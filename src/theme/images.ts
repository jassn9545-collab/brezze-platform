// import { search } from "../apis/googleAPIs";

export const images = {
  // Toast
  success: require('../assets/images/success.png'),
  danger: require('../assets/images/danger.png'),
  warning: require('../assets/images/warning.png'),

  // walktthrough
  walkthrough1: require('../assets/images/walkthrough1.png'),
  walkthrough2: require('../assets/images/walkthrough2.png'),
  walkthrough3: require('../assets/images/walkthrough3.png'),

  //bottom tab icons
  home: require('../assets/images/home.png'),
  service: require('../assets/images/serviceIcon.png'),
  chat: require('../assets/images/chat.png'),
  professionalProfile: require('../assets/images/profileIcon.png'),
  //

  categories: require('../assets/images/electrician.png'),
  user: require('../assets/images/user.png'),
  tickIcon: require('../assets/images/tickIcon.png'),
  share: require('../assets/images/share.png'),
  uploadingIcon: require('../assets/images/uploadingIcon.png'),

  smileIcon: require('../assets/images/smileIcon.png'),
  smallTick: require('../assets/images/smallTick.png'),
  waitingIcon: require('../assets/images/waitingIcon.png'),

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
  logoutIcon: require('../assets/images/logoutIcon.png'),
  calender: require('../assets/images/calender.png'),
  downArrow: require('../assets/images/downArrow.png'),
  address: require('../assets/images/address.png'),
  myLocationRounded: require('../assets/images/my-location-rounded.png'),
  locationPin: require('../assets/images/locationPin.png'),
  camera: require('../assets/images/camera.png'),
  info: require('../assets/images/info.png'),

  // Homepage
  navbaricon: require('../assets/images/navbaricon.png'),
  bellIcon: require('../assets/images/bellIcon.png'),
  searchIcon: require('../assets/images/searchIcon.png'),
  homeImage: require('../assets/images/homeimage.png'),
  filterIcon: require('../assets/images/filterIcon.png'),
  electrician: require('../assets/images/electrician.png'),
  plumbing: require('../assets/images/plumbing.png'),
  carpenter: require('../assets/images/carpenter.png'),
  cleaning: require('../assets/images/cleaning.png'),
  carpet: require('../assets/images/carpet.png'),
  appliance: require('../assets/images/appliance.png'),
  acrepair: require('../assets/images/acrepair.png'),
  garden: require('../assets/images/garden.png'),
  profile1: require('../assets/images/profile1.png'),
  profile2: require('../assets/images/profile2.png'),
  checkIcon: require('../assets/images/checkIcon.png'),
  switchbox: require('../assets/images/switchbox.png'),
  searchService: require('../assets/images/SearchServiceIcon1.png'),

  // side menu icons

  plusIconCircle: require('../assets/images/plusIconCircle.png'),
  myJobs: require('../assets/images/myjobIcon.png'),
  hireHistrory: require('../assets/images/hireHistoryIcon.png'),
  notificationIcon: require('../assets/images/roketIcon.png'),
  paymentIcon: require('../assets/images/paymentIcon.png'),
  privacyIcon: require('../assets/images/privacyIcon.png'),
  helpIcon: require('../assets/images/helpIcon.png'),
  passwordIcon: require('../assets/images/passwordIcon.png'),
  greenCheckIcon: require('../assets/images/greenCheck.png'),

  // bottom tab icons
  // home: require('../assets/images/homeActive.png'),
  // search: require('../assets/images/searchActive.png'),
  // productList: require('../assets/images/shopActive.png'),
  // sip: require('../assets/images/sipActive.png'),
  // profile: require('../assets/images/profileActive.png'),
} as const;

export type AppImage = keyof typeof images;
