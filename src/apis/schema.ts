import * as yup from 'yup';

// Error Builder
export function buildError<Type>(error: yup.ValidationError): Type {
  return error.inner.reduce((acc: Type, value: any) => {
    acc[value.path as keyof Type] = value.message;
    return acc;
  }, {} as Type);
}

export const userSchema = yup.object().shape({
  name: yup.string().required('validation.required'),
  country_code: yup.string(),
  phone: yup
    .string()
    .min(6, 'validation.minMobileNo')
    .max(15, 'validation.maxMobile')
    .required('validation.required'),
  email: yup
    .string()
    .min(3, 'validation.minEmail')
    .email('validation.invalidEmail')
    .required('validation.required'),
  password: yup.string().when('$isSignup', {
    is: true,
    then: schema =>
      schema
        .min(6, 'validation.shortPassword')
        .max(50, 'validation.longPassword')
        .required('validation.required'),
    otherwise: schema => schema.notRequired(),
  }),
  confirmPassword: yup.string().when('$isSignup', {
    is: true,
    then: schema =>
      schema
        .oneOf([yup.ref('password')], 'validation.passwordsNotMatched')
        .required('validation.required'),
    otherwise: schema => schema.notRequired(),
  }),
  firebaseToken: yup.string(),
});

export type Registration = yup.InferType<typeof userSchema>;

export const academyListSchema = yup.object().shape({
  page: yup.number().required(),
  limit: yup.number().required(),
  order_by: yup.string(),
  search_string: yup.string().required(),
});

export type AcademyList = yup.InferType<typeof academyListSchema>;

export const playerListSchema = yup.object().shape({
  radius: yup.number(),
  latitude: yup.number(),
  longitude: yup.number(),
});
export type playerListParams = yup.InferType<typeof playerListSchema>;

export const loginSchema = yup.object().shape({
  email: yup
  .string()
  .min(3, 'validation.minEmail')
  .email('validation.invalidEmail')
  .required('validation.required'),
  password: yup.string().required('validation.required'),
  firebaseToken: yup.string(),
  checked: yup.boolean(),
});

export type Signin = yup.InferType<typeof loginSchema>;

export const forgotPasswordSchema = yup.object().shape({
  email: yup
  .string()
  .min(3, 'validation.minEmail')
  .email('validation.invalidEmail')
  .required('validation.required'),
});

export type ForgotPasswordParam = yup.InferType<typeof forgotPasswordSchema>;

export const changePasswordSchema = yup.object().shape({
  currentPassword: yup.string().required('validation.required'),
  password: yup
    .string()
    .min(3, 'validation.shortPassword')
    .max(50, 'validation.longPassword')
    .required('validation.required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password'), undefined], 'validation.passwordsNotMatched')
    .required('validation.required'),
});

export type ChangePasswordParams = yup.InferType<typeof changePasswordSchema>;

export const resetPasswordSchema = yup.object().shape({
  user_id: yup.number(),
  new_password: yup
    .string()
    .min(6, 'validation.shortPassword')
    .max(50, 'validation.longPassword')
    .required('validation.required'),
  confirmed_password: yup
    .string()
    .oneOf(
      [yup.ref('new_password'), undefined],
      'validation.passwordsNotMatched',
    )
    .required('validation.required'),
});

export type ResetPasswordParams = yup.InferType<typeof resetPasswordSchema>;

export const basicDetailSchema = yup.object().shape({
  name: yup.string().required('validation.required'),
  country_code: yup.string(),
  phone: yup
    .string()
    .min(6, 'validation.minMobileNo')
    .max(15, 'validation.maxMobile')
    .required('validation.required'),
  email: yup
    .string()
    .min(3, 'validation.minEmail')
    .email('validation.invalidEmail')
    .required('validation.required'),
  dob: yup.string().required('validation.required'),
  skills: yup
    .array()
    .of(yup.string())
    .min(1, 'validation.required')
    .required('validation.required'),
  hourPrice: yup
    .number()
    .typeError('validation.required')
    .required('validation.required'),
  streetAddress: yup.string().required('validation.required'),
  state: yup.string().required('validation.required'),
  zipCode: yup.string().required('validation.required'),
});

export type BasicUserDetailParams = yup.InferType<typeof basicDetailSchema>;

export const cardDetailSchema = yup.object().shape({
  idType: yup.string().required('validation.required'),
  idNumber: yup.string().required('validation.required'),
  expiryDate: yup.string().required('validation.required'),
});

export type CardDetailParams = yup.InferType<typeof cardDetailSchema>;


export const helpSchema = yup.object().shape({
  name: yup.number(),
  email: yup
    .string()
    .min(3, 'validation.minEmail')
    .email('validation.invalidEmail')
    .required('validation.required'),
  mobileNumber: yup.string(),
  msg: yup
    .string()
    .min(10, 'validation.minMessage')
    .required('validation.required'),

  countryCode: yup.string(),
});

export type HelpParams = yup.InferType<typeof helpSchema>;

export const createPasswordSchema = yup.object().shape({
  password: yup
    .string()
    .min(3, 'validation.shortPassword')
    .max(50, 'validation.longPassword')
    .required('validation.required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password'), undefined], 'validation.passwordsNotMatched')
    .required('validation.required'),
  mobileNumber: yup.string().required('validation.required'),
  countryCode: yup.string().required('validation.required'),
});

export type CreatePasswordParams = yup.InferType<typeof createPasswordSchema>;

export const editProfile = yup.object().shape({
  name: yup.string(),
  country_code: yup.string(),
  phone: yup
    .string()
    .min(6, 'validation.minMobileNo')
    .max(15, 'validation.maxMobile')
    .required('validation.required'),
  email: yup.string(),
  image: yup.string(),
});

export type editProfileParams = yup.InferType<typeof editProfile>;

export const addAddressScheme = yup.object().shape({
  name: yup.string(),
  address: yup.string().required('validation.required'),
  landmark: yup.string(),
  city: yup.string(),
  state: yup.string(),
  pinCode: yup.string(),
  country_code: yup.string(),
  mobileNumber: yup
    .string()
    .min(6, 'validation.minMobileNo')
    .max(15, 'validation.maxMobile')
    .required('validation.required'),
  anotherMobileNumber: yup
    .string()
    .min(6, 'validation.minMobileNo')
    .max(15, 'validation.maxMobile')
    .notRequired(),
});

export const jobApplySchema = yup.object().shape({
  bidAmount: yup.string().required('validation.required'),
  estimatedTime: yup.string().required('validation.required'),
});

export type JobApplyParams = yup.InferType<typeof jobApplySchema>;