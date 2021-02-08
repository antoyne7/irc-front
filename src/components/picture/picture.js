import React from "react"
import "./pictures.styles.scss"

const Picture = (props) => {
    const color = getComputedStyle(document.documentElement).getPropertyValue('--primary').split('#')[1];
    return (
        <div style={{width: props.size, height: props.size, backgroundColor: props.bgc}} className="pfp">
            {/*<span className="placeholder">D</span>*/}
            {props.src &&
            <div style={{width: props.size, height: props.size}} className="pfp-container">
                <img src={props.src} alt="Profile"/>
            </div>
            }
            {!props.src && props.name &&
            <img
                src={"https://eu.ui-avatars.com/api/?length=1&rounded=true&bold=true&font-size=0.55&background=e8e2e2&name=" + props.name.toLowerCase().replace("~", "") +
                "&size=" + props.size + "&color=" + color}
                alt="Photo"/>
            }
        </div>
    )
};
export default Picture;
