const mongoose = require('mongoose');

let Schema = mongoose.Schema;
let rolesValidos = {
    values: ['ADMIN_ROLE', 'USER_ROLE'],
    message: '{VALUE} no es un rol valido'
}


let userSchema = new Schema({
    name: {
        type: String,
        required: [true, 'El nombre es necesario']
    },
    email: {
        type: String,
        unique: true,
        required: [true, 'El email es necesario']
    },
    password: {
        type: String,
        required: [true, 'La contraseña es obligatoria']
    },
    img: {
        type: String
    },
    role: {
        type: String,
        dafault: 'USER_ROLE',
        required: true,
        enum: rolesValidos
    },
    act: {
        type: Boolean,
        default: true
    },
    google: {
        type: Boolean
    }
});


// eliminamos la contraseña de la impresion en JSON del objeto
userSchema.methods.toJSON = function() {
    let usuario = this;
    let usuarioObject = usuario.toObject();
    delete usuarioObject.password;

    return usuarioObject;
}




module.exports = mongoose.model('User', userSchema);