const SkillClass = require('../../skillClass');

function delay(time){
    return new Promise((resolve, reject)=>{
        setTimeout(()=>{
            resolve();
        }, time)
    });
}

const AegisPassive = class AegisPassive extends SkillClass {
    constructor(){
        super();
        this._icon = "AegisPassive";
        this._name = "A Seelie Dividida";

        // ICE?
        this._booleans[0] = true;

        // Ap Stacking
        this._numbers[0] = 0;

        // Ad Stacking
        this._numbers[1] = 0;
        
    }

    // Habilidade Iniciada.
    Start(state){
        this.entity = state.entities[this.entityId];

        this.opsTeam = (this.entity.team == "A")?"B":"A";
        this.allieTeam = this.entity.team;
    }

    //////// Funções bases de habilidades ativas e passivas.
    ChangeForm(state){
        if(this._booleans[0] == false) {
            // Trocando para Gelo
            this._booleans[0] = true;
            this._numbers[1] = 0;
        }
        else {
            // Trocando para Fogo
            this._booleans[0] = false;
            this._numbers[0] = 0;
        }

        this.entity.CharStatus.apModifiers.set(this.entityId + ":AegisPassiveAP", this._numbers[0]);
        this.entity.CharStatus.adModifiers.set(this.entityId + ":AegisPassiveAD", this._numbers[1]);
    }

    PosTurn(state, room){
        return new Promise(async (resolve, reject)=>{
            if(state.turnPriorityHistory[0] != this.entityId) {
                resolve();
                return;
            }
            
            if(this._booleans[0] == false) {
                this._numbers[1] += 1;
            }
            else {
                this._numbers[0] += 1.5;
            }

            this.entity.CharStatus.apModifiers.set(this.entityId + ":AegisPassiveAP", this._numbers[0]);
            this.entity.CharStatus.adModifiers.set(this.entityId + ":AegisPassiveAD", this._numbers[1]);
            resolve();
        })
    }
}

module.exports = AegisPassive;