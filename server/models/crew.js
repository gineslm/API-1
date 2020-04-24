const mongoose = require('mongoose');

let Schema = mongoose.Schema;


let crewSchema = new Schema({


    act: {
        type: Boolean,
        default: true
    },
    name: {
        type: String,
        required: [true, 'El nombre es necesario']
    },
    lastname: {
        type: String,
        required: [true, 'El apellido es necesario']
    },
    email: {
        type: String,
        unique: true,
        required: [true, 'El email es necesario']
    },
    image: [{
        type: Schema.Types.ObjectId,
        ref: 'Image'
    }],
    date: {
        type: String
    },
    social: {
        type: Object,
        properties: {
            facebook: { type: String },
            instagram: { type: String },
            youtube: { type: String },
            linkedin: { type: String }
        }
    },
    roles: {
        type: String
    },
    links: {
        type: Array
    }
});

// eliminamos la contraseña de la impresion en JSON del objeto
crewSchema.methods.toJSON = function() {
    let crew = this;
    let crewObject = crew.toObject();
    // delete eventObject._id; // no es necesario
    return crewObject;
}



module.exports = mongoose.model('Crew', crewSchema);