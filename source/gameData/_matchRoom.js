// Módulos Principais
const colyseus = require('colyseus');
const matchMaker = colyseus.matchMaker;
const schema = require('@colyseus/schema');
const jwt = require('jsonwebtoken');

const {setCharactersList, Character, CharacterList} = require('./gameAssets/characters/charactersCore');
const PlayerMatchInfo = require('./gameAssets/schema/playerMatchInfo');

// Módulos de Retorno de Dados
const returnClientsFromLobby = require('../modules/_returnClientsFromLobby');
const returnUsersFromLobby = require('../modules/_returnUsersFromLobby');
const filterClientById = require('../modules/_filterClientId');
const _filterClientId = require('../modules/_filterClientId');
const _callGame = require('../modules/_callGame');

// Textos de validação.
const jwtKey = "a@@cuASIOSAx0AS389#$2isadpASdxzklcnx_cwaSdj0932109389ef09sadjfd0sif";
const accessKey = 'aXmsaKsoaPw9192_CClsoKWmLx,lSkWPeo´qpLSOjpOMXpoaJspoJXpasmOPWempaSOdmPSOd__dsapiPWO())';

///////////////////////////////////////////////////////////////////////////////////

const State = class State extends schema.Schema{
    constructor(){
        super();
        this.teamA = new schema.ArraySchema();
        this.teamB = new schema.ArraySchema();
        this.playerMatch = new schema.MapSchema();

        this.metadata = '';
        this.leader = '';

        this.selectTime = 0;
        this.selectState = false;
        this.selectReady = false;

        this.characters = setCharactersList();
    }
}
schema.defineTypes(State, {
    teamA: [ 'string' ],
    teamB: [ 'string' ],
    metadata: 'string',
    leader: 'string',
    selectTime: 'int32',
    selectState: 'boolean',
    selectReady: 'boolean',
    playerMatch: { map: PlayerMatchInfo },
    characters: { map: CharacterList }
}, new schema.Context());

///////////////////////////////////////////////////////////////////////////////////

module.exports = class extends colyseus.Room {
    // options = {mode: number (1 a 3), creator: string (jogador que criou a sala), roomName: string}
    async onCreate (options) { 
        /////////////////////////////// PREPARAÇÃO DE EQUIPES E DEFINIÇÃO DE MODOS
        this.setState(new State());
        this.interval_;
        this.lobbyUsers = await returnUsersFromLobby();

        // Definição de modo da sala; 1 = "1v1", 2 = "2v2", 3 = "3v3"
        switch (options.mode) {
            case 1: // 1v1
                this.maxClients = 2;
            break;

            case 2: // 2v2
                this.maxClients = 4;
            break;

            case 3: // 3v3
                this.maxClients = 6;
            break;
        }
        ///////////////////////////////

        /////////////////////////////// MISC
        this.leaderManager().setListeners();

        this.onMessage('SelectChat', (c, m)=>{
            if(this.state.selectState == false) return;

            var m_ = this.state.playerMatch.get(c['_id']);

            this.state['team'+m_.team].forEach((v, i)=>{
                var l_ = filterClientById(this.clients, v);
                l_.send('SelectChat', {autor: c._data.nickName, message: m, identity: (l_['_id'] == c['_id'])?true:false});
            });
        });
        ///////////////////////////////

        /////////////////////////////// METADATA (ACHAR A SALA NA PESQUISA)
        this.password = options.password;

        var metadataObj = {mode: `${options.mode} vs ${options.mode}`, roomName: options.roomName, creator: options.creator, locked: (this.password != null)?true:false};

        this.setMetadata(metadataObj);
        this.state.metadata = JSON.stringify(metadataObj);
        ///////////////////////////////
    }

    // Leader Manager
    leaderManager(){
        var $this = this;
        return {
            set(newLeader){
                $this.state.leader = newLeader;
            },
            get(){
                return $this.state.leader;
            },
            setListeners(){
                $this.onMessage('promoveToLeader', (c, m)=>{
                    if($this.state.selectState) return;
                    if(c['_id'] != $this.state.leader) return;

                    $this.state.leader = m;
                });
                $this.onMessage('goToOtherTeam', (c, m)=>{
                    if($this.state.selectState) return;
                    if($this.state.leader != c['_id'] && c['_id'] != m) return;

                    var m_ = filterClientById($this.clients, m);
                    if(m_ == undefined) return;
                    
                    var teamOps_ = (m_['team'] == 'A')?$this.state.teamB:$this.state.teamA;
                    var myTeam = (m_['team'] == 'A')?$this.state.teamA:$this.state.teamB;
                    var newProp = (m_['team'] == 'A')?'B':'A';

                    if(teamOps_.length == $this.maxClients/2) return;

                    try {
                        myTeam.splice(myTeam.indexOf(m), 1);
                        teamOps_.push(m);
                        m_['team'] = newProp;
                    } catch(e) { return }
                });
                $this.onMessage('closeClient', (c, m)=>{
                    if($this.state.selectState) return;
                    if(c['_id'] == m || c['_id'] != $this.state.leader) return;

                    var m_ = filterClientById($this.clients, m);
                    if(m_ == undefined) return;

                    m_.leave(1001);
                });
                $this.onMessage('startMatch', (c)=>{
                    if(c['_id'] != $this.state.leader) return;
                    if($this.clients.length != $this.maxClients) return;

                    $this.startCharacterSelect();
                });
            }
        }
    }

    startCharacterSelect(){
        if(this.state.selectState == true) return;

        this.state.selectState = true;
        this.state.selectTime = 60;

        // Definir objeto de partida de cada um dos jogadores.
        this.clients.forEach(client => {
            var team = (this.state.teamA.indexOf(client['_id']) != -1)?'A':'B';
            this.state.playerMatch.set(client['_id'], new PlayerMatchInfo().assign({
                locked: false,
                character: '',
                team: team,
                skin: '',
                id: client['_id'],
                nickName: client['_data'].nickName
            }));
        })

        // Iniciar contagem para seleção de personagem.
        this.interval_ = this.clock.setInterval(()=>{
            if(this.state.selectReady) return;

            this.state.selectTime -= 1;
            if(this.state.selectTime <= 0){   
                this.state.selectTime = 0;
                
                let checkPlayers = true;
                this.state.playerMatch.forEach((value, key)=>{
                    if(value.character == '') {
                        checkPlayers = false;
                    }
                    if(!value.locked) {
                        checkPlayers = false;
                    }
                });
                
                if(!checkPlayers){
                    this.broadcast('MatchData', {type: 'warning', text: 'Parece que alguém não selecionou uma personagem.'});
                    this.stopCharacterSelect();
                }              
            }
        }, 1000);
        
        this.onMessage('selectChar', (c, m)=>{
            if(!this.state.selectState) return;
            if(this.state.selectReady) return;
            var y_ = this.state.playerMatch.get(c['_id']);
            var u_ = c;

            let haveChamp = false;
            u_._data.characters.forEach((v, i)=>{
                if(v.id == m) haveChamp = true;
            });

            if(!haveChamp) return;
            if(this.state.characters.get(m) == undefined) return;

            y_.character = m;
        });
        this.onMessage('lockChar', (c, m)=>{
            if(!this.state.selectState) return;
            if(this.state.selectReady) return;
            var y_ = this.state.playerMatch.get(c['_id']);

            if(y_.character == '') return;
            y_.skin = 'Clássico';
            y_.locked = true;
            console.log(y_);

            let allChampsLocked = true;
            this.state.playerMatch.forEach((v, i)=>{
                if(!v.locked) allChampsLocked = false;
            });

            if(allChampsLocked) this.finishCharacterSelect();
        })
        this.onMessage('selectSkin', (c, m)=>{
            if(!this.state.selectState) return;

            var y_ = this.state.playerMatch.get(c['_id']);
            if(y_.character == '') return;
            if(y_.locked == false) return;

            let index = c['_data'].characters.map((v, i)=>{return v.id}).indexOf(y_.character);
            let haveSkin = false;
            c['_data'].characters[index].skins.forEach((v, i)=>{
                if(v == m) haveSkin = true;
            })

            if(haveSkin){
                y_.skin = m;
            }
        });
    }
    stopCharacterSelect(){
        if(!this.state.selectState) return;
        this.state.selectState = false;
        this.state.selectReady = false;
        this.clock.clear();

        // Deleta o objeto de partida dos jogadores.
        this.state.playerMatch.forEach((value, key)=>{
            this.state.playerMatch.delete(key);
        });

        this.onMessage('selectChar', ()=>{});
        this.onMessage('lockChar', ()=>{});
    }
    finishCharacterSelect(){
        if(!this.state.selectState) return;
        this.state.selectReady = true;
        this.clock.clear();

        this.onMessage('selectChar', ()=>{});
        this.onMessage('lockChar', ()=>{});

        this.state.selectTime = 30;

        this.interval_ = this.clock.setInterval(()=>{
            this.state.selectTime -= 1;
            if(this.state.selectTime <= 0){
                this.clock.clear();
                
                var data_ = [];
                this.state.playerMatch.forEach((value, key)=>{
                    data_.push(value);
                })

                matchMaker.createRoom('Game', {data: data_, maxClients: this.maxClients}).then((info)=>{
                    data_.forEach((value, index)=>{
                        _callGame(value.id, info.roomId);
                    })
                    this.clients.forEach((value, index)=>{
                        value.leave(1002);
                    });
                    this.disconnect();
                });
            }
        }, 1000);
    }

    // options = {token: string}
    async onAuth (client, options, request) {
        // Checar se pessoa existe no LOBBY principal, ou seja, se esta conectada.
        if(this.password != null) if(this.password != options.password) return false;
        
        // Checar token.
        if(options.token == undefined) return false;
        console.log(options.token);

        // Decodificar e validar token.
        try { var decodedToken = await jwt.verify(options.token, jwtKey) } 
        catch(e) { return false }

        ///////////////////////////////////////////////////////////////////// FINALIZAÇÃO DO ONAUTH

        // Transferir informações.
        var c_ = this.lobbyUsers((decodedToken._id).toString());
        if(c_ == undefined) return false;
        if(c_._data.matchRoom != undefined) return false;

        c_._data.matchRoom = this.roomId;
        client['_id'] = (decodedToken._id).toString();
        client['_data'] = c_._data;
        client['_dataUpdate'] = c_._dataUpdate;
    
        return true;
    } 

    async onJoin (client, options, auth) {
        // Quando o jogador entra, ele é posicionado aleatoriamente em um dos times.
        if(this.state.leader == '') this.leaderManager().set(client['_id']);
        
        // Encaixar TIME A
        if (this.state.teamA.length != this.maxClients/2){
            this.state.teamA.push(client['_id']);
            client['team'] = 'A';
            return;
        }

        // Encaixar TIME B
        if (this.state.teamB.length != this.maxClients/2){
            this.state.teamB.push(client['_id']);
            client['team'] = 'B';
            return;
        }   
    }

    onLeave (client, consented) { 
        // Match Room | Seleção
        if(this.state.selectState == true) {
            this.broadcast('MatchData', {type: 'warning', text: 'Parece que alguém saiu na tela de seleção de personagem.'});
            this.stopCharacterSelect();
        }

        var c_ = this.lobbyUsers(client['_id']);
        if(c_ != undefined) c_._data.matchRoom = undefined;

        switch(client['team']){
            case 'A':
                this.state.teamA.splice(this.state.teamA.indexOf(client['_id']), 1);
                break;
            
            case 'B':
                this.state.teamB.splice(this.state.teamB.indexOf(client['_id']), 1);
                break
        }

        if(client['_id'] == this.state.leader){
            var y = this.clients.find(v => {return ((v['_id']).toString() != (client['_id']).toString())});
            if(y == undefined) {
                this.disconnect();
            } else this.leaderManager().set(y['_id']); 
        }
    }

    onDispose () { 

    }
}