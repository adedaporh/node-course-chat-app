const generateMessage = (username, text) => {
    return {
        username,
        text,
        createdAt: new Date().getTime()
    }
}

const generateAdminMessage = (text) => {
    return {
        username: 'admin',
        text,
        createdAt: new Date().getTime()
    }
}

module.exports = {
    generateMessage,
    generateAdminMessage
}