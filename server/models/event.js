const mongoose = require('mongoose');

let Schema = mongoose.Schema;
let categoriasValidas = {
    values: ['PARTY', 'ART_SCENE', 'CIRCUS'],
    message: '{VALUE} no es una categoria valido'
}


let eventSchema = new Schema({


    act: {
        type: Boolean
    },
    title: {
        type: String,
        unique: true,
        required: [true, 'El titulo es necesario']
    },
    description: {
        type: String,
        required: [true, 'La descripcion es necesaria']
    },
    text: {
        type: String
    },
    tecnic: {
        type: String
    },
    image: [{
        type: Schema.Types.ObjectId,
        ref: 'Image'
    }],
    date: {
        type: String,
        required: [true, 'La descripcion es necesaria']
    },
    place: {
        type: String
    },
    location: {
        type: String
    },
    codigoPlus: {
        type: String
    },
    access: {
        type: String
    },
    category: {
        type: String,
        enum: categoriasValidas
    },
    links: {
        type: Array
    },
    crew: {
        type: Array
    },
});


eventSchema.methods.toJSON = function() {
    let event = this;
    let eventObject = event.toObject();
    // delete eventObject._id; // no es necesario
    return eventObject;
}




module.exports = mongoose.model('Event', eventSchema);