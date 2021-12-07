const schema = require('@colyseus/schema');
const Schema = schema.Schema;

const Vector2_ = require('./vector2Class');
const clamp = require('math-clamp');
const { Vector2 } = require('three');

// PreFabs são projeteis e componentes da tela que não possuem turno e nem atributos.
const Element_ = class Element_ extends Schema {
    constructor(){
        super();
        this.entityId = "";

        // MoveTo é uma array composta por [Vector2, Freq. Update, Radius de Aproximação, DeltaCalculator, Speed, Callback].
        this.moveTo = [null, 0, 0, 0, ()=>{}];
        this.vector2Coord = new Vector2();
    }

    Spawn(spawnCallBack){
        spawnCallBack();
    }

    Update(deltaTime){

    }

    // Se o Speed for 0, FREQ será reconsiderada lembrando que FREQ é sempre 1/tempo em segundos.
    // Se Freq for 0, SPEED será reconsiderada e o tempo de viagem vai ser calculado a partir da velocidade sugerida.
    // Freq = 1 / (TEMPO EM SEGUNDOS) | SPEED = FLOAT pixel/segundo.
    SetMoveTo(x, y, freq, radius, speed, callback){
        this.moveTo[0] = new Vector2(x, y);
        this.moveTo[1] = freq;
        this.moveTo[2] = radius;
        this.moveTo[3] = 0;
        this.moveTo[4] = callback;

        if(speed != 0){
            var this_ = new Vector2(this.vector.x, this.vector.y);
            var distance = this_.distanceTo(this.moveTo[0]);
            var time = distance / speed;
            this.moveTo[1] = 1/time;
        }

        this.vector.speed = Math.pow(this.moveTo[1], -1);

        this.vector2Coord.x = this.vector.x;
        this.vector2Coord.y = this.vector.y;  

        this.goal.x = x;
        this.goal.y = y;
        this.goal.speed = this.moveTo[1];
    }

    SetToRoot(freq, speed, callback){
        this.moveTo[0] = new Vector2(this.root.x, this.root.y);
        this.moveTo[1] = freq;
        this.moveTo[2] = 0.002;
        this.moveTo[3] = 0;
        this.moveTo[4] = callback;

        if(speed != 0){
            var this_ = new Vector2(this.vector.x, this.vector.y);
            var distance = this_.distanceTo(this.moveTo[0]);
            var time = distance / speed;
            this.moveTo[1] = 1/time;
        }
        
        this.vector.speed = Math.pow(this.moveTo[1], -1);

        this.vector2Coord.x = this.vector.x;
        this.vector2Coord.y = this.vector.y;

        this.goal.x = this.root.x;
        this.goal.y = this.root.y;
        this.goal.speed = freq;
    }

    Flip(){
        this.vector.scaleX = this.vector.scaleX*-1;
    }

    UpdateAlongThePath(deltaTime){
        if(this.moveTo[0] == null) return;
        
        this.moveTo[3] += this.moveTo[1]*deltaTime/1000;
        if(this.moveTo[3] > 1) this.moveTo[3] = 1;
        if(this.moveTo[3] < 0) this.moveTo[3] = 0;

        var newPos = new Vector2().lerpVectors(this.vector2Coord, this.moveTo[0], this.moveTo[3]);

        this.vector.x = newPos.x;
        this.vector.y = newPos.y;

        if(newPos.distanceTo(this.moveTo[0]) <= this.moveTo[2]){
            this.moveTo[4]();
            this.moveTo = [null, 0, 0, 0, ()=>{}];
        }
    }
}

schema.defineTypes(Element_, {
    id: 'string',
    elementId: 'string',

    // POSIÇÃO
    vector: Vector2_,
    root: Vector2_,
    goal: Vector2_,
});

module.exports = Element_;