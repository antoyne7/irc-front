import React from "react";
import "./form-alert.styles.scss"
const FormAlert = ({message}) => {
    return (
        <div className="form-alert">
            {message}
        </div>
    )
}

export default FormAlert
