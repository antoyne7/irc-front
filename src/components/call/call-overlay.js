import React, {useEffect, useState, useRef} from "react"
import "./call-overlay.styles.scss"
import CallParticipant from "./call-participant";
import CallToolBtn from "./call-tools-btn";
import axios from "axios";
import param from "../../services/param";
import authHeader from "../../services/auth-header";
import CallTimer from "./call-timer"

let count = 0;
const CallOverlay = ({peers, onClick, muted, hide}) => {
    const [users, setUsers] = useState([]);
    const peersRef = useRef([])


    useEffect(() => {
        peersRef.current = peers;
        setUsers([])

        peersRef.current.forEach((user) => {
            user?.peer?.on('stream', stream => {
                console.log("Play")
                let audio = new Audio();
                audio.srcObject = stream;
                audio.play();
            })
        })

        count = 0;
        (async function () {
            setUsers(await loadUsers());
        })();

        return () => {
        }
    }, [peers])

    const loadUsers = async () => {
        let users = []
        for (let user of peersRef.current) {
            console.log(user)
            await axios.get(param.user.getUser + user.userId ?? user.peerID, {headers: authHeader()})
                .then((resp) => {
                    users.push(resp.data.user)
                }).catch((err) => {
                    console.log(err)
                })
        }
        return users
    }

    return (
        <div className={`call-overlay ${hide ? "hidden" : ""}`}>
            <div className="call-overlay-container container">
                {/*TODO: Changer le passage de l'utilisateur*/}

                <div className={`call-participant-container`}>
                    {users.map((userDisplay) => {
                        return (
                            <CallParticipant key={userDisplay._id}
                                user={{
                                    picture: userDisplay.picture ? param.img + userDisplay.picture : null,
                                    username: userDisplay.username
                                }}/>
                        )
                    })}
                </div>


            </div>
            <CallTimer/>
            <div className="call-overlay-tools">
                <CallToolBtn onClick={(icon) => {
                    onClick(icon)
                }} icon={"msg-icon"}/>
                <CallToolBtn className={muted ?? null} onClick={(icon) => {
                    onClick(icon)
                }} icon={"mute"}/>
                <CallToolBtn onClick={(icon) => {
                    onClick(icon)
                }} icon={"camera"}/>
                <CallToolBtn onClick={(icon) => {
                    onClick(icon)
                }} icon={"hangup"}/>
            </div>
        </div>
    )
}

export default CallOverlay