
const URLs = {
  base: 'https://hirephpdeveloperindia.com/bezzie/api',

  socketUrl: '',

  SHARE_URL: 'https://hirephpdeveloperindia.com/referral',
  inviteUrls: [
    'com.gandharva://invite/link',
    'https://hirephpdeveloperindia.com/referral',
  ],
 
  // API end points
  basicSetting: '/setting',
  registration: '/register',
  resendUserVerifyOtp: '/resend-otp',
  verifyUser: '/verify-otp',
  basicDetail: '/basic-info-update',
  uploadProfile: '/profile-photo-upload',
  userVerificationID: '/id-verification',
  login: '/login',
  profile: '/profile',
  updateProfile: '/update-profile',
  logout: '/logout',
  forgotPassword: '/forget-password',
  verifyOtp: '/forget-password-otp-verification',
  resendOtp: '/resend-otp',
  resetPassword: '/update-password',
  faq: '/get-faq',
  referEarn: '/refer-and-earn',
  withdrawReferEarn: '/withdraw-earning',
  getUserNotifications: '/notifications',

  home: '/home',
  categories: '/all-categories',
  productList: '/product-list',
  productDetail: (id: number) => '/product/' + id,
  addCart: '/add-to-cart',
  cartDetail: '/my-cart',
  addWishlist: '/add-to-wishlist',
  removeWishlist: '/remove-wishlist',
  myWishlist: 'my-wishlist',
  bookedGoldDetail: '/current-gold-in-wallet',
  bookGold: '/gold-booking',
  transections: '/my-gold-bookings',
  
  createOrder: '/make-order',
  orderList: '/my-orders',
  createCustomOrder: '/make-custom-order',
  customOrderList: '/custom-order',

  // sip
  sipTC: '/start-sip',
  sipTCAccept: '/sip-accept-tc',
  makeSipPayment: '/make-sip-payment',
  sipTransaction: '/my-sips',

  myWallet: '/my-wallet',
  myWithdrawal: '/my-withdrawals',
  withdrawSipAmount: '/withdraw-sip-amount',
  buyGoldWithSip: '/buy-gold-with-sip',
  sellGold: '/sell-gold',

  // bank accounts
  addBankAccount: '/add-account',
  editBankAccount: '/update-account',
  bankAccountList: '/my-accounts',
  markPrimaryAccount: '/mark-account-primary',
  deleteBankAcount: '/delete-account'
};

export default URLs;
