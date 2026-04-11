import { authReducer } from '../slices/auth.slice';
import { jobReducer } from '../slices/job.slice';
import { settingReducer } from '../slices/setting.slice';

export const reducer = {
    setting: settingReducer,
    auth: authReducer,
    job: jobReducer
};
