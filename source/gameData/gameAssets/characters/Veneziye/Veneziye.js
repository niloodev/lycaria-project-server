const schema = require('@colyseus/schema');
const Character = require('../charactersClass');
const Schema = schema.Schema;

const Veneziye = class Veneziye extends Character {
    constructor(){
        super();
        this.id = 'Veneziye';
        this.class = 'Suporte';
        this.subClass = 'Controle';
        
        // skins
        this.skins = [
            'Clássico'
        ]
    }
}

module.exports = Veneziye;