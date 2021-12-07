const matchMaker = require('colyseus').matchMaker;
module.exports = async function(id, seat){
    var gameLobby_ = await matchMaker.query({name: 'GameLobby'});
    var gameLobbyRoom = matchMaker.getRoomById(gameLobby_[0].roomId);
    gameLobbyRoom.connectClientToGame(id, seat);
    return true;
}