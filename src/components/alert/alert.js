import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faTimes} from '@fortawesome/free-solid-svg-icons'
import React from 'react'
import Modal from '../modal/modal'

import "./alert.style.scss"

const Alert = ({message, onClose, isError}) => {
    return (
        <Modal onClose={onClose}>
            <div className={isError ? "error" : ""}>
                <button className="close-button" onClick={() => {
                    onClose()
                }}>
                    <FontAwesomeIcon icon={faTimes} color={"var(--primary)"}/>
                </button>
                {!isError &&
                <div className="success-checkmark">
                    <div className="wrapper">
                        <div className="check-icon">
                            <span className="icon-line line-tip"/>
                            <span className="icon-line line-long"/>
                            <div className="icon-circle"/>
                            <div className="icon-fix"/>
                        </div>
                    </div>
                </div>
                }
                {isError &&
                <div className="error-checkmark">
                    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130.2 130.2">
                        <circle className="path circle" fill="none" stroke="#D06079" strokeWidth="6"
                                strokeMiterlimit="10"
                                cx="65.1" cy="65.1" r="62.1"/>
                        <line className="path line" fill="none" stroke="#D06079" strokeWidth="6" strokeLinecap="round"
                              strokeMiterlimit="10" x1="34.4" y1="37.9" x2="95.8" y2="92.3"/>
                        <line className="path line" fill="none" stroke="#D06079" strokeWidth="6" strokeLinecap="round"
                              strokeMiterlimit="10" x1="95.8" y1="38" x2="34.4" y2="92.2"/>
                    </svg>
                </div>
                }
                <h3 className="msg">{message}</h3>
            </div>
        </Modal>
    )
}

export default Alert
