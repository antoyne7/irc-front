import Home from "../home/home"
import {useHistory, useLocation} from "react-router-dom";
import React, {useEffect, useRef, useState} from "react";
import param from "../../services/param";
import axios from "axios";
import authHeader from "../../services/auth-header";
import Navigation from "../navigation/navigation";
import Input from "../input/input";

import "./channelParam.style.scss"
import Button from "../button/button";
import Loading from "../loading/loading";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faEdit, faTrash} from '@fortawesome/free-solid-svg-icons'
import Alert from "../alert/alert";
import DeleteAlert from "../alert/delete-alert";

const ChannelParam = () => {
    const location = useLocation();
    const history = useHistory()
    const [channel, setChannel] = useState(null);
    const pictureInput = useRef()

    useEffect(() => {
        const getChannelSlug = () => {
            const strings = location.pathname.split('/')
            const index = strings.indexOf("channels") + 1

            return strings[index]
        }

        axios.get(param.channel.get + getChannelSlug(),
            {headers: authHeader()}
        )
            .then((res) => {
                // console.log(res.data.channel)
                if (res.data.channel.isPrivate) history.goBack()
                setChannel(res.data.channel);
                setName(res.data.channel.name)
                if (res.data.channel.picture) {
                    setPicturePreview(param.channelImg + res.data.channel.picture)
                }
            }).catch(e => {
            console.log(e)
        })
    }, [location.pathname]);

    const [isError, setIsError] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [alertMsg, setAlertMsg] = useState("");
    const [picturePreview, setPicturePreview] = useState("");
    const [picture, setPicture] = useState(null);
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [passwordRepeat, setPasswordRepeat] = useState("");
    const [oldPassword, setOldPassword] = useState("");
    const [deleteAlertMsg, setDeleteAlertMsg] = useState("");
    const [deleteAlertTitle, setDeleteAlertTitle] = useState("");

    const onChangeName = (e) => {
        const name = e.target.value;
        setName(name);
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

    const onSubmit = (evt) => {
        evt.preventDefault()

        setIsLoading(true)
        const formData = new FormData();
        formData.append('picture', picture);
        formData.append('name', name);
        formData.append('password', password);
        formData.append('passwordRepeat', passwordRepeat);
        formData.append('oldPassword', oldPassword);
        formData.append('channelId', channel._id);

        axios.post(param.channel.settings,
            formData,
            {headers: authHeader()},
        ).then((response) => {
            setIsLoading(false)
            setAlertMsg("Données modifiées !")
            setChannel(response.data.channel)
        }).catch((err) => {
            console.log("error:", err)
            if (err.response.data.message) {
                setIsLoading(false);
                setIsError(true);
                setAlertMsg(err.response.data.message)
            } else {
                setIsLoading(false);
                setIsError(true);
                setAlertMsg(param.messages.errDefault)
            }
        })
    }

    const handleDelete = () => {
        setDeleteAlertMsg(param.messages.channel.deleteMsg);
        setDeleteAlertTitle(param.messages.channel.deleteTitle);
    };

    const confirmDelete = () => {
        axios.get(param.channel.delete + channel?.slug, {headers: authHeader()})
            .then((response) => {
                setIsLoading(false)
                setAlertMsg(response.data.message)
            }).catch((e) => {
            setIsLoading(false);
            setIsError(true);
            setAlertMsg(e.response.data.message ?? param.messages.errDefault)
        })
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
        <Home menuSelected={1}>
            <div className="channel-param">
                {alertMsg.length > 0 &&
                <Alert isError={isError} message={alertMsg} onClose={() => {
                    handleClose();
                }}/>
                }

                {deleteAlertMsg && deleteAlertTitle &&
                <DeleteAlert
                    onClose={() => {
                        setDeleteAlertTitle("");
                        setDeleteAlertMsg("")
                    }}
                    message={deleteAlertMsg}
                    title={deleteAlertTitle}
                    onDelete={() => confirmDelete()}
                />
                }

                <div className="title-container container">
                    <h2>{channel?.name}</h2>
                </div>

                <Navigation/>
                <div className="container">
                    <div className="wrapper">
                        <form encType="multipart/form-data" onSubmit={(evt) => onSubmit(evt)}>
                            <div className="form-title">
                                <h3>
                                    Paramètres
                                </h3>
                            </div>

                            <div className="channel-picture-container">
                                <div className="channel-picture">
                                    {picturePreview && <img src={picturePreview} alt="Profile"/>}
                                </div>
                                <label htmlFor="channel-picture">
                                    <FontAwesomeIcon icon={faEdit} size="2x" color="var(--contrast-projet)"/>
                                </label>
                                <input ref={pictureInput} name="file" id="channel-picture" type="file"
                                       onChange={(evt) => onChangePicture(evt)}/>
                            </div>

                            <Input
                                placeholder="Nom du salon"
                                value={name}
                                onChange={onChangeName}
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
                            <Input
                                placeholder="Ancien mot de passe"
                                type="password"
                                value={oldPassword}
                                onChange={onChangeOldPassword}
                            />

                            <div className="buttons-container">
                                <Button type='submit'>
                                    {isLoading ? (
                                        <Loading/>
                                    ) : 'Enregistrer'}
                                </Button>
                                <Button
                                    className="deleteButton"
                                    theme="danger"
                                    borderOnly
                                    onClick={handleDelete}
                                >
                                    <FontAwesomeIcon icon={faTrash}/>
                                    SUPPRIMER LE SALON
                                </Button>

                            </div>
                        </form>
                    </div>
                </div>
            </div>

        </Home>
    )
}

export default ChannelParam
