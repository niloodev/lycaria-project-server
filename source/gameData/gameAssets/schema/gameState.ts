import {Context, Schema, type, ArraySchema, MapSchema} from '@colyseus/schema'

export class PlayerSchema extends Schema {
    @type('string')
    characterAttached: string;

    @type('boolean')
    online: boolean;

    @type('boolean')
    ready: boolean;

    @type('string')
    id: string;

    @type('string')
    nickName: string;

    @type('float64')
    gold: number;

    @type('string')
    team: string;
}

export class Vector2_ extends Schema {
    @type("number")
    x: number;

    @type("number")
    y: number;
}

export class Skill extends Schema {
    @type(['boolean'])
    _booleans: ArraySchema<boolean>;

    @type(['float32'])
    _numbers: ArraySchema<number>;

    @type(['string'])
    _strings: ArraySchema<string>;

    @type("boolean")
    blocked: boolean;

    @type("boolean")
    enabled: boolean;

    @type("number")
    cdr: number;

    @type("string")
    _icon: string;

    @type("string")
    _name: string;

    @type("string")
    _desc: string;
}

export class charStatus extends Schema {
    @type("number")
    mvp: number;

    @type({map: "number"})
    mvpModifiers: MapSchema<number>;

    @type({map: "float64"})
    mvpModifiersX: MapSchema<number>;

    @type("number")
    maxHp: number;
    
    @type("number")
    hp: number;

    @type({map: "number"})
    maxHpModifiers: MapSchema<number>;

    @type({map: "float64"})
    maxHpModifiersX: MapSchema<number>;

    @type("number")
    mana: number;

    @type("number")
    maxMana: number;

    @type({map: "number"})
    maxManaModifiers: MapSchema<number>;

    @type({map: "float64"})
    maxManaModifiersX: MapSchema<number>;

    @type("number")
    ap: number;

    @type({map: "number"})
    apModifiers: MapSchema<number>;

    @type({map: "float64"})
    apModifiersX: MapSchema<number>;

    @type("number")
    ad: number;

    @type({map: "number"})
    adModifiers: MapSchema<number>;

    @type({map: "float64"})
    adModifiersX: MapSchema<number>;

    @type("number")
    mr: number;

    @type({map: "number"})
    mrModifiers: MapSchema<number>;

    @type({map: "float64"})
    mrModifiersX: MapSchema<number>;

    @type("number")
    mrPainPlane: number;

    @type({map: "number"})
    mrPainPlaneModifiers: MapSchema<number>;

    @type({map: "float64"})
    mrPainPlaneModifiersX: MapSchema<number>;

    @type("number")
    mrPainPorc: number;

    @type({map: "number"})
    mrPainPorcModifiers: MapSchema<number>;

    @type({map: "float64"})
    mrPainPorcModifiersX: MapSchema<number>;

    @type("number")
    ar: number;

    @type({map: "number"})
    arModifiers: MapSchema<number>;

    @type({map: "float64"})
    arModifiersX: MapSchema<number>;

    @type("number")
    arPainPlane: number;

    @type({map: "number"})
    arPainPlaneModifiers: MapSchema<number>;

    @type({map: "float64"})
    arPainPlaneModifiersX: MapSchema<number>;

    @type("number")
    arPainPorc: number;

    @type({map: "number"})
    arPainPorcModifiers: MapSchema<number>;

    @type({map: "float64"})
    arPainPorcModifiersX: MapSchema<number>;

    @type("number")
    vamp: number;

    @type({map: "number"})
    vampModifiers: MapSchema<number>;

    @type({map: "float64"})
    vampModifiersX: MapSchema<number>;

    @type("number")
    vitality: number;

    @type({map: "number"})
    vitalityModifiers: MapSchema<number>;

    @type({map: "float64"})
    vitalityModifiersX: MapSchema<number>;
}

export class Character extends Schema {
    @type('string')
    id: string;

    @type('string')
    entityId: string;

    @type('string')
    mainClass: string;

    @type('string')
    subClass: string;

    @type(['string'])
    skins: ArraySchema<string>;

    @type('int16')
    level: number;

    @type('string')
    skin: string;

    @type('string')
    playerId: string;

    @type('string')
    team: string;

    @type([Skill])
    skills: ArraySchema<Skill>;

    @type(Vector2_)
    vector: Vector2_;

    @type(Vector2_)
    root: Vector2_;

    @type(charStatus)
    charStatus: charStatus;
}

export class State extends Schema {
    @type("boolean")
    loading: boolean;

    @type({map: PlayerSchema})
    player: MapSchema<PlayerSchema>;

    @type({map: Character})
    entities: MapSchema<Character>;
}

