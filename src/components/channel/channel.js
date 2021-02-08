import React, {useEffect, useState, useRef} from "react";
import "./channel.styles.scss"
import Picture from "../picture/picture"
import YouTube from 'react-youtube';
import {
    disconnectSocket,
    initiateSocket,
    socket, socketCloseCallNotification, socketEmitUserLeft, socketJoinCall, socketLeaveCall, socketMakeCall,
    socketSendCommand,
    socketSendMessage
} from "../../providers/socketio_provider";
import useUser from "../../services/use-user";
import axios from "axios";
import param from "../../services/param";
import authHeader from "../../services/auth-header";

import dayjs from "dayjs";
import 'dayjs/locale/fr'
import relativeTime from "dayjs/plugin/relativeTime"
import Loading from "../loading/loading";
import {useHistory} from "react-router-dom";
import DeleteAlert from "../alert/delete-alert";
import Navigation from "../navigation/navigation";
import ChannelPassword from "../channel_password/channel_password";
import Alert from "../alert/alert";
import 'emoji-mart/css/emoji-mart.css'
import {Picker} from 'emoji-mart'
import CallAlert from "../call/call-alert";
import CallOverlay from "../call/call-overlay";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faSignOutAlt} from "@fortawesome/free-solid-svg-icons";
import notificationJoin from "../../assets/discord-join-sound-effect-download.mp3"
import notificationLeave from "../../assets/discord-leave-sound-effect-hd.mp3"

import Peer from 'simple-peer'
import Toast from "../toast/toast";

dayjs.extend(relativeTime);

const Channel = ({channelData, showNav = true}) => {

    console.log('root comp')

    let globalLastMessage;

    const history = useHistory();

    const userState = useUser();

    const [msgHistory, setMsgHistory] = useState([""]);
    const historyCount = useRef(0);

    const [enteringCall, setEnteringCall] = useState(false);
    const [isRoomInCall, setIsRoomInCall] = useState(false);
    const [isInCall, setIsInCall] = useState(false);
    const [isCaller, setIsCaller] = useState(false);
    const [mute, setMute] = useState(false);
    const [peers, setPeers] = useState([]);
    const [showMessages, setShowMessages] = useState(false)
    const [toastMsg, setToastMsg] = useState("");

    let streamRef = useRef();

    const peersRef = useRef([]);
    const usersInChan = useRef([]);
    const [notificationSound, setNotificationSound] = useState(null);
    const [messagesLoading, setMessagesLoading] = useState(false);
    const msgCount = useRef(0);

    const additionalMsg = useRef(0);
    const [isError, setIsError] = useState(false);

    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const [quitAlertMsg, setQuitAlertMsg] = useState("");
    const [alertTitle, setAlertTitle] = useState("")
    const [alertMsg, setAlertMsg] = useState("");
    const [formAlertMsg, setFormAlertMsg] = useState("");
    const [deleteAlertMsg, setDeleteAlertMsg] = useState("");
    const [channelDelete, setChannelDelete] = useState("");

    const [message, setMessage] = useState("");
    const [messageFeed, setMessageFeed] = useState([]);
    const [isFetchingData, setIsFecthingData] = useState(true);
    const [refMessage, setRefMessage] = useState(null);
    const [autocomplete, setAutocomplete] = useState("");
    const [isWritingCommand, setIsWritingCommand] = useState(false);
    const [isCommandListOpen, setIsCommandListOpen] = useState(false);
    const [passwordTitle, setPasswordTitle] = useState("");
    const [slug, setSlug] = useState("");
    const [isChannelAdmin, setIsChannelAdmin] = useState(false);
    const [commandList, setCommandList] = useState([]);

    useEffect(() => {
        if (!userState.isLoading && !userState.isError) {

            document.querySelector(".channel-message-container").addEventListener('scroll', trackScrolling);

            //Get channels message
            axios.get(param.channel.getMessages + "?channel=" + channelData._id, {headers: authHeader()})
                .then((resp) => {
                    globalLastMessage = {
                        username: null,
                        isJoinMessage: false,
                        date: null,
                    };
                    msgCount.current = msgCount.current + 1
                    resp.data.forEach((msg) => {
                        displayMessage(globalLastMessage, msg);
                        globalLastMessage = {username: msg.user.username, isJoinMessage: false, date: msg.date};
                    });
                    setIsFecthingData(false);
                })
                .catch((e) => {
                    console.log(e)
                    setIsError(true)
                    setAlertMsg(e.response?.data?.message ?? param.messages.errDefault)
                });

            if (userState.user._id === channelData.creator) {
                setIsChannelAdmin(true)
            }
        }

        return () => {
            document.querySelector(".channel-message-container").removeEventListener('scroll', trackScrolling);
        }
    }, [userState, channelData]);

    useEffect(() => {
        if (!isFetchingData) {
            scrollToBottom();

            initiateSocket(channelData);
            socket.on("userJoin", (sentence, isChannelInCall) => {
                setIsRoomInCall(isChannelInCall)
                setMessageFeed((oldValue) => {
                    return [...oldValue, joinMessageTemplate(sentence)]
                });
                globalLastMessage = {username: "", isJoinMessage: true, date: ""};
                scrollToBottom()
            });

            socket.on("chatMessage", (sentence, user, date) => {
                additionalMsg.current = additionalMsg.current + 1;
                displayMessage(globalLastMessage, {message: sentence, user: user, date});
                globalLastMessage = {username: user.username, isJoinMessage: false, date: date};
                scrollToBottom()
            });

            socket.on("commandCallback", (message) => {
                handleCommandResponse(message)
            });

            socket.on("userLeft", (sentence) => {
                setMessageFeed((oldValue) => {
                    return [...oldValue, joinMessageTemplate(sentence)]
                });
                globalLastMessage = {username: "", isJoinMessage: true, date: ""};
                scrollToBottom()
            });

            return () => {
                //Resetting data when quitting component
                setCommandList([]);
                setMessage("");
                setMessageFeed([]);
                setIsFecthingData(true);
                setRefMessage(null);
                setAutocomplete("");
                setIsWritingCommand(false);
                setIsCommandListOpen(false);
                setCommandList([]);
                globalLastMessage = null;
                socketLeaveCall(channelData.name)
                disconnectSocket();
            }
        }
    }, [isFetchingData, channelData]);

    useEffect(() => {
            if (!isFetchingData) {
                socket.on("incomingCall", () => {
                    setAlertTitle("Appel entrant...")
                    setIsCaller(false)
                    setEnteringCall(true)
                })

                socket.on("closeTiming", (users) => {
                    usersInChan.current = users;
                    setTimeout(() => {

                        if (!isInCall) {
                            setIsCaller(false)
                            setEnteringCall(false)
                            socketCloseCallNotification(users, channelData.name)
                        }
                    }, 30000)
                })

                socket.on("joinExistingCall", async (users) => {
                        streamRef.current = await navigator.mediaDevices.getUserMedia({audio: true});
                        setEnteringCall(false)
                        setIsInCall(true)
                        const peers = []
                        users.forEach(userId => {
                            if (userId.userId ?? userId == userState.user?._id) return
                            const peer = createPeer(userId.userId ?? userId, userState.user?._id, streamRef.current)
                            peersRef.current.push({
                                userId: userId.userId ?? userId,
                                peer
                            })
                            peers.push({peer, userId: userId.userId ?? userId})
                        })
                        setPeers(peers)
                    }
                )

                socket.on('closeCall', () => {
                    if (streamRef.current) {
                        streamRef.current.getTracks().forEach(function (track) {
                            track.stop();
                        });
                    }
                    setEnteringCall(false);
                    setIsInCall(false);
                    setPeers([])
                    peersRef.current = [];
                })

                socket.on('user joined', async payload => {
                    if (!streamRef.current) streamRef.current = await navigator.mediaDevices.getUserMedia({audio: true});
                    setIsInCall(true)
                    setEnteringCall(false)
                    setIsCaller(false)
                    const peer = addPeer(payload.signal, payload.callerID, streamRef.current)

                    peersRef.current.push({
                        userId: payload.callerID,
                        peer: peer.peer
                    })
                    setPeers((oldValue) => {
                        return [...oldValue, peer]
                    });
                })

                socket.on("receiving returned signal", payload => {
                    const item = peersRef.current.find(p => p.userId.toString() == payload.userId.toString())
                    item.peer.signal(payload.signal)

                })

                socket.on("dc", () => {
                    if (streamRef.current) {
                        streamRef.current.getTracks().forEach(function (track) {
                            track.stop();
                        });
                        streamRef.current = null
                    }
                })

                socket.on("disconectPeer", usrToDC => {
                    setNotificationSound(notificationLeave)
                    playAudio();
                    const item = peersRef.current.findIndex(p => p.userId.toString() == usrToDC.toString())
                    if (peersRef.current[item]) {
                        peersRef.current[item].peer.destroy();
                        peersRef.current.splice(item, 1)
                        if (peersRef.current.length > 0) {
                            setPeers(() => {
                                return [peersRef.current[0]]
                            })
                        } else {
                            setPeers([])
                        }
                    }
                    if (peersRef.current.length <= 0) {
                        if (streamRef.current) {
                            streamRef.current.getTracks().forEach(function (track) {
                                track.stop();
                            });
                        }
                        setPeers([])
                        peersRef.current = []
                        setIsInCall(false);
                    }
                })
                socket.on('channelInCall', () => {
                    setIsRoomInCall(true)
                })

                socket.on('notInCall', () => {
                    setIsRoomInCall(false)
                })


                window.addEventListener("beforeunload", (ev) => {
                    // ev.preventDefault()
                    return socketLeaveCall(channelData.name);
                });

            }
            return () => {
                setIsInCall(false)
                setPeers([])
                peersRef.current = []
                if (streamRef.current) {

                    streamRef.current.getTracks().forEach(function (track) {
                        track.stop();
                    });
                }
            }
        },[isFetchingData, channelData])

    //Peer js
    const createPeer = (userToSignal, callerID, stream) => {
        setNotificationSound(notificationJoin);
        playAudio();
        const peer = new Peer({
            initiator: true,
            trickle: false,
            stream
        })
        peer.on("signal", signal => {
            socket.emit('sending signal', {userToSignal, callerID, signal})
        })

        return peer
    }

    const addPeer = (incomingSignal, callerID, stream) => {
        setNotificationSound(notificationJoin);
        playAudio();
        const peer = new Peer({
            initiator: false,
            trickle: false,
            stream
        })
        peer.on('signal', signal => {
            socket.emit("returning signal", {signal, callerID, userId: userState.user?._id})
        })
        peer.signal(incomingSignal);

        return {peer, userId: callerID};
    }

    const makeCall = () => {
        if (!isInCall) {
            if (!isRoomInCall) {
                setAlertTitle("Appel en cours...")
                setEnteringCall(true)
                setIsCaller(true)
            }
            socketMakeCall(channelData, false)
        } else {
            setShowMessages(!showMessages)
        }
    }

    const makeVideoCall = () => {

    }

    const trackScrolling = () => {
        const wrappedElement = document.querySelector(".channel-message-container > div:first-of-type");
        const chanCont = document.querySelector(".channel-message-container");

        //Todo: Corriger
        if (isTop(wrappedElement, chanCont) && !messagesLoading) {
            chanCont.removeEventListener('scroll', trackScrolling);
            getOlderMessages()
            chanCont.scrollBy(0, 10)
        }
    }

    const isTop = (el) => {
        let nav = document.querySelector(".Navigation")?.getBoundingClientRect()?.height;
        let title = document.querySelector('.title-container.container')?.getBoundingClientRect()?.height
        return ((nav ?? 0) + title) === el?.getBoundingClientRect().top;
    }

    const getOlderMessages = () => {
        setMessagesLoading(true)
        axios.get(param.channel.getMessages + "?channel=" + channelData._id + "&reqiteration=" + (msgCount.current <= 0 ? 0 : msgCount.current) + "&addmsg=" + additionalMsg.current, {headers: authHeader()})
            .then((resp) => {
                console.log('response older message :', resp)
                msgCount.current = msgCount.current + 1

                if (resp.data.length > 0) {
                    document.querySelector(".channel-message-container").addEventListener('scroll', trackScrolling);
                }

                resp.data.forEach((msg, index) => {
                    displayMessage(globalLastMessage, msg, null, true, resp.data.length === index + 1);
                    globalLastMessage = {username: msg.user.username, isJoinMessage: false, date: msg.date};
                });
                setMessagesLoading(false)
            })
            .catch((e) => {
                setIsError(true)
                setAlertMsg(e.response?.data?.message ?? param.messages.errDefault)
            });
    }

    const handleCallResponse = (button) => {
        switch (button) {
            case"accept":
                socketJoinCall(channelData.name)
                break;
            case "decline":
                setEnteringCall(false)
                if (isCaller && usersInChan.current.length > 0) socketCloseCallNotification(usersInChan.current, channelData.name)
                break;
            case"video":
                break
            case "mute":
                setMute(!mute)
                streamRef.current.getTracks().forEach((track) => {

                    track.enabled = mute
                })
                break;
            case "msg-icon":
                setShowMessages(!showMessages)
                break;
            case "hangup":
                socketLeaveCall(channelData.name)
                setPeers([])
                peersRef.current = []
                setIsInCall(false);
                break
        }
    }

    const playAudio = () => {
        document.getElementById("notification").play()
    }


    const scrollToBottom = () => {
        if (refMessage) refMessage.scrollIntoView()
    };

    const closeCommandList = () => {
        if (isCommandListOpen) setIsCommandListOpen(false)
    };

    const openCommandList = () => {
        if (!isCommandListOpen && isWritingCommand) {

            setIsCommandListOpen(true)
        }
    };

    const writeMessage = (e, msgHistory) => {
        let msg = msgHistory ?? e.target.value;
        //Gestion des commandes
        if (msg.trim()[0] === "/") {
            setIsWritingCommand(true);
            setIsCommandListOpen(true);
            let commandeValue = msg.trim().replace('/', '').toLowerCase().split(" ")[0];
            let commandFiltered;
            setCommandList(param.commandes);
            if (commandeValue) commandFiltered = param.commandes.filter(cmd => cmd.command.startsWith(commandeValue) && !cmd.hidden);
            if (commandFiltered && commandFiltered.length > 0) {
                setAutocomplete("/" + commandFiltered[0].command);
                setCommandList(commandFiltered);
            } else setAutocomplete("");

            if ((!commandFiltered || commandFiltered.length <= 0) && commandeValue.length > 0) setCommandList([]);

        } else {
            setAutocomplete("");
            setIsWritingCommand(false);
        }
        setMessage(msg)
    };

    const selectCommand = (cmd) => {
        setAutocomplete("/" + cmd.command);
        setMessage("/" + cmd.command + " ");
        setIsWritingCommand(true);
        setIsCommandListOpen(false);
    };

    const handleKeyPress = (e) => {
        if (e.key === "ArrowUp") changeMsg("up")
        if (e.key === "ArrowDown") changeMsg("down")
        if (e.key === "Enter") sendMessage(e);
        if (e.key === "Tab" && autocomplete.length > 0) {
            e.preventDefault();
            setMessage(autocomplete + " ")
        }
    };

    const changeMsg = (direction) => {
        if (msgHistory.length > 1) {
            switch (direction) {
                case "up":
                    if (historyCount.current < (msgHistory.length - 1)) {
                        historyCount.current = historyCount.current + 1
                    }
                    break;
                case "down":
                    if (historyCount.current > 0) {
                        historyCount.current = historyCount.current - 1
                    }
                    break;
            }
            if (!msgHistory[msgHistory.length - historyCount.current]) {
                setMessage("")
            } else {
                writeMessage(null, msgHistory[msgHistory.length - historyCount.current])
            }
        }
    }

    const sendMessage = (e) => {
        e.preventDefault();
        if (message.length > 0) {
            setMsgHistory((oldValue) => {
                return [...oldValue, message]
            })
            historyCount.current = 0
            if (isWritingCommand) {
                let parameters = message.replace('/', '').split(' ');
                const value = message.replace('/' + parameters[0] + ' ' + parameters[1] + ' ', '')
                socketSendCommand(channelData, parameters[0].toLowerCase(), parameters);
                axios.post(param.commands.send,
                    {
                        command: parameters[0].toLowerCase(),
                        parameter: parameters[1],
                        channel: channelData._id,
                        value
                    },
                    {headers: authHeader()})
                    .then((response) => {
                        handleCommandResponse(response.data)
                    }).catch((err) => {
                        setToastMsg(err?.response?.data?.message ?? param.messages.errDefault)
                    }
                );
                setMessage("");
                setAutocomplete("");
                setIsWritingCommand(false);
            } else {
                socketSendMessage(channelData, message);
                setMessage("");
            }
        }
    };

    const onCloseToast = () => {
        setToastMsg("")
    }

    const handleCommandResponse = (response) => {
        //  TODO: Modifier pour rendre l'affichage du nickname dynamique
        const data = response.data ?? response;
        if (data) {
            switch (data.action) {
                case "nick":
                    displayMessage({date: Date.now()}, {
                        message: response.message,
                        user: param.bot,
                    }, param.bot.picture);
                    break
                case "join":
                    history.push("/channels/" + data.channel);
                    break;
                case "join_password":
                    setSlug(data.channel);
                    setPasswordTitle(response.message);
                    break;
                case "quit":
                    if (channelData.slug === data.channel) {
                        history.push("/home");
                    } else {
                        displayMessage({date: Date.now()}, {
                            message: data.message,
                            user: param.bot,
                        }, param.bot.picture);
                    }
                    break;
                case "delete":
                    setChannelDelete(data);
                    setDeleteAlertMsg(response.message);
                    break;
                case "create":
                    history.push("/channels/" + data.channel)
                    break;
                case "listuser":
                    displayMessage({date: Date.now()},
                        {
                            message: botListCommandTemplate(data.users, param.messages.bot.displayUserList),
                            user: param.bot
                        },
                        param.bot.picture
                    )
                    scrollToBottom();
                    break;
                case "list":
                    displayMessage({date: Date.now()}, {
                        message: botListCommandTemplate(data.channels, param.messages.bot.displayChannel),
                        user: param.bot,
                    }, param.bot.picture);
                    scrollToBottom();
                    break;
                case "diablox9":
                    displayMessage({
                        date: Date.now()
                    }, {
                        message: botEasterEgg(data.video),
                        user: param.bot,
                    }, param.bot.picture)
                    scrollToBottom()
                    break;
                case "gotaga":
                    displayMessage({
                        date: Date.now()
                    }, {
                        message: botEasterEgg(data.video),
                        user: param.bot,
                    }, param.bot.picture)
                    scrollToBottom()
                    break;
            }
        }
    };

    const deleteChannel = () => {
        axios.get(param.channel.delete + channelDelete.channel, {headers: authHeader()})
            .then((response) => {
                setDeleteAlertMsg("");
                setChannelDelete("");
                if (channelDelete.channel === channelData.slug) history.push("/home")
            })
            .catch((err) => {
                    console.log(err)
                    setAlertMsg(err.response?.data?.message ?? param.messages.errDefault)
                }
            )

    };

    const displayMessage = (lastMessage, msg, picture, tobegining, isLastOldMsg) => {
        const lastMsgDate = dayjs(lastMessage.date);
        const msgDate = dayjs(msg.date);
        if (lastMessage && lastMsgDate && lastMessage.username === msg.user.username &&
            !lastMessage.isJoinMessage && msgDate.diff(lastMsgDate, 'minute') < 3 && !isLastOldMsg) {
            if (tobegining) {
                setMessageFeed((oldValue) => {
                    return [sameUsernameMessageTemplate(msg.message, msg?._id), ...oldValue]
                });
            } else {
                setMessageFeed((oldValue) => {
                    return [...oldValue, sameUsernameMessageTemplate(msg.message, msg?._id)]
                });
            }
            
        } else {
            if (tobegining) {
                setMessageFeed((oldValue) => {
                    return [messageTemplate(msg.message, msg.user, msg.date, picture ?? null, msg?._id), ...oldValue]
                });
            } else {
                setMessageFeed((oldValue) => {
                    return [...oldValue, messageTemplate(msg.message, msg.user, msg.date, picture ?? null, msg?._id)]
                });
            }            
        }
    };

    const connectChannel = (password) => {
        axios.post(param.channel.connect, {slug, password}, {headers: authHeader()})
            .then((response) => {
                setSlug("");
                setFormAlertMsg("")
                setPasswordTitle("")
                history.push({
                    pathname: '/channels/' + response.data.slug,
                    state: {slug: response.data.slug}
                })
            }).catch((err) => {

            setFormAlertMsg(err?.response?.data?.message ?? param.messages.errDefault)
        })
    };

    const handleLeave = () => {
        setQuitAlertMsg(param.messages.channel.quit)
    };

    const quitChannel = () => {
        axios.post(param.channel.leave, {
                channel: channelData._id
            }, {headers: authHeader()}
        ).then((resp) => {
            setQuitAlertMsg("")
            history.push("/home")
        }).catch((err) => {
            setQuitAlertMsg("")
            setIsError(true)
            setAlertMsg(err.response?.data?.message ?? param.messages.errDefault)
        })
    }

    const sameUsernameMessageTemplate = (message, id = Date.now()) => {
        return (
            <div className={"same-message"} key={id}>
                <pre>
                   {message}
                </pre>
            </div>
        )
    };

    const joinMessageTemplate = (message) => {
        return (
            <div key={Date.now()} className="context-message">
                {message}
            </div>
        )
    };

    const messageTemplate = (message, user, date, picture, id = Date.now()) => {
        return (
            <div key={id} className="message">
                <Picture size="40px" src={picture ? picture : user.picture ? param.img + user.picture : null}
                         name={user.picture ? null : picture ? null : user.username}/>
                <div className="container-info">
                    <div className="userinfo">
                        <span>{user.username}</span>
                        <span className="date">{dayjs(date, {locale: "fr"}).fromNow()}</span>
                    </div>
                    <div className="text">
                        <pre>
                            {message}
                        </pre>
                    </div>
                </div>
            </div>
        )
    };

    const botEasterEgg = (data) => {
        return (
            <div>
                <YouTube
                    videoId={data}
                    opts={{
                        height: "auto",
                        width: "auto"
                    }}
                    onReady={(event) => {
                        event.target.playVideo()
                    }}/>
            </div>
        )
    }

    const botListCommandTemplate = (list, message) => {
        return (
            <div>
                {message}
                <ul className="user-list">
                    {list.map((element) => {
                        return (
                            <li key={element._id ?? Date.now()}>{element.username ?? element.name}</li>
                        )
                    })}
                </ul>
            </div>
        )
    }

    const handleClose = () => {
        setAlertMsg("")
        if (isError) {
            setIsError(false);
            return
        }
        history.push({pathname: `/home`})
    }

    const getChannelName = () => {
        let name = channelData.name
        if (name.match(/%.+%/g) && channelData.users[0]) {
            name = channelData.users[0]._id._id === userState?.user?._id ? channelData.users[1]._id.username : channelData.users[0]._id.username
        }
        return name
    }

    return (
        <div className="channel-content-container">
            {toastMsg.length > 0 &&
            <Toast displayTime={7000} text={toastMsg} onClose={() => {
                onCloseToast()
            }}/>
            }
            {alertMsg.length > 0 &&
            <Alert isError={isError} message={alertMsg} onClose={() => {
                handleClose();
            }}/>
            }
            {isFetchingData &&
            <Loading/>
            }
            {enteringCall &&
            <CallAlert
                isCaller={isCaller}
                alertTitle={alertTitle}
                onClick={(button) => {
                    handleCallResponse(button)
                }}
                channel={{name: channelData.name, picture: channelData.picture, users: channelData.users}}
            />
            }
            {isInCall &&
            <CallOverlay hide={showMessages} muted={mute} onClick={(button) => {
                handleCallResponse(button)
            }} peers={peers}/>
            }
            <audio src={notificationSound} id="notification"/>
            <div className={`wrapper ${isFetchingData ? "hidden" : ""}`}>
                <div onClick={() => closeCommandList()} className="title-container container">
                    <h2>{getChannelName()}</h2>
                    <div className="svg-container">
                        <svg onClick={() => {
                            makeCall()
                        }} width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path className={`call-red ${isRoomInCall ? "in-call" : ""}`}
                                  d="M22.667 12.6653H25.3336C25.3336 5.82532 20.1696 0.666656 13.3203 0.666656V3.33332C18.7363 3.33332 22.667 7.25732 22.667 12.6653Z"
                                  fill="#8360C7"/>
                            <path className={`call-red ${isRoomInCall ? "in-call" : ""}`}
                                  d="M18.5 13H21C21 8.43949 17.5612 5 13 5V7.5C16.6067 7.5 18.5 9.39427 18.5 13Z"
                                  fill="#8360C7"/>
                            <path
                                d="M17.8964 15.6769C17.6402 15.4441 17.3035 15.3199 16.9574 15.3306C16.6114 15.3413 16.283 15.486 16.0417 15.7343L12.851 19.0156C12.083 18.8689 10.539 18.3876 8.94971 16.8023C7.36038 15.2116 6.87904 13.6636 6.73638 12.9009L10.015 9.70892C10.2636 9.46776 10.4086 9.13935 10.4193 8.7932C10.43 8.44705 10.3056 8.11031 10.0724 7.85426L5.14571 2.43692C4.91243 2.18007 4.58821 2.02426 4.24191 2.0026C3.89561 1.98094 3.55451 2.09513 3.29104 2.32092L0.39771 4.80226C0.167191 5.03361 0.029602 5.34152 0.0110426 5.66759C-0.0089574 6.00092 -0.390291 13.8969 5.73238 20.0223C11.0737 25.3623 17.7644 25.7529 19.607 25.7529C19.8764 25.7529 20.0417 25.7449 20.0857 25.7423C20.4117 25.724 20.7195 25.5858 20.9497 25.3543L23.4297 22.4596C23.6557 22.1963 23.7701 21.8553 23.7487 21.509C23.7273 21.1627 23.5717 20.8384 23.315 20.6049L17.8964 15.6769Z"
                                fill="#8360C7"/>

                        </svg>
                        <div className="font-awsm-clicker" onClick={() => {
                            handleLeave()
                        }}>
                            <FontAwesomeIcon className="leave-chan" icon={faSignOutAlt}/>
                        </div>
                        {/*<svg onClick={() => {*/}
                        {/*    makeVideoCall()*/}
                        {/*}} width="31" height="23" viewBox="0 0 31 23" fill="none" xmlns="http://www.w3.org/2000/svg">*/}
                        {/*    <path*/}
                        {/*        d="M3.334 0H16.666C18.506 0 20 1.492 20 3.334V16.666C20 18.506 18.508 20 16.666 20H3.334C1.494 20 0 18.508 0 16.666V3.334C0 1.494 1.492 0 3.334 0Z"*/}
                        {/*        fill="#29262B"/>*/}
                        {/*    <path*/}
                        {/*        d="M12.8078 11.394L25.5338 18.778C26.6138 19.404 27.9998 18.646 27.9998 17.384V2.61601C27.9998 1.35601 26.6138 0.596009 25.5338 1.22401L12.8078 8.60801C12.5621 8.74826 12.3579 8.95098 12.2159 9.19563C12.0738 9.44027 11.999 9.71812 11.999 10.001C11.999 10.2839 12.0738 10.5618 12.2159 10.8064C12.3579 11.051 12.5621 11.2538 12.8078 11.394V11.394Z"*/}
                        {/*        fill="#29262B"/>*/}
                        {/*</svg>*/}
                    </div>

                </div>
                {showNav &&
                <Navigation showSettings={isChannelAdmin && !channelData.isPrivate} channelSlug={channelData.slug}/>
                }
                <div onClick={() => closeCommandList()} className="channel-message-container">
                    <div className="container">
                        <div className="messages-container">
                            {messagesLoading &&
                            <div className="loading-container-msg">
                                <Loading/>
                            </div>
                            }
                            {console.log("j'affiche le message feed")}
                            {messageFeed}
                            <div ref={(el) => {
                                setRefMessage(el)
                            }}
                            />
                        </div>
                    </div>
                </div>
                {quitAlertMsg.length > 0 &&
                <DeleteAlert
                    onDelete={() => quitChannel()}
                    onClose={() => setQuitAlertMsg("")}
                    title={"Attention"}
                    message={quitAlertMsg}
                    btnMsg={"Quitter"}
                />
                }
                {deleteAlertMsg.length > 0 &&
                <DeleteAlert
                    onDelete={() => deleteChannel()}
                    onClose={() => setDeleteAlertMsg("")}
                    title={"Attention"}
                    message={deleteAlertMsg}
                />
                }
                <div className="input-container">
                    {isWritingCommand && isCommandListOpen &&
                    <div className="command-list">
                        <h2>Liste des commandes</h2>
                        {commandList.map((cmd) => {
                            if (!cmd.hidden) {
                                return (
                                    <div key={cmd.id} onClick={() => {
                                        selectCommand(cmd)
                                    }} className="command-content">
                                        <a>/{cmd.command}</a>
                                        <span> {cmd.parameter}</span>
                                        <span>{cmd.short_desc}</span>
                                    </div>
                                )
                            }
                        })}
                    </div>
                    }
                    <div className="container">
                        <form onSubmit={(e) => sendMessage(e)} className="input-msg">
                            <div className="wrapper">

                        <textarea className={`${isWritingCommand ? "orange" : ""}`} tabIndex="0"
                                  onFocus={() => openCommandList()}
                                  onBlur={() => {
                                      historyCount.current = 0
                                  }}
                                  onKeyDown={(e) => handleKeyPress(e)} onChange={(e) => writeMessage(e)}
                                  value={message} placeholder="Message..."/>
                                <textarea className="read-only" readOnly value={autocomplete}/>
                            </div>
                            <div className="icons-container">
                                {showEmojiPicker &&
                                <Picker
                                    perLine={7}
                                    onSelect={(emoji) => {

                                        setMessage(message + emoji.native)
                                    }}
                                    style={{position: 'absolute', bottom: '35px', right: '5px'}}
                                    theme={userState.user?.whiteTheme ? "light" : "dark"}
                                    color="#8360C7"
                                />
                                }
                                <svg onClick={() => {
                                    setShowEmojiPicker(!showEmojiPicker)
                                }} className="emoji" width="26" height="26"
                                     viewBox="0 0 26 26" fill="none"
                                     xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M13 0C16.4478 0 19.7544 1.36964 22.1924 3.80761C24.6304 6.24558 26 9.55219 26 13C26 16.4478 24.6304 19.7544 22.1924 22.1924C19.7544 24.6304 16.4478 26 13 26C9.55219 26 6.24558 24.6304 3.80761 22.1924C1.36964 19.7544 0 16.4478 0 13C0 9.55219 1.36964 6.24558 3.80761 3.80761C6.24558 1.36964 9.55219 0 13 0ZM8.37687 16.9439C8.22496 16.7909 8.01848 16.7045 7.80287 16.7037C7.58726 16.703 7.38018 16.7879 7.22719 16.9398C7.07419 17.0917 6.98781 17.2982 6.98705 17.5138C6.98629 17.7294 7.07121 17.9365 7.22313 18.0895C8.69593 19.572 10.6823 20.4315 12.7712 20.4902C14.8601 20.5489 16.8917 19.8022 18.4454 18.4048L18.7769 18.0895L18.8695 17.9757C18.9769 17.8189 19.0259 17.6294 19.008 17.4402C18.9901 17.251 18.9064 17.074 18.7716 16.9401C18.6367 16.8062 18.4591 16.7238 18.2698 16.7073C18.0804 16.6908 17.8913 16.7411 17.7352 16.8496L17.6231 16.9439L17.3339 17.2201C16.0887 18.328 14.4663 18.9168 12.8004 18.8655C11.1344 18.8141 9.55144 18.1264 8.37687 16.9439ZM17.0625 8.9375C16.6315 8.9375 16.2182 9.10871 15.9135 9.41345C15.6087 9.7182 15.4375 10.1315 15.4375 10.5625C15.4375 10.9935 15.6087 11.4068 15.9135 11.7115C16.2182 12.0163 16.6315 12.1875 17.0625 12.1875C17.4935 12.1875 17.9068 12.0163 18.2115 11.7115C18.5163 11.4068 18.6875 10.9935 18.6875 10.5625C18.6875 10.1315 18.5163 9.7182 18.2115 9.41345C17.9068 9.10871 17.4935 8.9375 17.0625 8.9375ZM8.9375 8.9375C8.50652 8.9375 8.0932 9.10871 7.78845 9.41345C7.48371 9.7182 7.3125 10.1315 7.3125 10.5625C7.3125 10.9935 7.48371 11.4068 7.78845 11.7115C8.0932 12.0163 8.50652 12.1875 8.9375 12.1875C9.36848 12.1875 9.7818 12.0163 10.0865 11.7115C10.3913 11.4068 10.5625 10.9935 10.5625 10.5625C10.5625 10.1315 10.3913 9.7182 10.0865 9.41345C9.7818 9.10871 9.36848 8.9375 8.9375 8.9375Z"
                                        fill="#8360C7"/>
                                </svg>
                                <svg onClick={(e) => sendMessage(e)} className="send" width="16" height="16"
                                     viewBox="0 0 16 16" fill="none"
                                     xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M14.9623 7.24582L1.50401 0.579153C1.36849 0.512029 1.21766 0.486747 1.06904 0.506246C0.920416 0.525744 0.780095 0.589222 0.664373 0.689307C0.54865 0.789393 0.462274 0.921981 0.415273 1.07167C0.368273 1.22137 0.362577 1.38202 0.398847 1.53499L1.35835 5.57582L7.5001 7.99999L1.35835 10.4242L0.398847 14.465C0.361894 14.6181 0.367115 14.7791 0.413898 14.9291C0.460681 15.0792 0.547092 15.2121 0.663024 15.3124C0.778955 15.4127 0.919613 15.4761 1.06854 15.4953C1.21747 15.5145 1.36852 15.4887 1.50401 15.4208L14.9623 8.75415C15.0984 8.68686 15.2134 8.5802 15.2939 8.44665C15.3745 8.3131 15.4172 8.15818 15.4172 7.99999C15.4172 7.84179 15.3745 7.68687 15.2939 7.55332C15.2134 7.41977 15.0984 7.31312 14.9623 7.24582Z"
                                        fill="#8360C7"/>
                                </svg>
                            </div>
                        </form>
                    </div>
                </div>
                {passwordTitle.length > 0 &&
                <ChannelPassword title={passwordTitle} onClose={() => {
                    setPasswordTitle("");
                    setSlug("")
                }} formAlertMsg={formAlertMsg} onConfirm={(password, e) => {
                    e?.preventDefault();
                    connectChannel(password)
                }}/>
                }
            </div>
        </div>
    )
}


export default Channel
