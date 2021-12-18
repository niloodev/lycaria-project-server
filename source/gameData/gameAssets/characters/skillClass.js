const schema = require('@colyseus/schema');
const Schema = schema.Schema;

const Skill = class Skill extends Schema {
    constructor(){
        super();
        this._booleans = new schema.ArraySchema();
        this._numbers = new schema.ArraySchema();
        this._strings = new schema.ArraySchema();

        this.enabled = true;
        this.blocked = new schema.MapSchema();
        this.cdr = 0;

        this._name = "";
        this._icon = "";
        this._desc = "";

        this.index = 0;
        this.id = "";
    }

    //////// Funções bases de habilidades ativas e passivas.
    
    // Inicialização Pura da Habilidade.
    CoreStart(){
        this.entity = state.entities[this.entityId];

        this.opsTeam = (this.entity.team == "A")?"B":"A";
        this.allieTeam = this.entity.team;
    }

    // Inicialização da Habilidade.
    Start(){

    }

    // Checar se a habilidade está ativada.
    CheckPush(){

    }

    // Habilidade Ativada.
    Push(){
        
    }

    // Update da Habilidade
    Update(){

    }

    // PreInflict da Habilidade
    PreInflict(inflict){
        return inflict;
    }

    // PosInflict da Habilidade
    PosInflict(inflict){
        return;
    }   

    // PreTurn da Habilidade
    PreTurn(state, room){
        return new Promise(async (resolve, reject)=>{
            resolve();
        })
    }

    // PosTurn da Habilidade
    PosTurn(state, room){
        return new Promise(async (resolve, reject)=>{
            resolve();
        })
    }
}

schema.defineTypes(Skill, {
    _booleans: [ 'boolean' ],
    _numbers: [ 'float32' ],
    _strings: [ 'string' ],

    blocked: { map: "boolean" },
    enabled: 'boolean',
    cdr: 'number',

    _icon: 'string',
    _name: 'string',
    _desc: 'string',

    id: "string",
});

module.exports = Skill;