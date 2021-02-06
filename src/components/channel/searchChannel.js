import React, {useState} from "react";

import Input from "../input/input";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faUser} from '@fortawesome/free-solid-svg-icons'

import "./searchChannel.style.scss"
import axios from "axios";
import param from "../../services/param";
import {useHistory} from "react-router-dom";
import authHeader from "../../services/auth-header";
import ChannelPassword from "../channel_password/channel_password";
import Loading from "../loading/loading";


const SearchChannel = () => {
    const history = useHistory();

    const [isLoading, setIsLoading] = useState(false);
    const [isSearching, setIsSearching] = useState(false);

    const [formAlertMsg, setFormAlertMsg] = useState("");

    const [name, setName] = useState("")

    const [passwordTitle, setPasswordTitle] = useState("");

    const [channels, setChannels] = useState([]);

    const [slug, setSlug] = useState("");

    const onChangeName = (e) => {
        const name = e.target.value;
        if (name.length >= 3) {
            setIsSearching(true)
            setIsLoading(true)
            axios.get(param.channel.search + name + "&maxresp=" + 5, {headers: authHeader()})
                .then((response) => {
                    setChannels(response.data)
                    setIsLoading(false)
                }).catch(e => {
                console.log(e)
            })
        } else {
            setChannels([])
            setIsSearching(false)
            setIsLoading(false)
        }
        setName(name);
    };

    const connectChannel = (password) => {
        axios.post(param.channel.connect, {slug, password}, {headers: authHeader()})
            .then((response) => {
                setSlug("");
                setFormAlertMsg("")
                history.push({
                    pathname: '/channels/' + response.data.slug,
                    state: {slug: response.data.slug}
                })
            }).catch((err) => {
            setFormAlertMsg(err.response.data.message)
        })
    };

    const goTo = (slug) => {
        axios.post(
            param.channel.connect,
            {slug},
            {headers: authHeader()}
        ).then((response) => {
            if (response.data.password) {
                setPasswordTitle(response.data.message);
                setSlug(response.data.slug);
            } else {
                history.push({
                    pathname: '/channels/' + slug,
                    state: {slug: slug}
                })
            }
        }).catch(e => {
            console.log("ajout channel: ERREUR:", e)
        })
    };

    const getServers = () => {
        if (channels.length > 0) {
            return channels.map(server => (
                <div onClick={() => goTo(server.slug)} key={server.name} className="channel-item">
                    <div className="channel-name">
                        {server.name}
                    </div>
                    <div className="channel-users">
                        {server.connected}/{server.max_capacity}
                        <FontAwesomeIcon icon={faUser} color={"var(--primary)"}/>
                    </div>
                </div>
            ))
        } else {
            if (isSearching && !isLoading) {
                return (
                    <div className="no-results">
                        Aucun résultats
                    </div>
                )
            }
        }
    }

    return (
        <div className="SearchChannel">
            <form action="">
                <Input
                    placeholder="Nom du salon"
                    name="channel-name"
                    value={name}
                    onChange={onChangeName}
                />
                {channels &&
                <div className="channels">
                    {isLoading &&
                    <div className="loading-wrapper">
                        <Loading/>
                    </div>
                    }
                    {getServers()}
                </div>
                }
                {passwordTitle.length > 0 &&
                <ChannelPassword title={passwordTitle} onClose={() => {
                    setPasswordTitle("");
                    setSlug("")

                }} formAlertMsg={formAlertMsg} onConfirm={(password, e) => {
                    e?.preventDefault();
                    connectChannel(password)
                }}/>
                }
            </form>
        </div>
    )
};

export default SearchChannel
