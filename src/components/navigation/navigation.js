import React from "react"
import {Link, useHistory} from "react-router-dom"

import "./navigation.style.scss"

import triangleIcon from "../../assets/triangle.svg"
import settingsIcon from "../../assets/setting.svg"

const Navigation = ({showSettings = false, channelSlug = ""}) => {
    const history = useHistory()

    return (
        <div className="Navigation container">
            <Link onClick={history.goBack} to="#" className="back">
                <img src={triangleIcon} alt="Back icon"/> Retour
            </Link>

            {showSettings && 
                <Link to={"/channels/"+ channelSlug +"/param"} className="settings">
                    <img src={settingsIcon} alt="Settings icon"/>
                </Link>}
        </div>
    )
}

export default Navigation
