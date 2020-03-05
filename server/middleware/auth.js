const jwt = require('jsonwebtoken');


////////////////////////
// verificar token

// TO-DO esta validacion funciona como una unica capa de authorizacion
// el usuario puede modificar el data de su token, y cambiar algunos parametros
// como por ejemplo role de USER a ADMIN
// los tokens deberian ser unicos para cada usuario compuesto por parte del ID, mail y secret
// creados con cada logeo y almacenados en BBDD
// cuando se pasa el token se busca en la base de datos
// si es valido se compara la info decoded.user con la info bbdd
// si todo esta ok next();

let verificaToken = (req, res, next) => {

    let token = req.get('token');

    jwt.verify(token, process.env.SEED_TOKEN, (err, decoded) => {

        if (err) {
            return res.status(401).json({
                ok: false,
                err
            });
        }

        // el decoded es la info q hemos guardddo en el token
        req.myUser = decoded.myUser;

        next();
    });

};


let verificaAdmin_Role = (req, res, next) => {

    let myUser = req.myUser;

    if (myUser.role === 'ADMIN_ROLE') {
        next();
    } else {
        return res.status(401).json({
            ok: false,
            err: 'El usuario no es administrador'
        });

    }



};

module.exports = {
    verificaToken,
    verificaAdmin_Role
}