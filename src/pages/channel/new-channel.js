import React from "react";

import Home from "../../components/home/home"
import NewChannelComponent from "../../components/channel/new-channel";

const NewChannel = () => {
    return (
        <Home menuSelected={3}>
            <NewChannelComponent />
        </Home>
    )
};

export default NewChannel
