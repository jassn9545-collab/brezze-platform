import AsyncStorage from '@react-native-async-storage/async-storage';
import URLs from '../config/urls';
import { authActions } from '../slices/auth.slice';
import axios from 'axios';
import { store } from '../store';

const api = axios.create({
    baseURL: URLs.base,
    headers: {
        Accept: 'application/json',
    },
});
api.interceptors.request.use(request => {
    console.log(
        request.url,
        'request ==>',
        typeof request.data === 'string' ? JSON.parse(request.data) : request.data,
    );
    return request;
});
api.interceptors.response.use(
    response => {
        if (response.data != null && response.data.status === 'success') {
            // const {
            //   data,
            //   config: {url},
            // } = response;
            // console.log(url, 'response =>', JSON.stringify(data));
            return response;
        } else {
            let message = response?.data?.message ?? 'Unknown error';
            if (typeof message !== 'string') {
                message = response?.data?.error_description ?? message.toString();
            }
            toast.show(message, { type: 'warning', duration: 3000 });
            if (
                response.data != null &&
                (!!response.data.isInvalidToken ||
                    response.data.message === 'Not Authorized')
            ) {
                (async () => {
                    await AsyncStorage.setItem('authorized', 'false');
                    await AsyncStorage.removeItem('token');
                    delete api.defaults.headers.Authorization;
                    store.dispatch(authActions.autoLogout());
                })();
            }
            throw response.data;
        }
    },
    error => {
        const errorMessage =
            typeof error?.response?.data?.data === 'string'
                ? error?.response?.data?.data
                : error?.response?.data?.message ?? error?.message;

        toast.show(errorMessage, { type: 'danger' });
        throw {
            message: errorMessage,
            status: 'failed',
            status_code: error.response?.status ?? 500,
        };
    },
);

export default api;
