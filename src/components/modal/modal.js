import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom'

import "./modal.style.scss"

const Portal = ({ children, selector }) => {
    const [mountNode, setMountNode] = useState();
    useEffect(() => {
        const container = document.querySelector(selector);

        setMountNode(container);
    }, [selector]);

    return mountNode ? ReactDOM.createPortal(children, mountNode) : null;
}

const Modal = ({
    children,
    onClose,
    className
}) => {
    useEffect(() => {
        const onEscapeKeyDown = (evt) => {
            if (evt.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keyup', onEscapeKeyDown);

        return () => {
            window.removeEventListener('keyup', onEscapeKeyDown);
        };
    });

    return (
        <Portal selector=".App">
            <div
                className={`modal-container ${className}`}
                onClick={onClose}
            >
                <div
                    className="modal"
                    onClick={(evt) => evt.stopPropagation()}
                    role='dialog'
                >

                    {children}
                </div>
            </div>
        </Portal>
    );
}

export default Modal;
