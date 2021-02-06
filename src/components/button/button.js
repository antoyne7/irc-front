import React from "react";

import "./button.style.scss"

const BUTTON_THEMES = [
    "primary",
    "secondary",
    "danger"
]


const Button = ({
    children,
    onClick = null,
    borderOnly = false,
    theme = "primary",
    className,
    type = "button",
}) => {

    const handleClick = (evt) => {
        if (onClick) {
            onClick(evt)
        }
    };

    return (
        <button
            type={type}
            onClick={(evt) => handleClick(evt)}
            className={`Button ${borderOnly ? "border-only" : ""} ${theme} ${className}`}
        >
            {children}
        </button>
    )
}

export default Button
