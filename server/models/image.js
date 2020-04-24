const mongoose = require('mongoose');

let Schema = mongoose.Schema;



let imageSchema = new Schema({


    act: {
        type: Boolean,
        default: true
    },
    name: {
        type: String,
        unique: true,
        required: [true, 'El nombre es necesario']
    },
    alt: {
        type: String,
        required: [true, 'la descripcion es necesaria']
    },
    folder: {
        type: String

    },
    extension: {
        type: String
    }
});


imageSchema.methods.toJSON = function() {
    let image = this;
    let imageObject = image.toObject();

    return imageObject;
}




module.exports = mongoose.model('Image', imageSchema);