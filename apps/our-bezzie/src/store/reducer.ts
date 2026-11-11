import {authReducer} from '../slices/auth.slice';
import { homeReducer } from '../slices/home.slice';
import { settingReducer } from '../slices/setting.slice';

export const reducer = {
  setting: settingReducer,
  auth: authReducer,
  home: homeReducer
};
