import React, {useEffect, useState} from "react"
import Button from "../../components/button/button"
import {Link} from 'react-router-dom';
import {useHistory} from "react-router-dom";

import AuthService from "../../services/auth.service";
import Input from "../../components/input/input";
import Alert from "../../components/alert/alert";
import param from "../../services/param";
import Loading from "../../components/loading/loading";
import FormAlert from "../../components/alert/form-alert";
import useUser from "../../services/use-user";


const LoginGuest = () => {
    const history = useHistory();

    const userState = useUser()

    useEffect(() => {
        if (userState.user?._id) {
            history.push("/home")
        }
        if (userState.user?.whiteTheme) {
            document.querySelector('.App').classList.add('white-theme')
        } else {
            document.querySelector('.App').classList.remove('white-theme')
        }
    }, [userState, history])

    const [isError, setIsError] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [alertMsg, setAlertMsg] = useState("");
    const [formAlertMsg, setFormAlertMsg] = useState("");

    const [username, setUsername] = useState("");

    const changeUsername = (evt) => {
        setUsername(evt.target.value);
    };

    const createAccount = (evt) => {
        evt.preventDefault();
        setIsLoading(true)
        AuthService.guest_login(username).then(
            () => {
                history.push("/home");
            },
            (error) => {
                setIsLoading(false)
                if (error.response?.data?.type === "form_error" || error.response?.data?.err?.code) {
                    if (error.response.data?.err?.code === 11000) {
                        setFormAlertMsg(param.messages.login_guest.username)
                    } else {
                        setFormAlertMsg(error.response.data.message ?? param.messages.errDefault)
                    }
                } else {
                    setIsError(true);
                    setAlertMsg(error.response?.data.message ?? param.messages.errDefault);
                }
            }
        );
    };

    const handleClose = () => {
        setAlertMsg("")
        if (isError || isLoading) {
            setIsError(false);
            return
        }
        history.push({pathname: `/home`})
    }

    return (
        <div className="auth-container">
            <div className="auth-wrapper">
                {alertMsg.length > 0 &&
                <Alert isError={isError} message={alertMsg} onClose={() => {
                    handleClose();
                }}/>
                }
                <div className="auth">
                    <h1>Herobrine</h1>
                    <form onSubmit={(evt) => createAccount(evt)} className="form">
                        <h2>Rejoindre en tant qu'invité</h2>
                        <Input
                            value={username}
                            onChange={(evt) => changeUsername(evt)}
                            type="text"
                            placeholder="Nom d'utilisateur"
                            name="name"
                        />
                        {formAlertMsg.length > 0 &&
                        <FormAlert message={formAlertMsg}/>
                        }
                    </form>

                    <div className="button-container">
                        <Button onClick={(evt) => createAccount(evt)}> {isLoading ? (
                            <Loading/>
                        ) : "Commencer"}</Button>
                    </div>
                    <div className="separator">
                        <span>ou</span>
                        <hr/>
                    </div>
                    <div className="buttons-container">
                        <Link to={"/login"}>
                            <Button onClick={null} borderOnly>Se connecter</Button>
                        </Link>
                        <Link to={"/register"}>
                            <Button onClick={null} borderOnly>S'inscrire</Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default LoginGuest
