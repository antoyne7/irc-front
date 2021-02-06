import axios from 'axios'
import React, { useEffect, useState } from 'react'
import authHeader from '../../services/auth-header'
import AuthService from '../../services/auth.service'
import param from '../../services/param'

import "./theme-toggle-button.style.scss"

const ThemeToggleButton = () => {
    const [isWhiteTheme, setIsWhiteTheme] = useState(
        (AuthService.getCurrentUser().user?.whiteTheme === 'true' || 
        AuthService.getCurrentUser().user?.whiteTheme === true)
    )

    useEffect(() => {
        const userStorage = AuthService.getCurrentUser()
        if (isWhiteTheme) {
            document.querySelector('.App').classList.add('white-theme')
        } else {
            document.querySelector('.App').classList.remove('white-theme')
        }
        localStorage.setItem("user", JSON.stringify({ ...userStorage, user: {...userStorage?.user, whiteTheme: isWhiteTheme}}))
        axios.get(param.user.theme + isWhiteTheme, { headers: authHeader()})
    }, [isWhiteTheme])

    return (
        <div className="theme-toggle-button">
            <input
                onChange={() => setIsWhiteTheme(!isWhiteTheme)}
                checked={isWhiteTheme}
                type="checkbox"
                id="toggle"
            />
            <label htmlFor="toggle" />
        </div>
    )
}

export default ThemeToggleButton
