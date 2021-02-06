import React from "react"
import "./call-participant.styles.scss"
import Picture from "../picture/picture";

const CallParticipant = ({user}) => {
    return (
        <div className={`call-participant`}>
            <Picture size="150px" src={user.picture ?? null} name={user.picture ? null : user.username}/>
        </div>
    )
}

export default CallParticipant