const express = require('express');

const bcrypt = require('bcrypt');

const _ = require('underscore');

const User = require('../models/user');

const app = express();

const { verificaToken, verificaAdmin_Role } = require('../middleware/auth');


//////////////////////////
///////// GET ////////////
app.get('/user', verificaToken, function(req, res) {

    let inicio = req.query.inicio || 0;
    let fin = req.query.fin || 5;
    inicio = Number(inicio);
    fin = Number(fin);

    User.find({ estado: true }, 'name email estado img') ///  objj. especifican condiciones ei. activos , segundo parametro string nombre los campos q se muestran
        .skip(inicio)
        .limit(fin)
        .exec((err, users) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            User.count({ estado: true /*  misma condicion que en find */ }, (err, conteo) => {

                res.json({
                    ok: true,
                    myUser: req.myUser,
                    users,
                    cuantos: conteo
                });

            });
        });

});


////////////////////////////
/////// POST //////////////
app.post('/user', [verificaToken, verificaAdmin_Role], function(req, res) {

    let body = req.body;

    let user = new User({
        name: body.name,
        email: body.email,
        role: body.role || 'USER_ROLE',
        img: body.img || null,
        estado: body.estado || true,
        google: body.google || false,
        password: bcrypt.hashSync(body.password, 10),
    });

    user.save((err, userDB) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        // eliminacion del password en el retorno
        // opcion 1 = userDB.password = null; 
        // opcion 2 = funcion en el modelo user que elimina password en la conversion a JSON

        res.json({
            ok: true,
            myUser: req.myUser,
            newUser: userDB
        });

    });

});


////////////////////
/////// PUT ////////
app.put('/user/:id', [verificaToken, verificaAdmin_Role], function(req, res) {

    let id = req.params.id;
    let body = _.pick(req.body, ['name', 'email', 'img', 'estado']);
    /* para filtrar la entrada de parametros podemos usar el underscore.pick que filtra el objeto
    o bien utilizar deletes: delete.body.password (elimina en caso de que existiera). */

    User.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, userDB) => {


        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        if (!userDB) {
            return res.status(400).json({
                ok: false,
                err: 'no existe usuario con ese ID'
            });
        }



        res.json({
            ok: true,
            myUser: req.myUser, // este es el usuario logeado
            userUpdated: userDB // datos del usuario modificado

            // TO-DO
            // actualmente hay un problema, si el usuario logeado modifica sus datos
            // la informacion de myUser no se actualiza porque bebe de la informacion del usuario 
            // almacenada en el token

        });

    });

});



/////////////////////
////// DELETE KILL ///////

app.delete('/user/kill/:id', [verificaToken, verificaAdmin_Role], function(req, res) {

    let id = req.params.id;

    // eliminacion permanentes de la tabla
    User.findByIdAndRemove(id, (err, userDelete) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }



        if (!userDelete) {
            return res.status(400).json({
                ok: true,
                err: {
                    message: `no existe ningun usuario con el id ${id}`
                }
            });
        } else {
            res.json({
                ok: true,
                myUser: req.myUser,
                'userDelete': userDelete
            });
        }


    });

});


////////////////////
/////// DELETE ////////

app.delete('/user/:id', [verificaToken, verificaAdmin_Role], function(req, res) {

    let id = req.params.id;
    let body = _.pick(req.body, ['estado']);
    // para filtrar la entrada de parametros podemos usar el underscore.pick que filtra el objeto
    // o bien utilizar deletes: delete.body.password (elimina en caso de que existiera). 

    User.findByIdAndUpdate(id, body, { new: true }, (err, userDB) => {


        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }


        if (!req.body.estado) {
            return res.status(400).json({
                ok: true,
                err: {
                    message: `no ha definido un nuevo estado`
                }
            });
        }


        res.json({
            ok: true,
            myUser: req.myUser,
            changeTo: req.body.estado,
            userChanged: userDB
        });


    });

});




module.exports = app;