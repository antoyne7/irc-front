import React, {useEffect, useState} from "react";
import "./sidebar.style.scss"
import {Link} from "react-router-dom";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faPlus, faUser} from '@fortawesome/free-solid-svg-icons'
import {faSearch} from '@fortawesome/free-solid-svg-icons'
import axios from "axios";
import param from "../../services/param"
import Picture from "../picture/picture"
import AuthHeader from "../../services/auth-header"
import {useHistory} from "react-router-dom";
import useUser from "../../services/use-user";
import Input from "../input/input";

const Sidebar = ({channels}) => {

    const history = useHistory();

    const userState = useUser();

    const [channelList, setChannelList] = useState([])
    const [search, setSearch] = useState("")
    const [channelsId, setChannelsId] = useState(channels?.map(channel => channel._id))

    useEffect(() => {
        const fetchChannels = async () => {
            const channelsTemp = []
            if (!channelsId) return
            for (const channel of channelsId) {
                await axios.get(param.channel.get + channel, {headers: AuthHeader()})
                    .then((resp) => {
                        channelsTemp.push(resp.data.channel)
                    })
            }
            setChannelList(channelsTemp)
        }
        fetchChannels()
    }, [channelsId])

    useEffect(() => {
        filterChannels()
    }, [search])

    const onSearch = (evt) => {
        setSearch(() => evt.target.value)
    }

    const filterChannels = () => {
        let filterChannels = channels
        if (!filterChannels) return []
        if (search.length < 2 ) setChannelsId(channels.map(channel => channel._id))
        filterChannels = filterChannels.filter(channel => {
            if (channel.isPrivate) {
                let username = channel.users[0]._id === null ? channel.users[1]._id.username : channel.users[0]._id.username
                return username.toLowerCase().includes(search.toLowerCase())
            }
            return channel.name.toLowerCase().includes(search.toLowerCase())
        })
        return setChannelsId(filterChannels.map(channel => channel._id))
    }

    const getUserInfo = (channelUsers) => {
        const user = channelUsers[0]?._id._id === userState?.user?._id ? channelUsers[1]?._id : channelUsers[0]?._id
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

        let lastMessage = channel.messages[channel.messages.length-1]?.message
        if (lastMessage?.length > 28) {
            lastMessage = lastMessage.substring(0, 28) + '...'
        }

        return (
            <React.Fragment key={channel.name}>
                <div onClick={() => onClickChannel(channel.slug)} className="channel">
                    <div className="channel-content">
                        <Picture src={channelPicture} name={channelPicture ? null : channelName} size="52px"/>
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
        <div className="sidebar">
            <div className="sidebar-content">
                <Link to="/profile">
                    <div className="user">
                        <Picture src={userState.user?.picture ? param.img + userState.user?.picture : null}
                                 name={userState.user?.picture ? null : userState.user?.username} size="52px"/>
                        <h3 className="name">{userState.user?.username}</h3>
                    </div>
                </Link>
                <div className="link-container">
                    <Link to='/new-channel?search' className="link">
                        <FontAwesomeIcon icon={faSearch}/>
                        Rechercher un salon</Link>
                    <Link to='/new-channel?create' className="link">
                        <FontAwesomeIcon icon={faPlus}/>
                        Creer un salon</Link>
                </div>
                <hr/>
                <Input onChange={onSearch} placeholder="Rechercher vos salons" />
                <div className="channel-container">
                    {channelList.map((channel) => renderChannel(channel))}
                </div>
            </div>
        </div>
    )
}

export default Sidebar
