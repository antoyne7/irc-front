import React from "react"
import "./call-alert.styles.scss"
import Picture from "../picture/picture";
import Modal from "../modal/modal";
import CallButton from "./call-button";
import music from "../../assets/babel-jingle.mp3"
import param from "../../services/param";
import useUser from "../../services/use-user";
import user from "../../services/user";

const CallAlert = ({alertTitle, channel, onClose, onClick, isCaller}) => {
    const userState = useUser()

    const getUserInfo = (channelUsers) => {
        const user = channelUsers[0]._id._id === userState?.user?._id  ? channelUsers[1]._id : channelUsers[0]._id
        return {
            username: user.username,
            picture: user.picture
        }
    }

    const getChannelData = () => {
        let channelName = channel.name
        let channelPicture = channel.picture ? (param.channelImg + channel.picture) : null
        if (channelName.match(/%.+%/g)){
            const userInfo = getUserInfo(channel.users)
            channelName = userInfo.username
            console.log('UI', userInfo)
            if (userInfo.picture) {
                channelPicture = param.img + userInfo.picture
            }
        }

        console.log(channelName, channelPicture)

        return {
            channelName,
            channelPicture
        }
    }

    return (
        <Modal onClose={onClose} className="call">
            <audio loop className="audio-call" src={music} controls autoPlay/>
            <div className="call-alert">
                <h2>{alertTitle}</h2>
                <div className="channel-data">
                    <div className="pfp-container">
                        <Picture size="90px" src={getChannelData().channelPicture ?? null}
                                 name={getChannelData().channelPicture ? null : getChannelData().channelName}/>
                        <div className="pfp-animation" />
                    </div>
                    <h3>{getChannelData().channelName}</h3>
                </div>
                <div className="call-btn-container">
                    <CallButton onClick={(icon) => {
                        onClick(icon)
                    }} icon={"decline"}/>
                    {!isCaller &&
                    <CallButton onClick={(icon) => {
                        onClick(icon)
                    }} icon={"accept"}/>
                    }
                    {/*{!isCaller &&*/}
                    {/*<CallButton onClick={(icon) => {*/}
                    {/*    onClick(icon)*/}
                    {/*}} icon={"video"}/>*/}
                    {/*}*/}
                </div>
            </div>
        </Modal>
    )
}
export default CallAlert
