const mongoose = require('mongoose');

let Schema = mongoose.Schema;



let contentSchema = new Schema({


    act: {
        type: Boolean,
        default: true
    },
    destino: {
        type: String,
        required: [true, 'El destino es necesario']
    },
    area: {
        type: String,
        unique: true,
        required: [true, 'El area es necesaria']
    },
    clase: {
        type: String
    },
    descripcion: {
        type: String,
    },
    estilo: {
        type: String,
    },
    text: {
        type: String
    },
    img: {
        type: String
    },
    media: {
        type: String
    },
    link: {
        type: Array
    },
    autor: {
        type: String
    }
});


// eliminamos la contraseña de la impresion en JSON del objeto
contentSchema.methods.toJSON = function() {
    let content = this;
    let contentObject = content.toObject();
    // filtrado del JSON
    //delete contentObject.password;

    return contentObject;
}




module.exports = mongoose.model('Content', contentSchema);