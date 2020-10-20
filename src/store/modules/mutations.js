export function userInfo (state, data) {
    state.user = data.user
    state.passwd = data.passwd
}

export function login (state, data) {
    state.loggedin = data
}
