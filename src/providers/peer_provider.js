// import param from "../services/param";
// import io from "socket.io-client";
// import "./socketio_provider"
// import authService from "../services/auth.service";
// import Peer from "peerjs";
// import RecordRTC, {invokeSaveAsDialog, RecordRTCPromisesHandler} from "recordrtc"
// import user from "../services/user";
// import {socket, socketCloseCallNotification} from "./socketio_provider";
//
// export let peer;
//
// export const initiatePeer = (userId, channel) => {
//     console.log("Connecting Peer")
//     console.log(param.HOSTNAME + param.PEERPORT + param.peer_endpoint)
//     peer = new Peer(userId, {
//             host: param.HOSTNAME,
//             port: param.PEERPORT,
//             secure: true,
//             path: param.peer_endpoint,
//             config: {
//                 'iceServers': [
//                     {url: 'stun:stun1.l.google.com:19302'},
//                     {url: 'turn:numb.viagenie.ca', credential: 'muazkh', username: 'webrtc@live.com'}
//                 ]
//             }
//         }
//     );
//     peer.on('open', function (id) {
//         console.log('My peer ID is: ' + id);
//     });
//
// };
//
// export const peerMakeCall = (users) => {
//     //Au bout de 20 secondes, on ferme la notification
//     setTimeout(() => {
//         socketCloseCallNotification(users)
//     }, 20000)
// }
//
// export const getAudio = (successCallback, errorCallback) => {
//     navigator.mediaDevices.getUserMedia({
//         audio: true
//     }).then(r => successCallback(r)).catch(err => errorCallback(err))
// }
//
// export const onReceiveStream = (stream) => {
//
// }
//
// export const onReceiveCall = (call) => {
// }
//
// // export const createPeer = (userToSignal, callerID, stream) => {
// //     const peer = new Peer({
// //         initiator: true,
// //         trickle: false,
// //         stream
// //     })
// //
// //     peer.on("signal", signal => {
// //         console.log("Oui j'envoie le signal là")
// //         socket.emit('sending signal', {userToSignal, callerID, signal})
// //     })
// //
// //     return peer
// // }
// // export const addPeer = (incomingSignal, callerID, stream) => {
// //     const peer = new Peer({
// //         initiator: false,
// //         trickle: false,
// //         stream
// //     })
// //     peer.on('signal', signal => {
// //         socket.emit("returning signal", {signal, callerID})
// //     })
// //     peer.signal(incomingSignal)
// // }
// //
//
//
