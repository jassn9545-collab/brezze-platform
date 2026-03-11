// import {AppDispatch, RootState} from './store';
// import {TypedUseSelectorHook, useDispatch, useSelector} from 'react-redux';
// import {useEffect} from 'react';

// import {AppState} from 'react-native';
// import type {AppStateStatus} from 'react-native';
// import {useState} from 'react';

// type DispatchFunc = () => AppDispatch;
// export const useAppDispatch: DispatchFunc = useDispatch;
// export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// export const useIsForeground = (): boolean => {
//   const [isForeground, setIsForeground] = useState(true);

//   useEffect(() => {
//     const onChange = (state: AppStateStatus): void => {
//       setIsForeground(state === 'active');
//     };
//     const listener = AppState.addEventListener('change', onChange);
//     return () => listener.remove();
//   }, [setIsForeground]);

//   return isForeground;
// };
