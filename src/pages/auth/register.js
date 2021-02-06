import React, {useState, useEffect} from "react";
import "./auth.styles.scss"
import Input from "../../components/input/input";
import {Link, useHistory} from "react-router-dom";
import Button from "../../components/button/button";
import AuthService from "../../services/auth.service"
import Alert from "../../components/alert/alert";
import Loading from "../../components/loading/loading";
import param from "../../services/param";
import FormAlert from "../../components/alert/form-alert";
import useUser from "../../services/use-user";

const Register = () => {
    const history = useHistory();

    const userState = useUser()
    useEffect(() => {
        AuthService.checkToken(false);



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
    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [passwordRepeat, setPasswordRepeat] = useState("")

    const onChangeUsername = (e) => {
        const username = e.target.value;
        setUsername(username);
    };

    const onChangeEmail = (e) => {
        const email = e.target.value;
        setEmail(email);
    };

    const onChangePassword = (e) => {
        const password = e.target.value;
        setPassword(password);
    };

    const onChangePasswordRepeat = (e) => {
        const passwordRepeat = e.target.value;
        setPasswordRepeat(passwordRepeat);
    };


    const handleRegister = (e) => {
        e.preventDefault();
        setIsLoading(true)
        if (username || email || password) {
            setFormAlertMsg("")
            AuthService.register(username, email, password, passwordRepeat).then(
                (response) => {
                    setIsLoading(false);
                    setIsError(false);
                    setFormAlertMsg("")
                    setAlertMsg(response.data.message)
                },
                (error) => {
                    setIsLoading(false)
                    if (error?.response?.data.type === "form_error" || error?.response?.data?.err?.errors) {
                        if (error.response.data?.err?.errors.email) {
                            setFormAlertMsg(param.messages.register.email)
                        } else {
                            setFormAlertMsg(error.response.data.message ?? param.messages.errDefault)
                        }
                    } else {
                        setIsError(true);
                        setAlertMsg(error?.response?.data?.message ?? param.messages.errDefault);
                    }
                }
            );
        } else {
            setFormAlertMsg(param.messages.register.info)
            setIsLoading(false)
        }
    };

    const handleClose = () => {
        setAlertMsg("")
        if (isError || isLoading) {
            setIsError(false);
            return
        }
        history.push({pathname: `/login`})
    }

    return (
        <div className="auth-container">
            {alertMsg.length > 0 &&
            <Alert isError={isError} message={alertMsg} onClose={() => {
                handleClose();
            }}/>
            }
            <div className="auth-wrapper">

                <div className="auth Login">
                    <h1 className="page-title">
                        Inscription
                    </h1>

                    <form onSubmit={(evt) => handleRegister(evt)}>
                        <Input
                            value={username}
                            placeholder="Nom d'utilisateur"
                            name="username"
                            onChange={onChangeUsername}
                        />
                        <Input
                            value={email}
                            placeholder="Adresse e-mail"
                            name="email"
                            type={"email"}
                            onChange={onChangeEmail}
                        />
                        <Input
                            value={password}
                            placeholder="Mot de passe"
                            name="password"
                            type={"password"}
                            onChange={onChangePassword}
                        />
                        <Input
                            value={passwordRepeat}
                            placeholder="Confirmer le mot de passe"
                            name="password-bis"
                            type={"password"}
                            onChange={onChangePasswordRepeat}
                        />
                        {formAlertMsg.length > 0 &&
                        <FormAlert message={formAlertMsg}/>
                        }
                        <div className="link-container">
                            Déja un compte ? <Link to={"/login"}>Se connecter</Link>
                        </div>
                        <div className="button-container">
                            <Button type="submit" onClick={handleRegister}>
                                {isLoading ? (
                                    <Loading/>
                                ) : "S'inscrire"}</Button>
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

export default Register
