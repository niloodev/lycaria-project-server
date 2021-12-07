const schema = require('@colyseus/schema');
const character = require('../characters/charactersClass')

const PlayerSchema = class PlayerSchema extends schema.Schema{
    constructor(){
        super();
    }
}

schema.defineTypes(PlayerSchema, {
    characterAttached: 'string',
    online: 'boolean',
    ready: 'boolean',

    id: 'string',
    nickName: 'string',

    gold: 'float64',
    team: 'string' // A ou B
});

module.exports = PlayerSchema;
