const schema = require('@colyseus/schema');
const Character = require('../charactersClass');
const Schema = schema.Schema;

const Mox = class Mox extends Character {
    constructor(){
        super();
        this.id = 'Mox';
        this.class = 'Duelista';
        this.subClass = 'Lutador';
        
        // skins
        this.skins = [
            'Clássico',
            'Algodão_Doce'
        ]
    }
}

module.exports = Mox;