const SkillClass = require('../../skillClass');

function delay(time){
    return new Promise((resolve, reject)=>{
        setTimeout(()=>{
            resolve();
        }, time)
    });
}

const AegisA = class AegisA extends SkillClass {
    constructor(){
        super();
        this._icon = "AegisIceA";
        this._name = "Turbilhão Gélido";
    }

    //////// Funções bases de habilidades ativas e passivas.

    // Habilidade Iniciada.
    Start(state){

    }
    
    // Habilidade Ativada.
    Push(){
        console.log("esfola meu cu");
    }

    // Update da Habilidade
    Update(deltaTime, state){
        if(state.entities[this.entityId].skills[0]._booleans[0] == true){
            this._icon = "AegisIceA";
            this._name = "Turbilhão Gélido";
        } else {
            this._icon = "AegisFireA";
            this._name = "Tornado Flamejante";
        }
    }
}

module.exports = AegisA;