const schema = require('@colyseus/schema');
const Schema = schema.Schema;

const Vector2_ = class Vector2_ extends Schema{
}

schema.defineTypes(Vector2_, {
    x: 'number',
    y: 'number',
    scaleX: 'number',
    scaleY: 'number',
    speed: "number"
});

module.exports = Vector2_;