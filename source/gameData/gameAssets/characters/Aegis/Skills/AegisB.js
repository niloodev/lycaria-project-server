const SkillClass = require('../../skillClass');

function delay(time){
    return new Promise((resolve, reject)=>{
        setTimeout(()=>{
            resolve();
        }, time)
    });
}

const AegisB = class AegisB extends SkillClass {
    constructor(){
        super();
        this._icon = "AegisIceB";
        this._name = "Cadeia de Neve";
    }

    //////// Funções bases de habilidades ativas e passivas.

    // Habilidade Iniciada.
    Start(state){

    }
    
    // Habilidade Ativada.
    Push(){

    }

    // Update da Habilidade
    Update(deltaTime, state){
        if(state.entities[this.entityId].skills[0]._booleans[0] == true){
            this._icon = "AegisIceB";
            this._name = "Cadeia de Neve";
        } else {
            this._icon = "AegisFireB";
            this._name = "Ligação Flamejante";
        }
    }
}

module.exports = AegisB;