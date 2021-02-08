import React, {useState, useRef, useEffect} from "react";
import "./profile.style.scss"

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faTrash, faEdit} from '@fortawesome/free-solid-svg-icons'

import Navigation from "../navigation/navigation";
import Button from "../button/button";
import Input from "../input/input"
import axios from "axios";
import param from "../../services/param";
import authHeader from "../../services/auth-header";
import UserService from "../../services/user"
import useUser from "../../services/use-user";
import Alert from "../alert/alert";
import ThemeToggleButton from "../button/theme-toggle-button";
import {useHistory} from "react-router-dom";
import Loading from "../loading/loading";
import DeleteAlert from "../alert/delete-alert";
import Toast from "../toast/toast";

const Profile = () => {
    const history = useHistory();
    const pictureInput = useRef()
    const userState = useUser();
    const [toastMsg, setToastMsg] = useState("");

    useEffect(() => {
        if (userState.user?.roles?.includes('5ffdc51c44c1710c04faac02')) {
            setToastMsg(" Vous êtes actuellement connecté en tant qu'invité.\n" +
                "                            Pour enregistrer votre compte et garder vos messages/salons\n" +
                "                            veuillez remplir vos informations.")
        }
        setPicturePreview(UserService.getPicture(userState.user))
        setUsername(userState.user?.username)
        setEmail(userState.user?.email)
    }, [userState])

    const [isError, setIsError] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [alertMsg, setAlertMsg] = useState("");
    const [picturePreview, setPicturePreview] = useState("");
    const [picture, setPicture] = useState(null);
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordRepeat, setPasswordRepeat] = useState("");
    const [oldPassword, setOldPassword] = useState("");
    const [deleteAlertMsg, setDeleteAlertMsg] = useState("");
    const [deleteAlertTitle, setDeleteAlertTitle] = useState("");

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

    const onChangeOldPassword = (e) => {
        const oldPassword = e.target.value;
        setOldPassword(oldPassword);
    };

    const onChangePicture = (e) => {
        setPicturePreview(URL.createObjectURL(e.target.files[0]));
        setPicture(e.target.files[0])
    };

    const handleDelete = () => {
        setDeleteAlertMsg(param.messages.profile.deleteMsg);
        setDeleteAlertTitle(param.messages.profile.deleteTitle);
    };

    const confirmDelete = () => {
        axios.post(param.auth.deleteAccount, {}, {headers: authHeader()})
            .then(() => {
                localStorage.removeItem("user")
                history.push('/')
            }).catch((err) => {
            setIsLoading(false);
            setIsError(true);
            setAlertMsg(err.response.data.message ?? param.messages.errDefault)
        })
    };

    const handleSubmit = () => {
        setIsLoading(true)
        const formData = new FormData();
        formData.append('picture', picture);
        formData.append('username', username);
        formData.append('email', email);
        formData.append('password', password);
        formData.append('passwordRepeat', passwordRepeat);
        formData.append('oldPassword', oldPassword);
        axios.post(param.user.profile,
            formData,
            {headers: authHeader()},
        ).then(() => {
            setIsLoading(false)
            setAlertMsg("Données modifiées !")
        }).catch((err) => {
            console.log("error:", err)
            setIsLoading(false);
            setIsError(true);
            setAlertMsg(err.response.data.message ?? param.messages.errDefault)
        })
    }

    const handleClose = () => {
        setAlertMsg("")
        if (isError || isLoading) {
            setIsError(false);
            return
        }
        history.push({pathname: `/home`})
    }

    const handleDisconnect = () => {
        if (userState.user?.roles?.includes('5ffdc51c44c1710c04faac02')) {
            setDeleteAlertMsg(param.messages.profile.guestDeleteMsg);
            setDeleteAlertTitle(param.messages.profile.deleteTitle);
        } else {
            localStorage.removeItem("user")
            history.push('/')
        }
    }

    return (
        <div className="Profile">
            {alertMsg.length > 0 &&
            <Alert isError={isError} message={alertMsg} onClose={() => {
                handleClose();
            }}/>
            }
            <div className="title-container container">
                <h2>Profil</h2>
            </div>

            <Navigation/>

            <div className="theme-button-container">
                <ThemeToggleButton/>
            </div>
            <div className="container">
                <div className="wrapper">
                    <form encType="multipart/form-data">
                        <div
                            className={`${userState.user?.roles?.includes('5ffdc51c44c1710c04faac02') ? "guest" : ""} form-title`}>
                            <h3>
                                Vos informations
                            </h3>

                            <FontAwesomeIcon
                                icon={faTrash}
                                color={"var(--rouge)"}
                                onClick={handleDelete}
                            />

                            {deleteAlertMsg &&
                            <DeleteAlert onClose={() => {
                                setDeleteAlertTitle("");
                                setDeleteAlertMsg("")
                            }}
                                         message={deleteAlertMsg}
                                         title={deleteAlertTitle}
                                         onDelete={() => confirmDelete()}
                            />
                            }
                        </div>
                        {toastMsg.length > 0 &&
                        <Toast displayTime={7000} onClose={() => {
                            setToastMsg("")
                        }} text={toastMsg}/>
                        }
                        {!userState.user?.roles?.includes('5ffdc51c44c1710c04faac02') &&
                        <div className="profile-picture-container">
                            <div className="profile-picture">
                                {picturePreview && <img src={picturePreview} alt="Profile"/>}
                            </div>
                            <label htmlFor="profile-picture">
                                <FontAwesomeIcon icon={faEdit} size="2x" color="var(--contrast-projet)"/>
                            </label>
                            <input ref={pictureInput} name="file" id="profile-picture" type="file"
                                   onChange={(evt) => onChangePicture(evt)}/>
                        </div>}

                        <Input
                            placeholder="Nom d'utilisateur"
                            value={username}
                            onChange={onChangeUsername}
                        />
                        <Input
                            placeholder="Email"
                            value={email}
                            onChange={onChangeEmail}
                        />
                        <Input
                            placeholder="Nouveau mot de passe"
                            type="password"
                            value={password}
                            onChange={onChangePassword}
                        />
                        <Input
                            placeholder="Confirmez le mot de passe"
                            type="password"
                            value={passwordRepeat}
                            onChange={onChangePasswordRepeat}
                        />

                        {!userState.user?.roles?.includes('5ffdc51c44c1710c04faac02') &&
                        <Input
                            placeholder="Ancien mot de passe"
                            type="password"
                            value={oldPassword}
                            onChange={onChangeOldPassword}
                        />}

                    </form>

                    <div className="buttons-container">
                        <Button onClick={handleSubmit}>
                            {isLoading ? (
                                <Loading/>
                            ) : 'Enregistrer'}
                        </Button>
                        <hr/>
                        <Button theme="danger" onClick={handleDisconnect}>
                            Se déconnecter
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
};

export default Profile
