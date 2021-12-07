const SkillClass = require('../../skillClass');

function delay(time){
    return new Promise((resolve, reject)=>{
        setTimeout(()=>{
            resolve();
        }, time)
    });
}

function checkIfMapHaveTrue(map){
    var x = false;
    map.forEach((v, i)=>{
        if(v == true){
            x = true;
        }
    });
    return x;
}

const AegisAA = class AegisAA extends SkillClass {
    constructor(){
        super();
        this._icon = "AegisIceAA";
        this._name = "Estaca de Gelo";

        // Habilidade | Dados
        this.typeOfDamage = "md";
        this.apScaling = 0.65;
        this.baseDamage = 40;
    }

    //////// Funções bases de habilidades ativas e passivas.

    // Habilidade Iniciada.
    Start(state){
        this.opsTeam = (state.entities[this.entityId].team == "A")?"B":"A";
        this.allieTeam = state.entities[this.entityId].team;
    }
    
    // Checar se habilidade esta ativada.
    CheckPush(state, room, client){
        // type = O tipo de verify (A = BARRINHA, B = ESMAGAR BOTÂO, C = SEGURAR BOTÃO)

        // se type == "A"
        // YR, GR, BR = Respectivamente, Yellow Zone | Green Zone | Blue Zone
        // speed = Speed
        // index = HabIndex

        if(!this.enabled) return;
        if(checkIfMapHaveTrue(this.blocked)) return;

        client.send("CheckPhase", {
            index: this.index,
            // Se type for igual a "off" não tem minigame.
            type: "A",
            YR: 0.6,
            GR: 0.1,
            BR: 0.03,
            speed: 14,
        
            // Tela de seleção de alvo, 0 a 3 e -1 não tem
            targetType: 0,
            teamsSup: [this.opsTeam, "N"],
            //circleRadius: 3,
            //boxWidth: 4,
            //boxHeight: 2,
            //maxOrder: 3
        });
    }
    
    // Habilidade Ativada.
    Push(state, room, params){
        if(!this.enabled) return;
        if(checkIfMapHaveTrue(this.blocked)) return;

        state.eCreate("eAegisIceAAProjectile", this.entityId, {x: state.entities[this.entityId].vector.x + (1.38 * state.entities[this.entityId].vector.scaleX), y: state.entities[this.entityId].vector.y + 0.80, scaleX: Math.sign(state.entities[this.entityId].vector.scaleX)*0.14, scaleY: 0.14}, (elementId)=>{
            state.elements[elementId].SetMoveTo(parseFloat(params.targets_[64]), parseFloat(params.targets_[65]), 0, 0.005, 14, ()=>{
                room.broadcast("Animate", {
                    name: "Anim_IceBurstA",
                    x: parseFloat(params.targets_[64]),
                    y: parseFloat(params.targets_[65])
                });
                
                state.entities[params.targets_[0]].InflictHp({
                    type: this.typeOfDamage,
                    value: this.baseDamage + state.entities[this.entityId].CharStatus.ap*this.apScaling,
                    skillOrigin: this.index,
                    origin: this.entityId,
                    target: params.targets_[0]
                }, state, room);

                state.eDestroy(elementId);
            });
        });
    }

    // Update da Habilidade
    Update(deltaTime, state){
        if(state.entities[this.entityId].skills[0]._booleans[0] == true){
            this._icon = "AegisIceAA";
            this._name = "Estaca de Gelo";
        } else {
            this._icon = "AegisFireAA";
            this._name = "Bola de Fogo";
        }

        if(state.turnPriority != this.entityId) {
            this.enabled = false;
        } else this.enabled = true;
    }
}

module.exports = AegisAA;