import io from 'socket.io-client';
import param from "../services/param";
import authService from "../services/auth.service"

export let socket;

export const initiateSocket = (channel) => {
    socket = io(param.SOCKETIOHOST, {transports: ['websocket'], upgrade: false});
    console.log(`Connecting socket...`);
    if (socket && channel) {
        socket.emit('join', channel.name, authService.getCurrentUser().token)
    }
};

export const disconnectSocket = () => {
    console.log('Disconnecting socket...');
    if (socket) socket.disconnect();
};

export const callEventStart = (target) => {
    if (socket) socket.emit('callStart', target)
}

export const socketLeaveCall = (room) => {
    if (socket) socket.emit('leavingCall', room, authService.getCurrentUser().token)
}
export const socketEmitUserLeft = (userToDC, room) => {
    if (socket) socket.emit('emitNewPeers', userToDC, room)
}

export const socketMakeCall = (room, isVideo) => {
    if (socket) socket.emit('makingCall', room, isVideo, authService.getCurrentUser().token)
}
export const socketJoinCall = (room) => {
    if (socket) socket.emit('joinCall', room, authService.getCurrentUser().token)
}

export const socketCloseCallNotification = (users, room) => {
    if (socket) socket.emit('closeCallNotif', users, room, authService.getCurrentUser().token)
}

export const socketSendMessage = (room, message) => {
    if (socket) socket.emit('chat', message, room, authService.getCurrentUser().token, Date.now());
};
export const socketSendCommand = (room, message, parameters) => {

    if (socket) socket.emit('command', room, message, authService.getCurrentUser().token, parameters);
};
