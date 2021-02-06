import React, {useState} from "react";
import {useHistory} from "react-router-dom";

import Input from "../input/input";
import Button from "../button/button";
import authHeader from "../../services/auth-header";
import Alert from "../alert/alert";

import "./createChannel.style.scss"
import axios from "axios";
import param from "../../services/param";
import FormAlert from "../alert/form-alert";
import Loading from "../loading/loading";

const CreateChannel = () => {
    const history = useHistory();
    const [slug, setSlug] = useState("");
    const [isError, setIsError] = useState(false);
    const [alertMsg, setAlertMsg] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [formAlertMsg, setFormAlertMsg] = useState("");
    const [name, setName] = useState("")
    const [password, setPassword] = useState("")
    const [passwordRepeat, setPasswordRepeat] = useState("")

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

    const handleCreation = (e) => {
        e.preventDefault();
        const user = JSON.parse(localStorage.getItem("user"));
        const username = user.user.username;
        if (name.length > 0) {
            setFormAlertMsg("")
            setIsLoading(true);
            axios.post(param.channel.add,
                {name, slug: name, password, passwordRepeat, username}, {headers: authHeader()})
                .then((response) => {
                    setIsLoading(false)
                    setSlug(response.data.slug)
                    setAlertMsg(response.data.message)

                }).catch((e) => {
                setIsLoading(false);
                setIsError(true);
                if (e.response.data.code === 11000) {
                    setAlertMsg(param.messages.channel.duplicateName)
                } else {
                    setAlertMsg(e.response.data.message ?? param.messages.errDefault)
                }
            });
        } else {
            setFormAlertMsg("Veuillez renseigner un nom")
        }
    };
    const handleClose = () => {
        setAlertMsg("")
        if (isError) {
            setIsError(false);
            return
        }
        history.push({pathname: `/channels/${slug}`})
    }

    return (
        <div className="CreateChannel">
            {alertMsg.length > 0 &&
            <Alert isError={isError} message={alertMsg} onClose={() => {
                handleClose();
            }}/>
            }
            <form>
                <Input
                    placeholder="Nom du salon"
                    name="channel-name"
                    value={name}
                    onChange={onChangeName}
                />
                <Input
                    placeholder="Mot de passe (optionnel)"
                    name="channel-password"
                    type="password"
                    value={password}
                    onChange={onChangePassword}
                />
                <Input
                    placeholder="Confirmez le mot de passe"
                    name="channel-password-repeat"
                    type="password"
                    value={passwordRepeat}
                    onChange={onChangePasswordRepeat}
                />
                {formAlertMsg &&
                <FormAlert message={formAlertMsg}/>
                }
                <div className="button-container">
                    <Button type="submit" onClick={handleCreation} theme="secondary">
                        {isLoading ? (
                            <Loading/>
                        ) : 'Créer'}
                    </Button>
                </div>
            </form>
        </div>
    )
};

export default CreateChannel
