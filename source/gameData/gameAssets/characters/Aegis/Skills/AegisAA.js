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
    async Push(state, room, params){
        if(!this.enabled) return;
        if(checkIfMapHaveTrue(this.blocked)) return;

        var t = this.entity.SetMoveTo(this.entity.vector.x + (1 * Math.sign(this.entity.vector.scaleX)), this.entity.vector.y, 0, 0.0001, 7);
        await delay(t*500);
        room.broadcast(this.entityId + "_Animate", {
            type: "Trigger",
            anim: "AutoAttack"
        });
        await delay(400);
        state.eCreate("eAegisIceAAProjectile", this.entityId, {x: this.entity.vector.x + (0.25 * Math.sign(this.entity.vector.scaleX)), y: this.entity.vector.y + 0.75, scaleX: Math.sign(this.entity.vector.scaleX)*0.3, scaleY: 0.3}, (elementId)=>{
            state.elements[elementId].SetMoveTo(parseFloat(params.targets_[64]), parseFloat(params.targets_[65]), 0, 0.0001, 16, ()=>{
                room.broadcast("Animate", {
                    name: "Anim_IceBurstA",
                    x: parseFloat(params.targets_[64]),
                    y: parseFloat(params.targets_[65])
                });
                
                state.entities[params.targets_[0]].InflictHp({
                    type: this.typeOfDamage,
                    value: this.baseDamage + this.entity.CharStatus.ap*this.apScaling,
                    skillOrigin: this.index,
                    origin: this.entityId,
                    target: params.targets_[0]
                }, state, room);

                state.eDestroy(elementId);
            });      
        });
        await delay(180);
        this.entity.SetToRoot(0, 6);
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