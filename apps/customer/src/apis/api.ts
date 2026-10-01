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

const clearInvalidSession = async () => {
    await AsyncStorage.setItem('authorized', 'false');
    await AsyncStorage.removeItem('token');
    delete api.defaults.headers.Authorization;
    store.dispatch(authActions.autoLogout());
};

api.interceptors.request.use(async request => {
    if (!request.headers.Authorization) {
        const token = await AsyncStorage.getItem('token');
        if (token) {
            request.headers.Authorization = `Bearer ${token}`;
            api.defaults.headers.Authorization = `Bearer ${token}`;
        }
    }
    if (!request.url?.startsWith('/chat/')) {
        console.log(
            request.url,
            'request ==>',
            typeof request.data === 'string' ? JSON.parse(request.data) : request.data,
        );
    }
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
            const unauthenticated =
                response.data != null &&
                (!!response.data.isInvalidToken ||
                    response.data.message === 'Not Authorized' ||
                    response.data.message === 'Unauthenticated' ||
                    response.data.message === 'Unauthenticated.');
            if (unauthenticated) {
                clearInvalidSession().catch(() => undefined);
            }
            throw response.data;
        }
    },
    error => {
        const unauthenticated = error?.response?.status === 401;
        const errorMessage =
            typeof error?.response?.data?.data === 'string'
                ? error?.response?.data?.data
                : error?.response?.data?.message ?? error?.message;

        if (unauthenticated) {
            clearInvalidSession().catch(() => undefined);
            toast.show('Your session expired. Please login again.', {
                type: 'warning',
            });
        } else {
            toast.show(errorMessage, { type: 'danger' });
        }
        throw {
            message: unauthenticated
                ? 'Your session expired. Please login again.'
                : errorMessage,
            status: 'failed',
            status_code: error.response?.status ?? 500,
        };
    },
);

export default api;
