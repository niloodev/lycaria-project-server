const matchMaker = require('colyseus').matchMaker;
module.exports = async function(){
    var gameLobby_ = await matchMaker.query({name: 'GameLobby'});
    var gameLobbyRoom = matchMaker.getRoomById(gameLobby_[0].roomId);
    return gameLobbyRoom.clients;
}