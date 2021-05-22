const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const { v4: uuidV4 } = require('uuid')

//Peer server
var privateKey  = fs.readFileSync('sslcert/server.key', 'utf8');
var certificate = fs.readFileSync('sslcert/server.crt', 'utf8');

const { PeerServer } = require('peer');
const peerServer = PeerServer({ port: 443, 
                            path: '/' ,
                            ssl: {
                                key: privateKey,
                                cert: certificate
                              }
                        
                        });
                        
app.set('view engine', 'ejs')
app.use(express.static('public'))

app.get('/', (req, res) => {
  res.redirect(`/${uuidV4()}`)
})

app.get('/:room', (req, res) => {
  res.render('room', { roomId: req.params.room })
})

io.on('connection', socket => {
  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId)
    socket.broadcast.to(roomId).emit('user-connected', userId)
    console.log(`User Connected : ${userId}`)
    socket.on('disconnect', () => {
      socket.broadcast.to(roomId).emit('user-disconnected', userId)
      console.log(`User Disconnected : ${userId}`)

    })
  })
})

server.listen(process.env.PORT || 5000)
