const schema = require('@colyseus/schema');

const PlayerMatchInfo = class PlayerMatchInfo extends schema.Schema{
}

schema.defineTypes(PlayerMatchInfo, {
    locked: 'boolean',
    character: 'string',
    team: 'string',
    skin: 'string',
    id: 'string',
    nickName: 'string'
});

module.exports = PlayerMatchInfo;

