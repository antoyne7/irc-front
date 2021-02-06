import React, {useState} from "react";
import "./toast.styles.scss"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faTimes} from "@fortawesome/free-solid-svg-icons";

const Toast = ({text, onClose, displayTime}) => {
    const [closeAnimation, setCloseAnimation] = useState(false);

    useState(() => {
        if (displayTime) {
            setTimeout(() => {
                setCloseAnimation(true)
            }, displayTime)
        }
    })

    const handleClose = (e) => {
        e.preventDefault()
        setCloseAnimation(true);
    }
    return (
        <div onAnimationEnd={() => {
            if (closeAnimation) onClose();
        }} className={`${closeAnimation ? "closing" : ""} container toast`}>
            <button className="close-button" onClick={(e) => {
                handleClose(e)
            }}>
                <FontAwesomeIcon icon={faTimes} color={"black"}/>
            </button>
            <div className="toast-text">
                {text}
            </div>
        </div>
    )
}
export default Toast