import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import React from 'react'
import Modal from '../modal/modal'
import "./delete-alert.styles.scss"
import {faTimes} from "@fortawesome/free-solid-svg-icons";

const DeleteAlert = ({title, message, onClose, onDelete}) => {
    return (
        <Modal onClose={onClose}>
            <button className="close-button" onClick={onClose}>
                <FontAwesomeIcon icon={faTimes} color={"var(--primary)"}/>
            </button>
            <div>
                <h3 className="msg-alert">{title}</h3>
                <p className="alert-body">
                    {message}
                </p>
                <div className="alert-btn-container">
                    <button onClick={onClose}>Annuler</button>
                    <button onClick={onDelete}>Supprimer</button>
                </div>
            </div>
        </Modal>
    )
}

export default DeleteAlert
