import useUser from "../../services/use-user"
import ChannelList from "../channel/channelList"
import Home from "../home/home"

import "./rooms.style.scss"
import React, {useEffect, useState} from "react";
import Channel from "../channel/channel";
import axios from "axios";
import param from "../../services/param";
import authHeader from "../../services/auth-header";
import Input from "../input/input";

const Rooms = () => {
    const userState = useUser();

    const [channelData, setChannelData] = useState(null);
    const [isMobile, setIsMobile] = useState(true)
    const [search, setSearch] = useState("")

    useEffect(() => {
        function handleResize() {
            setIsMobile(window.innerWidth <= 992)
        }

        window.addEventListener('resize', handleResize)

        setIsMobile(window.innerWidth <= 992)

        return () => {
            window.removeEventListener('resize', handleResize)
        }
    }, []);

    useEffect(() => {
        axios.get(param.channel.get + "global", {headers: authHeader()})
            .then((result) => {
                setChannelData(result.data.channel)
            })
    }, []);

    const onSearch = (evt) => {
        setSearch(evt.target.value)
    }

    const filterChannels = () => {
        let channels = userState.user?.channels
        if (!channels) return []
        channels = channels.filter(channel => {
            if (channel.isPrivate) {
                let username = channel.users[0]._id.username
                if (username === userState.user?.username) username = channel.users[1]._id.username
                return username.toLowerCase().includes(search.toLowerCase())
            }
            return channel.name.toLowerCase().includes(search.toLowerCase())
        })
        return channels.map(channel => channel._id)
    }

    return (
        <Home menuSelected={1}>
            {isMobile &&
            <div className="rooms">

                <h1>Vos discussions</h1>
                <div className="channel-search">
                    <Input onChange={onSearch} placeholder="Rechercher un salon" type="text"/>
                </div>
                <ChannelList channels={filterChannels()}/>
            </div>
            }
            {!isMobile && channelData &&
                <div className="global-channel">
                    <Channel showNav={false} channelData={channelData}/>
                </div>}
        </Home>
    )
}

export default Rooms
