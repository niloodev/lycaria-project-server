const schema = require('@colyseus/schema');
const Character = require('../charactersClass');
const Schema = schema.Schema;

const Light = class Light extends Character {
    constructor(){
        super();
        this.id = 'Light';
        this.class = 'Mago';
        this.subClass = 'Controle';
        
        // skins
        this.skins = [
            'Clássico'
        ]
    }
}

module.exports = Light;