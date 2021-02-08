import React, {useEffect, useState} from "react";
import axios from "axios";
import param from "../../services/param"
import Picture from "../picture/picture"
import AuthHeader from "../../services/auth-header"
import {useHistory} from "react-router-dom";
import "./channelList.style.scss"
import useUser from "../../services/use-user";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faUser} from '@fortawesome/free-solid-svg-icons'

const ChannelList = ({channels = []}) => {
    const history = useHistory();
    const [channelList, setChannelList] = useState([])
    const userState = useUser();

    useEffect(() => {
        const fetchChannels = async () => {
            const channelsTemp = []
            for (const channel of channels) {
                await axios.get(param.channel.get + channel, {headers: AuthHeader()})
                    .then((resp) => {
                        channelsTemp.push(resp.data.channel)
                    })
            }
            setChannelList(channelsTemp)
        }
        fetchChannels()
    }, [channels])

    const getUserInfo = (channelUsers) => {
        const user = channelUsers[0]._id._id === userState.user._id ? channelUsers[1]._id : channelUsers[0]._id
        return {
            username: user.username,
            picture: user.picture
        }
    }

    const renderChannel = (channel) => {
        let channelName = channel.name
        let channelPicture = channel.picture ? (param.channelImg + channel.picture) : null
        if (channelName.match(/%.+%/g)){
            const userInfo = getUserInfo(channel.users)
            channelName = userInfo.username
            if (userInfo.picture) {
                channelPicture = param.img + getUserInfo(channel.users).picture
            }
        }

        let lastMessage =
            channel.messages[channel.messages.length-1]?.message
        if (lastMessage?.length > 40) {
            lastMessage = lastMessage.substring(0, 40) + '...'
        }

        return (
            <React.Fragment key={channel.name}>
                <div onClick={() => onClickChannel(channel.slug)} className="channel">
                    <div className="channel-content">
                        <Picture size="54px" src={channelPicture} name={channelPicture ? null : channelName}/>
                        <div className="text">
                            <h3>{channelName}
                                {!channel.name.match(/%.+%/g) &&
                                    <span className='connected-users'>{channel.users?.length} <FontAwesomeIcon icon={faUser}/></span>}
                            </h3>
                            <span className='last-message'>{lastMessage}</span>
                        </div>
                    </div>
                </div>
                <hr/>
            </React.Fragment>
        )
    }

    const onClickChannel = (slug) => {
        history.push('/channels/' + slug)
    }

    return (
        <div className="channel-container">
            {channelList.map((channel) => renderChannel(channel))}
        </div>
    )
}

export default ChannelList
