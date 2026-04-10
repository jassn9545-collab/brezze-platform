import { authReducer } from '../slices/auth.slice';
import { settingReducer } from '../slices/setting.slice';

export const reducer = {
    setting: settingReducer,
    auth: authReducer,
};
