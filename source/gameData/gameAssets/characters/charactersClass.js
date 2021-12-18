const schema = require('@colyseus/schema');
const Schema = schema.Schema;
const Vector2_ = require('./vector2Class');
const CharStatus_ = require('./statusClass');
const CharSkills_ = require('./skillClass');
const clamp = require('math-clamp');
const { Vector2 } = require('three');

const Character = class Character extends Schema{
    constructor(){
        super();
        this.CharStatus = new CharStatus_();
        this.SyncStatus = this.SyncStatus.bind(this);

        // MoveTo é uma array composta por [Vector2, Freq. Update, Radius de Aproximação, DeltaCalculator, Speed, Callback].
        this.moveTo = [null, 0, 0, 0, ()=>{}];
        this.vector2Coord = new Vector2();
    }

    // Inicialização Pura da Entidade
    CoreSpawn(state){
        this.skills.forEach((v)=>{
            v.playerId = this.playerId;
            v.entityId = this.entityId;

            v.CoreStart(state);
            v.Start(state);
        });
    }

    Spawn(){
        
    }

    SyncStatus(){
        ////////////////////////////////// LIMITADORES DE VALORES
        this.CharStatus.hp = clamp(this.CharStatus.hp, 0, this.CharStatus.maxHp);
        this.CharStatus.mana = clamp(this.CharStatus.mana, 0, this.CharStatus.maxMana);

        this.CharStatus.hp = Math.round(this.CharStatus.hp);
        this.CharStatus.mana = Math.round(this.CharStatus.mana);

        ////////////////////////////////// DEFINIÇÃO DE DANO BASE P/ LEVEL
        this.CharStatus.mvpModifiers.set("base", this.CharStatus.mvpScaling[this.level - 1]);
        this.CharStatus.maxHpModifiers.set("base", this.CharStatus.maxHpScaling[this.level - 1]);
        this.CharStatus.maxManaModifiers.set("base", this.CharStatus.maxManaScaling[this.level - 1]);
        this.CharStatus.apModifiers.set("base", this.CharStatus.apScaling[this.level - 1]);
        this.CharStatus.adModifiers.set("base", this.CharStatus.adScaling[this.level - 1]);
        this.CharStatus.mrModifiers.set("base", this.CharStatus.mrScaling[this.level - 1]);
        this.CharStatus.mrPainPlaneModifiers.set("base", this.CharStatus.mrPainPlaneScaling[this.level - 1]);
        this.CharStatus.mrPainPorcModifiers.set("base", this.CharStatus.mrPainPorcScaling[this.level - 1]);
        this.CharStatus.arModifiers.set("base", this.CharStatus.arScaling[this.level - 1]);
        this.CharStatus.arPainPlaneModifiers.set("base", this.CharStatus.arPainPlaneScaling[this.level - 1]);
        this.CharStatus.arPainPorcModifiers.set("base", this.CharStatus.arPainPorcScaling[this.level - 1]);
        this.CharStatus.vampModifiers.set("base", this.CharStatus.vampScaling[this.level - 1]);
        this.CharStatus.vitalityModifiers.set("base", this.CharStatus.vitalityScaling[this.level - 1]);

        ////////////////////////////////// JUNÇÃO DE VALORES (PLANE) PARA OS ATRIBUTOS
        var e;

        e = 0;
        this.CharStatus.mvpModifiers.forEach((value, key)=> e += value);
        this.CharStatus.mvp = e;

        e = 0;
        this.CharStatus.maxHpModifiers.forEach((value, key)=> e += value);
        this.CharStatus.maxHp = e;

        e = 0;
        this.CharStatus.maxManaModifiers.forEach((value, key)=> e += value);
        this.CharStatus.maxMana = e;

        e = 0;
        this.CharStatus.apModifiers.forEach((value, key)=> e += value);
        this.CharStatus.ap = e;

        e = 0;
        this.CharStatus.adModifiers.forEach((value, key)=> e += value);
        this.CharStatus.ad = e;

        e = 0;
        this.CharStatus.mrModifiers.forEach((value, key)=> e += value);
        this.CharStatus.mr = e;

        e = 0;
        this.CharStatus.mrPainPlaneModifiers.forEach((value, key)=> e += value);
        this.CharStatus.mrPainPlane = e;

        e = 0;
        this.CharStatus.mrPainPorcModifiers.forEach((value, key)=> e += value);
        this.CharStatus.mrPainPorc = e;

        e = 0;
        this.CharStatus.arModifiers.forEach((value, key)=> e += value);
        this.CharStatus.ar = e;

        e = 0;
        this.CharStatus.arPainPlaneModifiers.forEach((value, key)=> e += value);
        this.CharStatus.arPainPlane = e;

        e = 0;
        this.CharStatus.arPainPorcModifiers.forEach((value, key)=> e += value);
        this.CharStatus.arPainPorc = e;

        e = 0;
        this.CharStatus.vampModifiers.forEach((value, key)=> e += value);
        this.CharStatus.vamp = e;

        e = 0;
        this.CharStatus.vitalityModifiers.forEach((value, key)=> e += value);
        this.CharStatus.vitality = e;

        ////////////////////////////////// APLICAÇÂO DE PORCENTAGENS, DIVISÕES E MULTIPLICADORES.
        this.CharStatus.mvpModifiersX.forEach((value, key)=> this.CharStatus.mvp *= value);
        this.CharStatus.maxHpModifiersX.forEach((value, key)=> this.CharStatus.maxHp *= value);
        this.CharStatus.maxManaModifiersX.forEach((value, key)=> this.CharStatus.maxMana *= value);
        this.CharStatus.apModifiersX.forEach((value, key)=> this.CharStatus.ap *= value);
        this.CharStatus.adModifiersX.forEach((value, key)=> this.CharStatus.ad *= value);
        this.CharStatus.mrModifiersX.forEach((value, key)=> this.CharStatus.mr *= value);
        this.CharStatus.mrPainPlaneModifiersX.forEach((value, key)=> this.CharStatus.mrPainPlane *= value);
        this.CharStatus.mrPainPorcModifiersX.forEach((value, key)=> this.CharStatus.mrPainPorc *= value);
        this.CharStatus.arModifiersX.forEach((value, key)=> this.CharStatus.ar *= value);
        this.CharStatus.arPainPlaneModifiersX.forEach((value, key)=> this.CharStatus.arPainPlane *= value);
        this.CharStatus.arPainPorcModifiersX.forEach((value, key)=> this.CharStatus.arPainPorc *= value);
        this.CharStatus.vampModifiersX.forEach((value, key)=> this.CharStatus.vamp *= value);
        this.CharStatus.vitalityModifiersX.forEach((value, key)=> this.CharStatus.vitality *= value);
    }

    InflictHp(inflict, state, room){
        // INFLICT é um OBJETO 
        // {
        //     type: "md", "pd", "td", "h", "th",
        //     value: 300 / 350.6,
        //     skillOrigin: 0 / 1,
        //     origin: entityId,
        //     target: entityId / this.entityId,
        // }

        function calculateXandY(this_){
            var x;
            var y;
            var randSign;

            if(Math.random()*100 > 50) randSign = 1;
            else randSign = -1;

            x = this_.vector.x + Math.random()*0.4*randSign;
            y = this_.vector.y + 0.4;

            return {x: x, y: y};
        }

        var oldInflict = inflict;

        // PreInflict de Âmbos.
        if(inflict.origin != inflict.target){
            state.entities[inflict.origin].skills.forEach((value, index)=>{
                inflict = value.PreInflict(inflict);
            });
            state.entities[inflict.target].skills.forEach((value, index)=>{
                inflict = value.PreInflict(inflict);
            })
        } else {
            state.entities[inflict.origin].skills.forEach((value, index)=>{
                inflict = value.PreInflict(inflict);
            });
        }

        switch(inflict.type){
            case "md":
                // Aplicação de Magic Defense.
                var magicDef = this.CharStatus.mr*((100 - state.entities[inflict.origin].CharStatus.mrPainPorc)/100);
                var pureMDef = magicDef - state.entities[inflict.origin].CharStatus.mrPainPlane;

                inflict.value = inflict.value * ((250 - pureMDef)/250);

                // Vampirismo Universal
                if(state.entities[inflict.origin].CharStatus.vamp != 0){
                    console.log("0");
                    this.InflictHp({
                        type: "h",
                        value: inflict.value*(state.entities[inflict.origin].CharStatus.vamp/100),
                        skillOrigin: inflict.skillOrigin,
                        origin: inflict.origin,
                        target: inflict.target,
                    })
                }

                room.broadcast(inflict.target + "_Animate", {anim: "Hurt", type: "Trigger"});
                room.broadcast("Animate", {
                    name: "Popup",
                    pValue: Math.round(inflict.value),
                    pType: "md",
                    x: calculateXandY(this).x,
                    y: calculateXandY(this).y
                });
                this.CharStatus.hp -= inflict.value;
                break;
            case "pd":
                // Aplicação de Physical Defense.
                var physDef = this.CharStatus.ar*((100 - state.entities[inflict.origin].CharStatus.arPainPorc)/100);
                var pureArDef = physDef - state.entities[inflict.origin].CharStatus.arPainPlane;

                inflict.value = inflict.value * ((500 - pureArDef)/500);

                // Vampirismo Universal
                if(state.entities[inflict.origin].CharStatus.vamp != 0){
                    this.InflictHp({
                        type: "h",
                        value: inflict.value*(state.entities[inflict.origin].CharStatus.vamp/100),
                        skillOrigin: inflict.skillOrigin,
                        origin: inflict.origin,
                        target: inflict.target,
                    })
                }

                room.broadcast(inflict.target + "_Animate", {anim: "Hurt", type: "Trigger"});
                room.broadcast("Animate", {
                    name: "Popup",
                    pValue: Math.round(inflict.value),
                    pType: "pd",
                    x: calculateXandY(this).x,
                    y: calculateXandY(this).y
                });
                this.CharStatus.hp -= inflict.value;
                break;
            case "td":
                // Vampirismo Universal
                if(state.entities[inflict.origin].CharStatus.vamp != 0){
                    this.InflictHp({
                        type: "h",
                        value: inflict.value*(state.entities[inflict.origin].CharStatus.vamp/100),
                        skillOrigin: inflict.skillOrigin,
                        origin: inflict.origin,
                        target: inflict.target,
                    })
                }

                room.broadcast(inflict.target + "_Animate", {anim: "Hurt", type: "Trigger"});
                room.broadcast("Animate", {
                    name: "Popup",
                    pValue: Math.round(inflict.value),
                    pType: "td",
                    x: calculateXandY(this).x,
                    y: calculateXandY(this).y
                });               
                this.CharStatus.hp -= inflict.value;
                break;
            case "h":
                inflict.value *= (1 + state.entities[inflict.origin].CharStatus.vitality/80)

                room.broadcast("Animate", {
                    name: "Popup",
                    pValue: Math.round(inflict.value),
                    pType: "md",
                    x: calculateXandY(this).x,
                    y: calculateXandY(this).y
                });
                this.CharStatus.hp += inflict.value
                break;
            case "th":
                var x = oldInflict.value*(1 + state.entities[inflict.origin].CharStatus.vitality/80)

                room.broadcast("Animate", {
                    name: "Popup",
                    pValue: Math.round(x),
                    pType: "md",
                    x: calculateXandY(this).x,
                    y: calculateXandY(this).y
                });
                this.CharStatus.hp += x;

                inflict.value = x;
                break;
        }       

        // PosInflict de Âmbos.
        if(inflict.origin != inflict.target){
            state.entities[inflict.origin].skills.forEach((value, index)=>{
                value.PosInflict(inflict);
            });
            state.entities[inflict.target].skills.forEach((value, index)=>{
                value.PosInflict(inflict);
            })
        } else {
            state.entities[inflict.origin].skills.forEach((value, index)=>{
                value.PosInflict(inflict);
            });
        }
    }

    InflictMana(value){
        this.CharStatus.mana += value;
    }

    // Se o Speed for 0, FREQ será reconsiderada lembrando que FREQ é sempre 1/tempo em segundos.
    // Se Freq for 0, SPEED será reconsiderada e o tempo de viagem vai ser calculado a partir da velocidade sugerida.
    // Freq = 1 / (TEMPO EM SEGUNDOS) | SPEED = FLOAT pixel/segundo.
    SetMoveTo(x, y, freq, radius, speed, callback){
        this.moveTo[0] = new Vector2(x, y);
        this.moveTo[1] = freq;
        this.moveTo[2] = radius;
        this.moveTo[3] = 0;

        if(!callback) callback = ()=>{};
        this.moveTo[4] = callback;

        if(speed != 0){
            var this_ = new Vector2(this.vector.x, this.vector.y);
            var distance = this_.distanceTo(this.moveTo[0]);
            var time = distance / speed;
            this.moveTo[1] = 1/time;
        }

        this.vector.speed = Math.pow(this.moveTo[1], -1);

        this.vector2Coord.x = this.vector.x;
        this.vector2Coord.y = this.vector.y;  

        this.goal.x = x;
        this.goal.y = y;
        this.goal.speed = this.moveTo[1];

        return this.vector.speed; // Retorna o tempo que vai demorar em segundos.
    }

    SetToRoot(freq, speed, callback){
        this.moveTo[0] = new Vector2(this.root.x, this.root.y);
        this.moveTo[1] = freq;
        this.moveTo[2] = 0.0001;
        this.moveTo[3] = 0;

        if(!callback) callback = ()=>{};
        this.moveTo[4] = callback;

        if(speed != 0){
            var this_ = new Vector2(this.vector.x, this.vector.y);
            var distance = this_.distanceTo(this.moveTo[0]);
            var time = distance / speed;
            this.moveTo[1] = 1/time;
        }
        
        this.vector.speed = Math.pow(this.moveTo[1], -1);

        this.vector2Coord.x = this.vector.x;
        this.vector2Coord.y = this.vector.y;

        this.goal.x = this.root.x;
        this.goal.y = this.root.y;
        this.goal.speed = freq;
    }

    Flip(){
        this.vector.scaleX = this.vector.scaleX*-1;
    }

    UpdateAlongThePath(deltaTime){
        if(this.moveTo[0] == null) return;
        
        this.moveTo[3] += this.moveTo[1]*deltaTime/1000;
        this.moveTo[3] = Math.min(Math.max(this.moveTo[3], 0), 1);

        var newPos = new Vector2().lerpVectors(this.vector2Coord, this.moveTo[0], this.moveTo[3]);

        this.vector.x = newPos.x;
        this.vector.y = newPos.y;

        this.vector.speed -= deltaTime/1000;

        if(newPos.distanceTo(this.moveTo[0]) <= this.moveTo[2]){
            this.moveTo[4]();
            this.moveTo = [null, 0, 0, 0, ()=>{}];
        }
    }

    Update(deltaTime){

    }

    BlockAllAbilities(code){
        this.skills.forEach((value, index)=>{
            value.blocked.set("CharacterBlock:"+ code, true);
        });
    }

    UnBlockAllAbilities(code){
        this.skills.forEach((value, index)=>{
            if(value.blocked.get("CharacterBlock:"+ code) != undefined) value.blocked.delete("CharacterBlock:" + code);
        });
    }
}

const CharacterList = class CharacterList extends Schema {
    constructor(){
        super();
    }
}

schema.defineTypes(Character, {
    id: 'string',
    entityId: 'string',
    mainClass: 'string',
    subClass: 'string',
    skins: [ 'string' ],

    level: 'int16',
    skin: 'string',
    playerId: 'string',
    team: 'string',

    // HABILIDADES
    skills: [ CharSkills_ ],

    // POSIÇÃO
    vector: Vector2_,
    root: Vector2_,
    goal: Vector2_,

    // ATRIBUTOS
    CharStatus: CharStatus_,
});

schema.defineTypes(CharacterList, {
    id: 'string',
    mainClass: 'string',
    subClass: 'string',
    skins: [ 'string' ],
});

module.exports = {Character: Character, CharacterList: CharacterList};