import axios from "axios";
import param from "./param"
import AuthHeader from "./auth-header"

const register = (username, email, password, passwordRepeat) => {
    return axios.post(param.auth.signup, {
        username,
        usr_identifier: username.toLowerCase(),
        email,
        password,
        passwordRepeat
    });
};

const guest_login = (username) => {
    return axios.post(param.auth.guest_login, {
        username
    }).then((response) => {
        console.log(response)
        if (response.data.token) {
            localStorage.setItem("user", JSON.stringify(response.data))
        }
    })
};

const login = (firstCredential, password) => {
    return axios
        .post(param.auth.signin, {
            firstCredential,
            password,
        })
        .then((response) => {
            console.log()
            if (response.data.token) {
                localStorage.setItem("user", JSON.stringify(response.data));
            }

            return response.data;
        });
};

const logout = () => {
    localStorage.removeItem("user");
};

const getCurrentUser = () => {
    return JSON.parse(localStorage.getItem("user"));
};

const checkToken = (redirectLogin = true) => {
    axios.get(param.auth.checkToken, {
            headers: AuthHeader(),
        })
        .catch(() => {
            if (redirectLogin) {
                window.location.assign("/")
            }
        });
}

export default {
    register,
    login,
    guest_login,
    logout,
    getCurrentUser,
    checkToken,
};
