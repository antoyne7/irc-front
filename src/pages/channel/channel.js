import React, {useEffect, useState} from "react";
import {useHistory, useLocation} from "react-router-dom";

import Home from "../../components/home/home";
import ChannelComponent from "../../components/channel/channel"
import param from "../../services/param";
import authHeader from "../../services/auth-header";
import axios from "axios";
import Alert from "../../components/alert/alert";

const Channels = () => {

    const history = useHistory();

    const location = useLocation();

    const [isError, setIsError] = useState(false);
    const [alertMsg, setAlertMsg] = useState("");

    const [channel, setChannel] = useState(null);

    useEffect(() => {
        const getChannelSlug = () => {
            return location.pathname.split('/channels/')[1]
        }

        axios.get(param.channel.get + getChannelSlug(),
            {headers: authHeader()}
        )
            .then((res) => {
                setChannel(res.data.channel);
            }).catch((e) => {
            setIsError(true)
            setAlertMsg(e.response?.data?.message ?? param.messages.errDefault)
            console.log(e)
        })
    }, [location.pathname]);

    const handleClose = () => {
        setAlertMsg("")
        if (isError) {
            setIsError(false);
            history.push({pathname: `/home`})
        }
    }

    return (
        <Home menuSelected={1}>
            {alertMsg.length > 0 &&
            <Alert isError={isError} message={alertMsg} onClose={() => {
                handleClose();
            }}/>
            }
            {channel &&
            <ChannelComponent channelData={channel}/>
            }
        </Home>
    )
};

export default Channels
