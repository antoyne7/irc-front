import React, {useState, useEffect} from "react";
import {useHistory} from "react-router-dom";

import "./auth.styles.scss"
import Input from "../../components/input/input";
import {Link} from "react-router-dom";
import Button from "../../components/button/button";

import AuthService from "../../services/auth.service"
import param from "../../services/param";
import Alert from "../../components/alert/alert";
import Loading from "../../components/loading/loading";
import FormAlert from "../../components/alert/form-alert";
import useUser from "../../services/use-user";

const Login = () => {
    const history = useHistory()

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

    const [firstCredential, setFirstCredential] = useState("")
    const [password, setPassword] = useState("")

    const onChangeFirstCredential = (e) => {
        const firstCredential = e.target.value;
        setFirstCredential(firstCredential);
    };

    const onChangePassword = (e) => {
        const password = e.target.value;
        setPassword(password);
    };

    const handleLogin = (evt) => {
        evt.preventDefault();
        AuthService.login(firstCredential.toLowerCase(), password).then(
            () => {
                history.push("/home");
            },
            (error) => {
                setIsLoading(false)
                if (error.response?.data.type === "form_error" || error.response?.data?.err?.code) {
                    if (error.response?.data?.err?.code === 11000) {
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
                <div className="auth Login">
                    <h1 className="page-title">
                        Connexion
                    </h1>

                    <form onSubmit={(evt) => handleLogin(evt)}>
                        <Input
                            value={firstCredential}
                            onChange={onChangeFirstCredential}
                            placeholder={"Nom d'utilisateur ou Email"}
                            name={"name"}
                            id="login_name"
                        />
                        <Input
                            value={password}
                            onChange={onChangePassword}
                            type={"password"}
                            placeholder={"Mot de passe"}
                            name={"password"}
                            id="login_password"
                        />
                        {formAlertMsg.length > 0 &&
                        <FormAlert message={formAlertMsg}/>
                        }
                        <div className="link-container">
                            <span>Nouveau sur IRC ?</span><Link to={"/register"}> Créer un compte</Link>
                        </div>
                        <div className="button-container">
                            <Button type="submit" onClick={handleLogin}>{isLoading ? (
                                <Loading/>
                            ) : "Se connecter"}</Button>
                        </div>
                    </form>
                    <div className="separator">
                        <span>ou</span>
                        <hr/>
                    </div>
                    <div className="buttons-container">
                        <Link to={"/"}>
                            <Button onClick={null} borderOnly>Connexion invité</Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login
