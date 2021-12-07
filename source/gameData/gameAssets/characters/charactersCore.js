const schema = require('@colyseus/schema');
const Character = require('./charactersClass').Character;
const CharacterList = require('./charactersClass').CharacterList;
const MapSchema = schema.MapSchema;

const Aegis = require('./Aegis/Aegis');
// const Fennen = require('./Fennen/Fennen');
// const Light = require('./Light/Light');
// const Liod = require('./Liod/Liod');
// const Mox = require('./Mox/Mox');
// const Umbrella = require('./Umbrella/Umbrella');
// const Veneziye = require('./Veneziye/Veneziye');

// Objeto com a classe pura de cada personagem.
const characters = {
    Aegis: Aegis.Game
}

var elements = {};
elements = Object.assign(elements, Aegis.Elements);


module.exports = {
    characters: characters,
    elements: elements,
    setCharactersList: ()=>{
        const charactersList = new MapSchema();

        charactersList.set('Aegis', new Aegis.List());
        // charactersList.set('Fennen', new Fennen());
        // charactersList.set('Light', new Light());
        // charactersList.set('Liod', new Liod());
        // charactersList.set('Mox', new Mox());
        // charactersList.set('Umbrella', new Umbrella());
        // charactersList.set('Veneziye', new Veneziye());

        return charactersList;
    },
    Character: Character,
    CharacterList: CharacterList
}