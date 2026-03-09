

// import {AppStore} from '../store';
// import SocketIOClient from 'socket.io-client';
// import URLs from '../config/urls';
// import {chatActions} from '../slices/chat.slice';

// let store: AppStore;

// export const injectStore = (_store: AppStore) => {
//   store = _store;
// };

// const options: SocketIOClient.ConnectOpts = {
//   secure: true,
//   reconnectionDelay: 1000,
//   reconnectionDelayMax: 5000,
//   reconnectionAttempts: Infinity,
//   transports: ['websocket'],
// };

// const socket = SocketIOClient(URLs.socketUrl, options);

// socket.on('connect', () => {
//   console.log('Socket connected: %s %s', socket.connected, socket.id);
//   const userId = store.getState().auth.myProfile?._id;
//   if (userId) {
//     joinSocket(userId);
//   }
// });

// export const connect = (): typeof socket => {
//   socket.connect();
//   return socket;
// };

// export const joinSocket = async (id: string) => {
//   if (!socket.id) {
//     throw 'Socket is not connected, Please connect before join.';
//   }
//   socket.emit('customersocket', {customerId: id}, (data: any) => {
//     try {
//       console.log('Customer connect Socket response', data);
//       // const currentRide = store.getState().ride.tripDetail;
//       // if (data.currentOrderId && !currentRide) {
//       //   store.dispatch(getTripDetails(data.currentOrderId));
//       // }
//     } catch (error) {
//       console.log('Error in customer socket emit: ', error);
//     }
//   });
// };

// socket.on('disconnect', () => {
//   console.log('Socket disconnected: %s', socket.disconnected);
// });

// export interface LocationSocketData {
//   angle: number;
//   driverLocation: {coordinates: number[]; type: string};
// }

// export interface ProgressSocketData {
//   distanceRemaining: number;
//   fractionTraveled?: number;
//   durationRemaining: number;
//   distanceTraveled?: number;
// }

// socket.on('order_customer_socket', (data: any) => {
//   console.log('order_customer_socket', data);
//   // if (data.driverMsg) {
//   //   store.dispatch(rideActions.setRequestMessage(data.driverMsg));
//   // }
//   // switch (data.type) {
//   //   case 'orderCancelled':
//   //     if (data.isPaymentFailed) {
//   //       Alert.alert('Order Cancelled', data.paymentFailedMsg, [{text: 'OK'}]);
//   //     } else if (
//   //       data.isPreferredDriver === 'yes' &&
//   //       data.isDriverAssign === false
//   //     ) {
//   //       store.dispatch(requestNormalRide(data.orderId));
//   //     } else if (store.getState().ride.rideStatus !== 'none') {
//   //       toast.show(translate('ride.orderCanceled'), {type: 'warning'});
//   //       store.dispatch(rideActions.orderCanceled());
//   //     } else {
//   //       store.dispatch(rideActions.orderCanceled());
//   //     }
//   //     break;
//   //   case 'orderCancelledByByDriver':
//   //     toast.show(translate('ride.driverCanceled'), {type: 'danger'});
//   //     store.dispatch(rideActions.orderCanceled());
//   //     break;
//   //   case 'orderArrivedAtRestaurant':
//   //   case 'orderAcceptedByDriver':
//   //   case 'orderPickedByDriver':
//   //   case 'secondOrderStartByDriver':
//   //   case 'firstOrderCompleteByDriver':
//   //     const currentRoute = navigationRef.getCurrentRoute()?.name as string;

//   //     if (currentRoute === 'Upcoming' || currentRoute === 'Past') {
//   //       // HACK: To recall the API and update the list on Trips History Screen
//   //       store.dispatch(rideActions.orderCanceled());
//   //     } else {
//   //       store.dispatch(getTripDetails(data.orderId));
//   //     }
//   //     break;
//   //   case 'orderCompletedByDriver':
//   //     const currentOrder = store.getState().ride.tripDetail;
//   //     resetRoot({
//   //       index: 1,
//   //       routes: [
//   //         {name: 'BottomTab'},
//   //         {
//   //           name: 'Feedback',
//   //           params: {
//   //             rideId: data.orderId,
//   //             price: currentOrder?.orderTotal,
//   //             driver: {
//   //               name: currentOrder?.driver?.name,
//   //               image: currentOrder?.driver?.profileImage?.link,
//   //             },
//   //           },
//   //         },
//   //       ],
//   //     });
//   //     break;
//   //   case 'scheduledOrderCancelled':
//   //     store.dispatch(getScheduleRide());
//   // }
// });

// export const disconnectSocket = () => {
//   socket.disconnect();
// };

// // Chat Events
// export const joinChatRoomUser = (userId: string, orderId: string) => {
//   socket.emit('joinChatRoomUser', {userId, orderId}, (data: any) => {
//     console.log('Joined in chat room:', data);
//   });
// };

// export const leaveChatRoomUser = (userId: string) => {
//   socket.emit('leaveChatRoomUser', {userId}, (data: any) => {
//     console.log('Leaved from chat room:', data);
//   });
// };

// export type SendMessagePayload = {
//   sender: string;
//   receiver: string;
//   orderId: string;
//   msg: string;
//   sendBy: number;
// };

// export type GetMessagePayload = {
//   sender: string;
//   receiver: string;
//   orderId: string;
// };

// export const sendMessage = (arg: SendMessagePayload) => {
//   socket.emit('sendMessage', arg, (data: ChatMessage) => {
//     store.dispatch(chatActions.appendMessages(data));
//   });
// };

// socket.on('getMessage', (data: ChatMessage) => {
//   store.dispatch(chatActions.appendMessages(data));
// });

// export const getMessagesList = (payload: GetMessagePayload) => {
//   socket.emit('messagesList', payload, (data: ChatMessage[]) => {
//     store.dispatch(chatActions.setMessages(data));
//   });
// };

// export type ChatMessage = {
//   _id: string;
//   archive: boolean;
//   isRead: boolean;
//   sender: {_id: string; name: string};
//   receiver: {_id: string; name: string};
//   orderId: string;
//   msg: string;
//   sendBy: number;
//   date_created_utc: string;
// };
