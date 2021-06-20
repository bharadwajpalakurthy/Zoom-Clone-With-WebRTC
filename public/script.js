const socket = io('/')
const videoGrid = document.getElementById('video-grid')
const myPeer = new Peer()
const myVideo = document.createElement('video')
const peers = {}
let myStream;

var getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
getUserMedia({video: true, audio: true}, function(stream) {
  addVideoStream(myVideo, stream)

  myPeer.on('call', call => {
    // getUserMedia({video: true, audio: true}, function(stream) {
      myStream = stream;
    call.answer(stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
      addVideoStream(video, userVideoStream)
    })
  // }
  })

  socket.on('user-connected', userId => {
    connectToNewUser(userId, stream)
  })
}, function(err) {
  console.log('Failed to get local stream' ,err);
});

// function replaceStream(peerConnection, mediaStream) {
//   for(sender of peerConnection.getSenders()){
//       if(sender.track.kind == "audio") {
//           if(mediaStream.getAudioTracks().length > 0){
//               sender.replaceTrack(mediaStream.getAudioTracks()[0]);
//           }
//       }
//       if(sender.track.kind == "video") {
//           if(mediaStream.getVideoTracks().length > 0){
//               sender.replaceTrack(mediaStream.getVideoTracks()[0]);
//           }
//       }
//   }
// }



socket.on('user-disconnected', userId => {
  if (peers[userId])
   peers[userId].close()
})

myPeer.on('open', id => {
  socket.emit('join-room', ROOM_ID, id)
})

function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream)
  const video = document.createElement('video')
  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream)
  })
  call.on('close', () => {
    video.remove()
  })

  peers[userId] = call
}

function addVideoStream(video, stream) {
  video.srcObject = stream
  video.addEventListener('loadedmetadata', () => {
    video.play()
  })
  videoGrid.append(video)
}

function muteMic(isEnabled) {
  myStream.getAudioTracks().forEach(track => track.enabled = isEnabled);
}

function muteCam(isEnabled) {
  myStream.getVideoTracks().forEach(track => track.enabled = isEnabled);
}