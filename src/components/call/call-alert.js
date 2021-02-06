import React from "react"
import "./call-alert.styles.scss"
import Picture from "../picture/picture";
import Modal from "../modal/modal";
import CallButton from "./call-button";
import music from "../../assets/babel-jingle.mp3"

const CallAlert = ({alertTitle, channel, onClose, onClick, isCaller}) => {
    return (
        <Modal onClose={onClose} className="call">
            <audio loop className="audio-call" src={music} controls autoPlay/>
            <div className="call-alert">
                <h2>{alertTitle}</h2>
                <div className="channel-data">
                    <div className="pfp-container">
                        <Picture size="90px" src={channel.picture ?? null}
                                 name={channel.picture ? null : channel.name}/>
                        <div className="pfp-animation"></div>
                    </div>
                    <h3>{channel.name}</h3>
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
                    {!isCaller &&
                    <CallButton onClick={(icon) => {
                        onClick(icon)
                    }} icon={"video"}/>
                    }
                </div>
            </div>
        </Modal>
    )
}
export default CallAlert