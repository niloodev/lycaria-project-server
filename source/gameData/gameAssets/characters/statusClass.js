const schema = require('@colyseus/schema');
const Schema = schema.Schema;

const CharStatus = class CharStatus extends Schema{
}

schema.defineTypes(CharStatus, {
     // ATRIBUTOS
     mvp: "number",
     mvpModifiers: { map: "number" },
     mvpModifiersX: { map: "float64"},
     maxHp: "number",
     hp: "number",
     maxHpModifiers: { map: "number" },
     maxHpModifiersX: { map: "float64" },
     mana: "number",
     maxMana: "number",
     maxManaModifiers: { map: "number" },
     maxManaModifiersX: { map: "float64" },
     ap: "number",
     apModifiers: { map: "number" },
     apModifiersX: { map: "float64" },
     ad: "number",
     adModifiers: { map: "number" },
     adModifiersX: { map: "float64" },
     mr: "number",
     mrModifiers: { map: "number" },
     mrModifiersX: { map: "float64" },
     mrPainPlane: "number",
     mrPainPlaneModifiers: { map: "number" },
     mrPainPlaneModifiersX: { map: "float64" },
     mrPainPorc: "number",
     mrPainPorcModifiers: { map: "number" },
     mrPainPorcModifiersX: { map: "float64" },
     ar: "number",
     arModifiers: { map: "number" },
     arModifiersX: { map: "float64" },
     arPainPlane: "number",
     arPainPlaneModifiers: { map: "number" },
     arPainPlaneModifiersX: { map: "float64" },
     arPainPorc: "number",
     arPainPorcModifiers: { map: "number" },
     arPainPorcModifiersX: { map: "float64" },
     vamp: "number",
     vampModifiers: { map: "number" }, 
     vampModifiersX: { map: "float64" }, 
     vitality: "number",
     vitalityModifiers: { map: "number" },
     vitalityModifiersX: { map: "float64" }
});

module.exports = CharStatus;