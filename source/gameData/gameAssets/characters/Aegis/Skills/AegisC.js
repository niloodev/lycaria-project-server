const SkillClass = require('../../skillClass');

function delay(time){
    return new Promise((resolve, reject)=>{
        setTimeout(()=>{
            resolve();
        }, time)
    });
}

const AegisC = class AegisC extends SkillClass {
    constructor(){
        super();
        this._icon = "AegisIceC";
        this._name = "Ascensão Glacial";
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
            this._icon = "AegisIceC";
            this._name = "Ascensão Glacial";
        } else {
            this._icon = "AegisFireC";
            this._name = "Se Joga no Vulcão!";
        }
    }
}

module.exports = AegisC;