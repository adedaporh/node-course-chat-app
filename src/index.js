const express = require('express')
const http = require('http')
const path = require('path')
const socketio = require('socket.io')
const { generateMessage, generateAdminMessage } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000

const publicDirectory = path.join(__dirname, '../public')

app.use(express.static(publicDirectory))



io.on('connection', (socket) => {
    console.log('New Websocket connection')

    socket.on('join', ({ username, room }, callback) => {
        const { error, user } = addUser({ id:socket.id, username, room })

        if (error) {
            return callback(error)
        }

        socket.join(user.room)

        socket.emit('message', generateAdminMessage('Welcome!'))
        socket.broadcast.to(user.room).emit('message', generateAdminMessage(`${user.username} has joined!`))
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        socket.on('sendMessage', (message, callback) => {
            io.to(user.room).emit('newMessage', generateMessage(user.username, message))
            callback('Delivered')
        })
    
        socket.on('sendLocation', (coord, callback)  => {
            io.to(user.room).emit('locationMessage', generateMessage(user.username, `https://google.com/maps?q=${coord.lat},${coord.long}`))
            callback()
        })

        callback()
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        if (user) {
            io.to(user.room).emit('message', generateAdminMessage(`${user.username} has left!`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
           
    })


})

server.listen(port)