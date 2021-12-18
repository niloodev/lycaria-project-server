const schema = require('@colyseus/schema');
const Character = require('../charactersClass').Character;
const CharacterList = require('../charactersClass').CharacterList;
const uuivd1 = require('uuid').v1;

const filterClientById = require('../../../../modules/_filterClientId');

const Vector2_ = require('../vector2Class');
const Schema = schema.Schema;
const MapSchema = schema.MapSchema;

// Habilidades
const AegisPassive = require('./Skills/AegisPassive');
const AegisAA = require('./Skills/AegisAA');
const AegisA = require('./Skills/AegisA');
const AegisB = require('./Skills/AegisB');
const AegisC = require('./Skills/AegisC');
const AegisUlt = require('./Skills/AegisUlt');

// Elementos
const eAegisIceAAProjectile = require('./Elements/eAegisIceAAProjectile');

const Aegis = class Aegis extends Character {
    constructor(){
        super();

        /////////////// Informações Estáticas (Status geral do campeão e afins)
        this.id = 'Aegis';
        this.mainClass = 'Mago';
        this.subClass = 'Explosivo';
        
        // skins
        this.skins = [
            'Clássico'
        ]

        // Informações Introduziveis
        this.skin = '';
        this.playerId = '';
        this.team = '';
        this.entityId = '';

        // Habilidades
        this.skills = new schema.ArraySchema();
        this.skills[0] = new AegisPassive().assign({id: uuivd1(), index: 0});
        this.skills[1] = new AegisAA().assign({id: uuivd1(), index: 1});
        this.skills[2] = new AegisA().assign({id: uuivd1(), index: 2});
        this.skills[3] = new AegisB().assign({id: uuivd1(), index: 3});
        this.skills[4] = new AegisC().assign({id: uuivd1(), index: 4});
        this.skills[5] = new AegisUlt().assign({id: uuivd1(), index: 5});

        /////// Status
        this.level = 1;

        // Velocidade de Movimento / Base
        this.CharStatus.mvpModifiers = new MapSchema();
        this.CharStatus.mvpModifiersX = new MapSchema();
        this.CharStatus.mvpScaling = [ 100, 100, 110, 110, 120, 120, 130, 130, 140, 140, 150, 150, 150 ];

        // Vida Máxima e Atual;
        this.CharStatus.maxHpModifiers = new MapSchema();
        this.CharStatus.maxHpModifiersX = new MapSchema();
        this.CharStatus.maxHpScaling = [ 560, 580, 600, 620, 640, 660, 680, 700, 750, 800, 900, 1100, 1350 ];
        this.CharStatus.hp = 560;

        // Mana Máxima e Atual
        this.CharStatus.maxManaModifiers = new MapSchema();
        this.CharStatus.maxManaModifiersX = new MapSchema();
        this.CharStatus.maxManaScaling = [ 560, 600, 600, 620, 640, 660, 680, 700, 750, 800, 900, 1100, 1200 ];
        this.CharStatus.mana = 560;

        // Dano Mágico / Base + Modificadores
        this.CharStatus.apModifiers = new MapSchema();
        this.CharStatus.apModifiersX = new MapSchema();
        this.CharStatus.apScaling = [ 20, 25, 40, 70, 90, 100, 110, 125, 133, 147, 160, 200, 310 ];

        // Dano Físico / Base + Modificadores
        this.CharStatus.adModifiers = new MapSchema();
        this.CharStatus.adModifiersX = new MapSchema();
        this.CharStatus.adScaling = [ 17, 17, 17, 20, 21, 30, 40, 50, 60, 60, 60, 60, 100 ];

        // Defesa Mágica / Base + Modificadores. (Reduz o dano mágico em MR/250)
        this.CharStatus.mrModifiers = new MapSchema();
        this.CharStatus.mrModifiersX = new MapSchema();
        this.CharStatus.mrScaling = [ 17, 17, 17, 20, 21, 30, 40, 50, 60, 60, 60, 60, 65 ];

        // Penetração Mágica Plana + Modificadores
        this.CharStatus.mrPainPlaneModifiers = new MapSchema();
        this.CharStatus.mrPainPlaneModifiersX = new MapSchema();
        this.CharStatus.mrPainPlaneScaling = [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 10, 10, 15 ];

        // Penetração Mágica Percentual + Modificadores 
        this.CharStatus.mrPainPorcModifiers = new MapSchema();
        this.CharStatus.mrPainPorcModifiersX = new MapSchema();
        this.CharStatus.mrPainPorcScaling = [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2 ];

        // Defesa Física / Base + Modificadores (Reduz o dano físico em AR/500)
        this.CharStatus.arModifiers = new MapSchema();
        this.CharStatus.arModifiersX = new MapSchema();
        this.CharStatus.arScaling = [ 12, 30, 60, 70, 90, 120, 140, 140, 145, 147, 150, 160, 160 ];

        // Penetração Física Plana + Modificadores
        this.CharStatus.arPainPlaneModifiers = new MapSchema();
        this.CharStatus.arPainPlaneModifiersX = new MapSchema();
        this.CharStatus.arPainPlaneScaling = [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ];

        // Penetração Física Percentual + Modificadores
        this.CharStatus.arPainPorcModifiers = new MapSchema();
        this.CharStatus.arPainPorcModifiersX = new MapSchema();
        this.CharStatus.arPainPorcScaling = [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ];

        // Vampirismo Universal
        this.CharStatus.vampModifiers = new MapSchema();
        this.CharStatus.vampModifiersX = new MapSchema();
        this.CharStatus.vampScaling = [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ];

        // Vitalidade (Aumenta a cura e escudos conjurados e recebidos de outras fontes em VIT/80 1VIT = 1,25%)
        this.CharStatus.vitalityModifiers = new MapSchema();
        this.CharStatus.vitalityModifiersX = new MapSchema();
        this.CharStatus.vitalityScaling = [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ];

        this.Update = this.Update.bind(this);
    }

    Spawn(state){

    }

    Update(state, deltaTime){
        
    }
}

const AegisList = class AegisList extends CharacterList {
    constructor(){
        super();

        /////////////// Informações Estáticas (Status geral do campeão e afins)
        this.id = 'Aegis';
        this.mainClass = 'Mago';
        this.subClass = 'Explosivo';
        
        // skins
        this.skins = [
            'Clássico'
        ]
    }
};

const AegisElements = {
    eAegisIceAAProjectile: eAegisIceAAProjectile
}

module.exports = {List: AegisList, Game: Aegis, Elements: AegisElements};