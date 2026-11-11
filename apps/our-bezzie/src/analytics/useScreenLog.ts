// import {useRef} from 'react';
// import {navigationRef} from '../navigators';

// const useScreenLog = () => {
//   const routeNameRef = useRef<string>(undefined);
//   const onReady = () => {
//     routeNameRef.current = navigationRef.current?.getCurrentRoute()?.name;
//   };

//   const onStateChange = async () => {
//     const currentRouteName = navigationRef.current?.getCurrentRoute()?.name;
//     routeNameRef.current = currentRouteName;
//   };

//   return {onReady, onStateChange};
// };

// export default useScreenLog;
