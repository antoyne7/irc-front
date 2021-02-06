import param from './param'

const getPicture = (user) => {
    if (!user?.picture) return null;

    return param.HOST + "/users-pictures/" + user.picture
}

const userService = {
    getPicture
}

export default userService
