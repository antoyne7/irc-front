import React, {useState, useEffect, useRef} from "react"
import Timer from "easytimer";
import "./call-timer.styles.scss"

const CallTimer = () => {
    const [timerText, setTimerText] = useState("")
    const timerRef = useRef(null)
    useEffect(() => {
        timerRef.current = new Timer();
        timerRef.current.start();
        timerRef.current.addEventListener('secondsUpdated', function (e) {
            setTimerText(timerRef.current.getTimeValues().toString())
        });
    }, [])
    return (
        <div className="call-timer">
            {timerText}
        </div>
    )
}
export default CallTimer