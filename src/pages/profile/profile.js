import React from "react";

import Home from "../../components/home/home"
import ProfileComponent from "../../components/profile/profile";

const Profile = () => {
    return (
        <Home menuSelected={2}>
            <ProfileComponent />
        </Home>
    )
};

export default Profile
