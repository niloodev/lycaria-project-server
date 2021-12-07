const schema = require('@colyseus/schema');
const Character = require('../charactersClass');
const Schema = schema.Schema;

const Fennen = class Fennen extends Character {
    constructor(){
        super();
        this.id = 'Fennen';
        this.class = 'Duelista';
        this.subClass = 'Assassino';
        
        // skins
        this.skins = [
            'Clássico',
            'Infernal'
        ]
    }
}

module.exports = Fennen;