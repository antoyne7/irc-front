const HOST = "https://irc-back.herokuapp.com/";
// const HOSTNAME = "localhost";
// const PROTOCOL = "http://"
// const PORT = ":8080"

/*const PROTOCOL = "https://"
const HOSTNAME = "192.168.1.146";
const PORT = ":8443"
const PEERPORT = "9000"*/
// const HOST = PROTOCOL + HOSTNAME + PORT
const APIHOST = HOST + "/api";

const param = {
    HOST,
    peer_endpoint: "/peerjs",
    img: HOST + "/users-pictures/",
    botPicture: HOST + "/bot-picture/",
    channelImg: HOST + "/channels-pictures/",

    bot: {
        username: "Chatbot",
        picture: HOST + "/bot-picture/support.png"
    },
    messages: {
        errDefault: "Une erreur s'est produite",
        login_guest: {
            username: "Ce nom d'utilisateur est déjà utilisé"
        },
        register: {
            email: "L'email saisie n'est pas valide",
            info: "Veuillez remplir vos informations"
        },
        bot: {
            displayUserList: "Voici la liste des utilisateurs du salon, dingue non ?",
            displayChannel: "Voici la liste des channels disponibles, incroyable !"
        },
        profile: {
            deleteTitle: "Attention",
            deleteMsg: "Voulez-vous vraiment supprimer votre compte ? Toutes vos informations seront éffacées."
        },
        channel: {
            duplicateName: "Ce nom de salon est déjà pris !",
            deleteTitle: "Attention",
            deleteMsg: "Voulez-vous vraiment supprimer le salon ? Tous les messages seront éffacées."
        }
    },
    auth: {
        signin: APIHOST + "/auth/signin",
        signup: APIHOST + "/auth/signup",
        guest_login: APIHOST + "/auth/guest_login",
        checkToken: APIHOST + "/auth/check",
        deleteAccount: APIHOST + "/auth/delete"
    },
    channel: {
        add: APIHOST + "/channel/add",
        delete: APIHOST + "/channel/delete?channel=",
        connect: APIHOST + "/channel/connect",
        get: APIHOST + "/channel/get?channel=",
        search: APIHOST + "/channel/search?search=",
        getMessages: APIHOST + "/channel/messages/get",
        settings: APIHOST + "/channel/settings",
    },
    user: {
        getUser: APIHOST + "/user/get?userid=",
        picture: APIHOST + "/profile/picture",
        profile: APIHOST + "/profile",
        theme: APIHOST + "/profile/theme?whiteTheme=",
    },
    commands: {
        send: APIHOST + "/command/send"
    },
    commandes: [
        {
            id: 1,
            command: "nick",
            parameter: "surnom",
            short_desc: "Changer son nom temporairement."
        },
        {
            id: 2,
            command: "list",
            parameter: "channel",
            short_desc: "Lister les channels disponibles."
        },
        {
            id: 3,
            command: "listuser",
            parameter: "",
            short_desc: "Lister les utilisateurs présent dans le salon."
        },
        {
            id: 4,
            command: "create",
            parameter: "nom",
            short_desc: "Créer un channel."
        },
        {
            id: 5,
            command: "delete",
            parameter: "channel",
            short_desc: "Supprimer un channel"
        },
        {
            id: 6,
            command: "join",
            parameter: "channel",
            short_desc: "Rejoindre un channel."
        },
        {
            id: 7,
            command: "quit",
            parameter: "channel",
            short_desc: "Quitter un channel."
        },
        {
            id: 8,
            command: "msg",
            parameter: "utilisateur message",
            short_desc: "Envoyer un message privé à un utilisateur."
        }, {
            id: 9,
            command: "diablox9",
            parameter: "",
            short_desc: "Un truc de gamer",
            hidden: true
        },


    ]
};

export default param;
