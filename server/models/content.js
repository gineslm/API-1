const mongoose = require('mongoose');

let Schema = mongoose.Schema;



let contentSchema = new Schema({

    destino: {
        type: String,
        required: [true, 'El destino es necesario']
    },
    area: {
        type: String,
        unique: true,
        required: [true, 'El area es necesaria']
    },
    text: {
        type: String
    },
    clase: {
        type: String
    },
    img: {
        type: String
    },
    link: {
        type: Array
    },
    act: {
        type: Boolean,
        default: true
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