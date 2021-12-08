// Módulos Principais
const colyseus = require('colyseus');
const schema = require('@colyseus/schema');
const jwt = require('jsonwebtoken');
const { v1: uuidv1 } = require('uuid');

const PlayerMatchInfo = require('./gameAssets/schema/playerMatchInfo');
const PlayerSchema = require('./gameAssets/playerConfig/playerSchema');
const Vector2_ = require('./gameAssets/characters/vector2Class');

const characters = require('./gameAssets/characters/charactersCore').characters;
const elements_ = require('./gameAssets/characters/charactersCore').elements;
const character = require('./gameAssets/characters/charactersCore').Character;
const element = require('./gameAssets/characters/elementClass');

// Módulos de Retorno de Dados
const returnClientsFromLobby = require('../modules/_returnClientsFromLobby');
const returnUsersFromLobby = require('../modules/_returnUsersFromLobby');
const filterClientById = require('../modules/_filterClientId');
const manageClientRest = require('../modules/_manageClientRest');
const { isThisTypeNode } = require('typescript');

// Textos de validação.
const jwtKey = "a@@cuASIOSAx0AS389#$2isadpASdxzklcnx_cwaSdj0932109389ef09sadjfd0sif";
const accessKey = 'aXmsaKsoaPw9192_CClsoKWmLx,lSkWPeo´qpLSOjpOMXpoaJspoJXpasmOPWempaSOdmPSOd__dsapiPWO())';

function delay(time){
    return new Promise((resolve, reject)=>{
        setTimeout(()=>{
            resolve();
        }, time)
    });
}

const State = class State extends schema.Schema{
    constructor(){
        super();

        this.loading = true; // O JOGO FICA PARADO ENQUANTO ESSE BOOL FOR TRUE

        this.player = new schema.MapSchema();
        this.entities = new schema.MapSchema();
        this.elements = new schema.MapSchema();

        this.roundCount = 0;
        this.roundPriorityList = [];
        // TurnPriority vai ser o EntityId da entidade que tem o turno para jogar ou
        // PreTurn: pre turno.
        // PosTurn: pos turno.
        // Round: troca de round.
        // Off: Antes do jogo começar.
        this.turnPriority = "off";
        this.turnPriorityHistory = [];

        this.turnCount = 0;
    }

    // Destrói um ELEMENT_ (elemento / projétil) do jogo por ID.
    eDestroy(eId){
        this.elements.delete(eId);
    }

    // Cria um ELEMENT_ (elemento / projétil) do jogo por ID.
    eCreate(elementStringId, creatorId, position, spawnCallBack){
        // elementStringId = O id de identificação fundamental do elemento, ex: eAegisIceAAProjectile
        // position = Objeto de localização fundamental: {x: float, y: float, scaleX: float, scaleY: float }
        // spawnCallBack = Função de callback para inicialização do elemento.

        if(!spawnCallBack) spawnCallBack = ()=>{};

        var elementId = uuidv1();
        this.elements.set(elementId, new elements_[elementStringId]().assign({
            id: elementStringId,
            elementId: elementId,
            entityId: creatorId,

            vector: new Vector2_().assign({
                x: position.x,
                y: position.y,
                scaleX: position.scaleX,
                scaleY: position.scaleY,
                speed: 0,
            }),
            root: new Vector2_().assign({
                x: position.x,
                y: position.y,
                scaleX: position.scaleX,
                scaleY: position.scaleY,
                speed: 0,
            }),
            goal: new Vector2_().assign({
                x: position.x,
                y: position.y,
                scaleX: position.scaleX,
                scaleY: position.scaleY,
                speed: 0,
            })
        }));

        this.elements[elementId].Spawn(()=>{ spawnCallBack(elementId) });

        return elementId;
    }

    // Cria um ENTITY (entidade) do jogo. RETORNA ID.
    Born(charStringId, skin, playerId, team, position){
        // charStringId = O id fundamental do personagem, como "Aegis" ou "Mox".
        // skin = A skin que o personagem usará, em dúvida coloque "Clássico".
        // playerId = o ID do jogador, caso não exista deixe em branco = "".
        // team = O time pertencente, pode ser de A - Z sendo A e B respectivamente Conselho e Rebelião, e N para monstros neutros.
        // position = Um objeto com X e Y, {x: float, y: float}.

        var entityId = uuidv1();
        this.entities.set(entityId, new characters[charStringId]().assign({
            entityId: entityId,
            skin: skin,
            playerId: playerId,
            team: team,

            vector: new Vector2_().assign({
                x: position.x,
                y: position.y,
                scaleX: (position.x > 0)?-0.4:0.4,
                scaleY: 0.4,
                speed: 0,
            }),
            root: new Vector2_().assign({
                x: position.x,
                y: position.y,
                scaleX: (position.x > 0)?-0.4:0.4,
                scaleY: 0.4,
                speed: 0,
            }),
            goal: new Vector2_().assign({
                x: position.x,
                y: position.y,
                scaleX: (position.x > 0)?-0.4:0.4,
                scaleY: 0.4,
                speed: 0,
            })
        }));
        this.entities[entityId].Spawn(this);

        return entityId;
    }
}

schema.defineTypes(State, {
    loading: 'boolean',

    player: { map: PlayerSchema },
    entities: { map: character },
    elements: { map: element },

    roundCount: 'int32',
    roundPriorityList: [ 'string' ],
    turnPriority: 'string',
    turnPriorityHistory: [ 'string' ],

    turnCount: 'int32',

}, new schema.Context());

////////////////////////////////////////

function generateCoordInterval(min, max){
    return Math.random() * (max - min + 1) + min;
}

////////////////////////////////////////

module.exports = class extends colyseus.Room {
    /////////////////// CRIAÇÃO
    async onCreate(options){
        this.setState(new State());
        this.lobbyUsers = await returnUsersFromLobby();
        this.autoDispose = false;

        this.maxClients = options.maxClients;
        this.interval_;

        // GERAR COORDENADAS PARA PERSONAGENS DE JOGADORES (INICIAIS)
        this.generatePlayerCoord = (team)=>{
            switch(team){
                case "A":
                    var e = 0;
                    this.state.entities.forEach((value, key)=>{
                        if(value.team == 'A') e++;
                    });

                    if(e == 0){
                        return {
                            x: generateCoordInterval(-6, -5.6),
                            y: generateCoordInterval(-3.6, -4),
                        }
                    } else if (e == 1){
                        return {
                            x: generateCoordInterval(-9, -8.4),
                            y: generateCoordInterval(-4.1, -4.4),
                        }
                    } else if (e == 2){
                        return {
                            x: generateCoordInterval(-11, -10.5),
                            y: generateCoordInterval(-3.2, -4),
                        }
                    }
                    break;
                case "B":
                    var e = 0;
                    this.state.entities.forEach((value, key)=>{
                        if(value.team == 'B') e++;
                    });

                    if(e == 0){
                        return {
                            x: generateCoordInterval(6, 5.6),
                            y: generateCoordInterval(-3.6, -4),
                        }
                    } else if (e == 1){
                        return {
                            x: generateCoordInterval(9, 8.4),
                            y: generateCoordInterval(-4.1, -4.4),
                        }
                    } else if (e == 2){
                        return {
                            x: generateCoordInterval(11, 10.5),
                            y: generateCoordInterval(-3.2, -4),
                        }
                    }
                    break;
            }
        }

        // INSERÇÃO DE JOGADORES E ENTIDADES INICIAIS.
        options.data.forEach((value, index)=>{
            var coordenates = this.generatePlayerCoord(value.team);
            var entityId = this.state.Born(value.character, value.skin, value.id, value.team, {x: coordenates.x, y: coordenates.y});
                
            this.state.player.set(value.id, new PlayerSchema().assign({
                characterAttached: entityId,
                online: false,
                ready: false,

                id: value.id,
                nickName: value.nickName,

                gold: 0,
                team: value.team
            }))

            manageClientRest(value.id, this.roomId, 'add');
        });

        /////////// MENSAGENS DE INICIALIZAÇÃO
        this.onMessage("RequestIdentify", (client, message)=>{
            client.send("IdentifyAssignment", {id: client['_id']});
        });
        this.onMessage("ConfirmLoad", (client, message)=>{
            if(this.state.loading == true){
                this.state.player.get(client['_id']).ready = true;
            
                // var x = true;
                // this.state.player.forEach((value, key)=>{
                //     if(value.ready == false) x = false;
                // })

                // if(x == true) this.StartGame();

                this.broadcast("CloseLoadScreen", false);
                this.state.loading = false;
                this.StartGame();
            } else {
                this.state.player.get(client['_id']).ready = true;

                client.send("CloseLoadScreen", true);
            }
            
        });
        this.onMessage("ping", (client, message)=>{ client.send("pong", message) });

        // Define interações com o JOGADOR no jogo em si.
        this.setMessagesGame = this.setMessagesGame.bind(this);
        this.setMessagesGame();

        // CRIAÇÃO DO DELTATIME UPDATE
        this.update = this.update.bind(this);
        this.syncEntitiesStatusAndUpdate = this.syncEntitiesStatusAndUpdate.bind(this);
        this.syncEntitiesPos = this.syncEntitiesPos.bind(this);
        this.roundListEntities = this.roundListEntities.bind(this);

        this.syncElementsPos = this.syncElementsPos.bind(this);
        this.syncElementsUpdate = this.syncElementsUpdate.bind(this);

        this.setSimulationInterval( (deltaTime)=> this.update(deltaTime) );
    }

    // DEFINIR MENSAGENS DENTRO DO JOGO.
    setMessagesGame(){
        this.requestTimeout = null;
        this.onMessage("UseAction", (client, message)=>{
            var p = this.state.player.get(client['_id']);
            var e = this.state.entities.get(p.characterAttached);

            e.skills[message.habIndex].Push(this.state, this, message);
        });

        this.onMessage("CheckAction", (client, message)=>{
            var p = this.state.player.get(client['_id']);
            var e = this.state.entities.get(p.characterAttached);

            e.skills[message.habIndex].CheckPush(this.state, this, client);
        })

        this.onMessage("RequestTime", (client, message)=>{
            var y = this.state.player.get(client['_id']);
            var z = this.state.entities.get(y.characterAttached);

            if(this.requestTimeout != null) return;
            if(this.interval_.paused) return;
            if(z.entityId != this.state.turnPriority) return;

            z.BlockAllAbilities(154);
            this.interval_.pause();

            this.requestTimeout = setTimeout(()=>{
                if(this.interval_.paused) {
                    z.UnBlockAllAbilities(154);
                    this.PassTurn();
                }
            }, message*1000);
        });

        this.onMessage("ResumeTimer", (client, message)=>{
            var y = this.state.player.get(client['_id']);
            var z = this.state.entities.get(y.characterAttached);

            if(this.requestTimeout == null) return;
            if(z.entityId != this.state.turnPriority) return;

            clearTimeout(this.requestTimeout);
            z.UnBlockAllAbilities(154);
            this.interval_.resume();

            this.requestTimeout = null;
        });

        this.onMessage("RequestSkillsBlock", (client, message)=>{
            var y = this.state.player.get(client['_id']);
            var z = this.state.entities.get(y.characterAttached);

            if(z.entityId != this.state.turnPriority) return;

            z.BlockAllAbilities(153);

        })

        this.onMessage("RemoveSkillsBlock", (client, message)=>{
            var y = this.state.player.get(client['_id']);
            var z = this.state.entities.get(y.characterAttached);

            if(z.entityId != this.state.turnPriority) return;

            z.UnBlockAllAbilities(153);
        });

        this.onMessage("PassTurn", (client, message)=>{
            var y = this.state.player.get(client['_id']);
            var z = this.state.entities.get(y.characterAttached);

            if(z.entityId == this.state.turnPriority){
                this.PassTurn();
            }
        });
    }

    // IN GAME UPDATES
    update(deltaTime){
        // Status | Update | Posição e Update de Efeitos e Habilidades das ENTIDADES.
        this.syncEntitiesStatusAndUpdate(deltaTime);
        this.syncEntitiesPos(deltaTime);
        this.entitiesSkillsEffectsAndItemsUpdate(deltaTime);
        //

        // Update e Posição de Elementos.
        this.syncElementsPos(deltaTime);
        this.syncElementsUpdate(deltaTime);
        //


    }

    //////////////////// STATUS | UPDATE | POSIÇÃO E UPDATE DE EFEITOS E HABILIDADES DE ENTIDADES
    syncEntitiesStatusAndUpdate(deltaTime){
        if(this.state.entities.size == 0) return;
        this.state.entities.forEach((value, key)=>{
            value.SyncStatus(); 
            value.Update(deltaTime);
        })
    }

    syncEntitiesPos(deltaTime){
        if(this.state.entities.size == 0) return;
        this.state.entities.forEach((value, key)=>{
            if(value.moveTo[0] != null) value.UpdateAlongThePath(deltaTime);
        });
    }

    entitiesSkillsEffectsAndItemsUpdate(deltaTime){
        if(this.state.entities.size == 0) return;
        // Executar todos os UPDATE das habilidades dos personagens.
        this.state.entities.forEach((value, key)=>{
            value.skills.forEach((value)=>{
                value.Update(deltaTime, this.state, this);
            });
        })
    }
    ////////////////////

    //////////////////// UPDATE E POSIÇÂO DE ELEMENTOS
    syncElementsPos(deltaTime){
        if(this.state.elements.size == 0) return;
        this.state.elements.forEach((value, key)=>{
            if(value.moveTo[0] != null) value.UpdateAlongThePath(deltaTime);
        });
    }

    syncElementsUpdate(deltaTime){
        if(this.state.elements.size == 0) return;
        this.state.elements.forEach((value, key)=>{
            value.Update(deltaTime);
        });
    }
    ////////////////////

    // POS TURN MANAGER
    managePosTurn(){
        return new Promise((resolve, reject)=>{
            // Organizar as entidades por MVP
            var protoArray = []

            this.state.entities.forEach((value, key)=>{
                protoArray.push({entityId: value.entityId, mvp: value.CharStatus.mvp});
            });

            var newRound = protoArray.sort((a, b)=>{
                if(a.mvp < b.mvp){
                    return -1;
                } else if(a.mvp > b.mvp){
                    return 1;
                } else return 0;
            });

            newRound.forEach(async (value)=>{
                for(var skill of this.state.entities[value.entityId].skills){
                    await skill.PosTurn(this.state, this);
                }
                resolve();
            });
        }); 
    }

    // PRE TURN MANAGER
    managePreTurn(){
        return new Promise((resolve, reject)=>{
            // Organizar as entidades por MVP
            var protoArray = []

            this.state.entities.forEach((value, key)=>{
                protoArray.push({entityId: value.entityId, mvp: value.CharStatus.mvp});
            });

            var newRound = protoArray.sort((a, b)=>{
                if(a.mvp < b.mvp){
                    return -1;
                } else if(a.mvp > b.mvp){
                    return 1;
                } else return 0;
            });

            newRound.forEach(async (value)=>{
                for(var skill of this.state.entities[value.entityId].skills){
                    await skill.PreTurn(this.state, this);
                }
                resolve();
            });
        }); 
    }


    //////////////////////////////// TURN / ROUND MANAGEMENT.
    roundListEntities(){
        if(this.state.roundPriorityList.length != 0) return;

        var protoArray = []

        this.state.entities.forEach((value, key)=>{
            protoArray.push({entityId: value.entityId, mvp: value.CharStatus.mvp});
        });

        var newRound = protoArray.sort((a, b)=>{
            if(a.mvp < b.mvp){
                return -1;
            } else if(a.mvp > b.mvp){
                return 1;
            } else return 0;
        });

        newRound.forEach((value, index)=>{
            this.state.roundPriorityList.push(value.entityId);
        });

        this.state.roundCount += 1;
    }

    async TurnManager(){
        this.clock.clear();
        
        // Processamento de PÓS TURNO e depois PRÉ TURNO de todas entidades.~
        this.state.turnPriority = "posturn";
        await delay(1000);
        await this.managePosTurn();
        if(this.state.roundPriorityList.length == 0){
            this.state.turnPriority = "round";
            await delay(2000);
            this.roundListEntities();
        }
        this.state.turnPriority = "preturn";
        await delay(1000);
        await this.managePreTurn();
       
        this.state.turnPriority = this.state.roundPriorityList[0];
        this.SetHistory();
        
        this.state.turnCount = 40;

        this.interval_ = this.clock.setInterval(()=>{
            this.state.turnCount -= 1;
            if(this.state.turnCount <= 0){
                this.PassTurn();
            }
        }, 1000);
    }

    PassTurn(){
        var z = this.state.entities.get(this.state.turnPriority);
        z.UnBlockAllAbilities(153);

        this.state.turnCount = 0;
        this.state.roundPriorityList.shift();
        this.TurnManager();
    }

    SetHistory(){
        if(this.state.turnPriorityHistory.length == 64){
            this.state.turnPriorityHistory.pop();
        }
        this.state.turnPriorityHistory.unshift(this.state.turnPriority);
    }

    StartGame(){
        this.TurnManager();
    }
    










    /////////////////// AUTENTICAÇÃO
    async onAuth(client, options, request){
        // Checar token.
        if(options.token == undefined) return false;

        // Decodificar e validar token.
        try { var decodedToken = await jwt.verify(options.token, jwtKey) } 
        catch(e) { return false }

        // Checar se está conectado ao Lobby.
        var c_ = this.lobbyUsers((decodedToken._id).toString());
        if(c_ == undefined) return false;

        // Checar se é um player da partida.
        var p_ = this.state.player.get(decodedToken._id);
        if(p_ == undefined) return false;
        if(p_.online) return false;

        // Acrescentar dados.
        client['_id'] = (decodedToken._id).toString();
        client['_data'] = c_._data;
        client['_dataUpdate'] = c_._dataUpdate;

        return true;
    }

    /////////////////// PÓS-AUTENTICAÇÃO
    onJoin(client, options, auth){
        var p_ = this.state.player.get(client['_id']);
        p_.online = true;
    }

    /////////////////// AO SAIR
    onLeave(client, consented){
        var p_ = this.state.player.get(client['_id']);
        p_.online = false;
        p_.ready = false;
    }

    /////////////////// AO DESLIGAR SALA
    onDispose(){
        this.state.player.forEach((value, key)=>{
            manageClientRest(value.id, this.roomId, 'remove');
        })
    }
}