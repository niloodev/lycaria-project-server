const colyseus = require('colyseus');
const schema = require('@colyseus/schema');
const gaze = require('gaze');
const fs = require('fs');

//////////// Declaração de Módulos.
const userData = require('mongoose').model('user');
const returnClientById = require('./modules/_filterClientId');

// Token
const jwt = require('jsonwebtoken');

// Chaves de Texto
const jwtKey = "a@@cuASIOSAx0AS389#$2isadpASdxzklcnx_cwaSdj0932109389ef09sadjfd0sif";
const accessKey = 'aXmsaKsoaPw9192_CClsoKWmLx,lSkWPeo´qpLSOjpOMXpoaJspoJXpasmOPWempaSOdmPSOd__dsapiPWO())';

exports.GameRoom = class extends colyseus.Room {
    //////////// Criação do saguão.
    onCreate (options) {
        this.autoDispose = false;
        this.maxClients = 200;

        this.clientInRest = {};
        this.setMessages();

        console.log('GameLobby estabelecido.');
    }

    //////////// Autenticação de cliente, que vai se conectar a sala. options = {token: string, accessKey: string}.
    async onAuth(client, options){
        // Checar chave de acesso.
        if(options.accessKey != accessKey) return false;

        // Decodificar e validar token.
        try { var decodedToken = await jwt.verify(options.token, jwtKey) } 
        catch(e) { return false }

        // Procurar usuário no Banco de Dados.
        try {
            var user_ = await userData.find({_id: decodedToken._id, email: decodedToken.email});
            if(user_.length == 0) return false;
        } catch(e) { return false }
    
        // Validar senha do token com Banco de Dados
        if (user_[0].password != decodedToken.pass) return false;

        // Checar se existe sessão. Se sim, fecha a sessão conectada e inicia essa.
        var c_ = returnClientById(this.clients, decodedToken._id);
        
        if(c_ != undefined) {
            client['_data'] = c_['_data'];

            c_['onLeaveReconnection'] = true;
            c_.leave(1009);

            client['_id'] = (user_[0]._id).toString();
            client._dataUpdate = ()=>{
                client.send('DataUpdate', client['_data']);
            }
        } else {
            // Definir request com os dados do usuário.
            client['_id'] = (user_[0]._id).toString();
            client['_data'] = user_[0];
            client._dataUpdate = ()=>{
                client.send('DataUpdate', client['_data']);
            }
        }

        // Introduzir cliente no Lobby.
        return true;
    }

    onJoin (client, options) {
        // Adicionar campeões à todas as contas que entrarem (BETA)
        client['_data'].characters = [];

        client['_data'].characters.push({
            id: 'Aegis',
            skins: ['Clássico']
        })
    }

    // Define listeners para o cliente
    setMessages(){
        //////////////////////////////////////////// Requisição do cliente por informações;
        this.onMessage('requestClientInfo', async (client, data)=>{
            if(data == '') client._dataUpdate();
            else {
                var y_ = returnClientById(this.clients, data);
                if (y_ == undefined) return;
                else client.send('DataUpdate/'+y_._id, y_['_data']);
            }
        });

        this.onMessage('checkForUpdates', async (client, data)=>{
            var version = fs.readFileSync(__dirname+'/gameSource/version.lycaria').toString();

            if(data != version) client.send('updateReady', '/source/gameSource/lycaria'+ version + '.zip');
            else client.send('alreadyUpdated', true);
        }); 

        this.onMessage('checkForUnity', (client, data)=>{
            // Vê se jogador se encontra em partida.
            if(this.clientInRest[client['_id']] != undefined) {
                client.send('startUnity', this.clientInRest[client['_id']]);
            }
        });
    }

    // Retorna a data de um jogador.
    getClientData(id){
        var c_ = returnClientById(this.clients, id);
        return c_['_data'];
    }

    // Conecta um cliente à um jogo (UNITY)
    connectClientToGame(id, seat){
        var c_ = returnClientById(this.clients, id);
        c_.send('startUnity', seat);
    }

    // Adiciona ou remove um cliente de um jogo constante.
    manageClientInGames(id, seat, type){
        if(type == 'add'){
            this.clientInRest[id] = seat;
        } else if (type == 'remove'){
            this.clientInRest[id] = undefined;
        }
    }

    async onLeave (client, consented) {        
        // Desconectar da MatchRoom se existente.
        if(client._data['matchRoom'] != undefined){
            var room = colyseus.matchMaker.getRoomById(client['_matchRoom']);
            if(room != undefined){
                var c_ = returnClientById(room.clients, client['_id']);
                if(c_ != undefined) c_.leave(1002);
            }
        }
        
        // Quando a saida é limpa e não tem ninguém tentando conectar nessa conta.
        if(!client['onLeaveReconnection']){          
            await userData.updateOne({_id: client['_id']}, {$set: {nickName: client['_data'].nickName, money: client['_data'].money, exp: client['_data'].exp, icon: client['_data'].icon, characters: client['_data'].characters}});
        }
    }

    onDispose() {
    }
}
