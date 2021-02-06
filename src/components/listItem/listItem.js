import triangle from "../../assets/triangle.svg";

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faPlus, faSearch} from '@fortawesome/free-solid-svg-icons'

import React, {useState} from "react"

import "./listItem.style.scss"

const ListItem = ({text, icon = "add", initialState = false, children}) => {
    const [toggle, setToggle] = useState(initialState)

    return (
        <div
            className={`ListItem ${toggle ? "toggled" : ""}`}
        >
            <div onClick={() => setToggle(!toggle)} className="main">
                <div className="icon-type-container">
                    {
                        icon === "add" &&
                        <FontAwesomeIcon icon={faPlus} color={"var(--primary)"}/>
                    }
                    {
                        icon === "search" &&
                        <FontAwesomeIcon icon={faSearch} color={"var(--primary)"}/>
                    }
                </div>
                <div className="text-container">
                    {text}
                </div>
                <div className="icon-arrow-container" >
                    <img src={triangle} alt="Arrow icon"/>
                </div>
            </div>

            <div className="content">
                {children}
            </div>
        </div>
    )
};

export default ListItem
