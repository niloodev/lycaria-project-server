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

        state.entities[this.entityId].CharStatus.apModifiers.set(this.entityId + ":AegisPassiveAP", this._numbers[0]);
        state.entities[this.entityId].CharStatus.adModifiers.set(this.entityId + ":AegisPassiveAD", this._numbers[1]);
    }

    PosTurn(state, room){
        return new Promise(async (resolve, reject)=>{
            if(this._booleans[0] == false) {
                this._numbers[1] += 1;
            }
            else {
                this._numbers[0] += 1.5;
            }

            state.entities[this.entityId].CharStatus.apModifiers.set(this.entityId + ":AegisPassiveAP", this._numbers[0]);
            state.entities[this.entityId].CharStatus.adModifiers.set(this.entityId + ":AegisPassiveAD", this._numbers[1]);
            resolve();
        })
    }
}

module.exports = AegisPassive;