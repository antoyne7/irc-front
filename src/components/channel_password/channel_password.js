import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import React, {useState} from 'react'
import Modal from '../modal/modal'
import "./channel_password.styles.scss"
import {faTimes} from "@fortawesome/free-solid-svg-icons";
import FormAlert from "../alert/form-alert";


const ChannelPassword = ({title, onClose, onConfirm, formAlertMsg}) => {

    let password;

    const writePassword = (e) => {
        password = e.target.value;
    };

    return (
        <Modal>
            <button className="close-button" onClick={onClose}>
                <FontAwesomeIcon icon={faTimes} color={"var(--primary)"}/>
            </button>
            <div>
                <h3 className="msg-password">{title}</h3>
                <form onSubmit={(e) => onConfirm(password, e)} className="input-modal-container">
                    <input onChange={(e) => writePassword(e)} type="password"/>
                    {formAlertMsg &&
                    <FormAlert message={formAlertMsg}/>
                    }
                </form>
                <div className="password-btn-container">
                    <button onClick={onClose}>Annuler</button>
                    <button onClick={() => onConfirm(password)}>Confirmer</button>
                </div>
            </div>
        </Modal>
    )
}

export default ChannelPassword
