const schema = require('@colyseus/schema');
const Character = require('../charactersClass');
const Schema = schema.Schema;

const Umbrella = class Umbrella extends Character {
    constructor(){
        super();
        this.id = 'Umbrella';
        this.class = 'Mago';
        this.subClass = 'Anti-Mago';
        
        // skins
        this.skins = [
            'Clássico'
        ]
    }
}

module.exports = Umbrella;