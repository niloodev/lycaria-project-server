const matchMaker = require('colyseus').matchMaker;
const returnClientById = require('./_filterClientId');

module.exports = async function(){
    var gameLobby_ = await matchMaker.query({name: 'GameLobby'});
    var gameLobbyRoom = matchMaker.getRoomById(gameLobby_[0].roomId);
    return (id)=>{
        var c_ = returnClientById(gameLobbyRoom.clients, id);
        return c_;
    }
}