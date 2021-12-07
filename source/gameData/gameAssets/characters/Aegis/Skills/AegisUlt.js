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

const AegisUlt = class AegisUlt extends SkillClass {
    constructor(){
        super();
        this._icon = "AegisIceUlt";
        this._name = "Trocar: Seelie de Fogo";

        // Estatisticas da Habilidade
        this.ultDelay = 500;
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
            type: "off",
            //YR: 0.9,
            //GR: 0.5,
            //BR: 0,
            //speed: 10,
        
            // Tela de seleção de alvo, 0 a 3 e -1 não tem
            targetType: -1,
            //teamsSup: [this.opsTeam, "N"],
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

        state.entities[this.entityId].skills[0].ChangeForm(state);

        this.blocked.set("0" + this.id, true);
        setTimeout(()=>{
            this.blocked.set("0" + this.id, false);
        }, this.ultDelay);
    }

    // Update da Habilidade
    Update(deltaTime, state, room){
        if(state.entities[this.entityId].skills[0]._booleans[0] == true){
            this._icon = "AegisIceUlt";
            this._name = "Trocar: Seelie de Fogo";
        } else {
            this._icon = "AegisFireUlt";
            this._name = "Trocar: Seelie de Gelo";
        }

        if(state.turnPriority != this.entityId) {
            this.enabled = false;
        } else this.enabled = true;
    }
}

module.exports = AegisUlt;