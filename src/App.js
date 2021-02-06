import './styles/App.css';
import {Switch, Route} from "react-router-dom";

import Login from './pages/auth/login'
import Register from "./pages/auth/register";
import NewChannel from "./pages/channel/new-channel";
import Channels from "./pages/channel/channel";
import LoginGuest from "./pages/auth/login_guest"
import React, {useEffect} from "react";
import Profile from "./pages/profile/profile";
import Rooms from './components/rooms/rooms';
import ChannelParam from './components/channel/channelParam';
import DirectMessage from "./pages/direct_message/direct_message";
import MessageList from "./pages/message_list/message_list";
import Layout from "./components/layout/layout";

function App() {
    useEffect(() => {
        const appHeight = () => {
            const doc = document.documentElement
            doc.style.setProperty('--vh', `${window.innerHeight * 0.01}px`)
        }
        window.addEventListener('resize', appHeight)
        appHeight()
    })
    return (
        <Layout>
            <Switch>
                <Route exact path={["/", "/login_guest"]}>
                    <LoginGuest/>
                </Route>
                <Route path="/login">
                    <Login/>
                </Route>
                <Route path="/register">
                    <Register/>
                </Route>
                <Route path="/new-channel">
                    <NewChannel/>
                </Route>
                <Route path={"/home"}>
                    <Rooms/>
                </Route>
                <Route path="/profile">
                    <Profile/>
                </Route>
                <Route exact path={["/channels/:channel"]}>
                    <Channels/>
                </Route>
                <Route exact path={["/channels/:channel/param"]}>
                    <ChannelParam/>
                </Route>
                <Route path={["/messages"]}>
                    <MessageList/>
                </Route>
                <Route path={["/messages/:user"]}>
                    <DirectMessage/>
                </Route>
            </Switch>
        </Layout>
    );
}

export default App;
