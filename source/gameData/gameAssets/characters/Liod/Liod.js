const schema = require('@colyseus/schema');
const Character = require('../charactersClass');
const Schema = schema.Schema;

const Liod = class Liod extends Character {
    constructor(){
        super();
        this.id = 'Liod';
        this.class = 'Tanque';
        this.subClass = 'Controle';
        
        // skins
        this.skins = [
            'Clássico'
        ]
    }
}

module.exports = Liod;