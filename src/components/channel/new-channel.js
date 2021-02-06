import React from "react";
import "./channel.styles.scss"
import {useLocation} from "react-router-dom";

import Navigation from "../navigation/navigation";
import ListItem from "../listItem/listItem";
import CreateChannel from "./createChannel";
import SearchChannel from "./searchChannel";

const NewChannelComponent = () => {
    const location = useLocation()
    const queryString = new URLSearchParams(location.search)

    return (
        <div className="channel-content-container">
            <div className="title-container container">
                <h2>Ajouter un salon</h2>
            </div>
            <Navigation />
            <ListItem
                initialState={queryString.get("create") === ""}
                text="Créer un nouveau salon"
                icon="add"
            >
                <CreateChannel />
            </ListItem>
            <ListItem
                initialState={queryString.get("search") === ""}
                text="Rechercher un salon"
                icon="search"
            >
                <SearchChannel />
            </ListItem>
        </div>
    )
};

export default NewChannelComponent
