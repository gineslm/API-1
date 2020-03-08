const express = require('express');
const bcrypt = require('bcrypt');
const _ = require('underscore');
const Crew = require('../models/crew');
const app = express();
const { verificaToken, verificaAdmin_Role } = require('../middleware/auth');



////////////////////////////////////////////////////
///////// GET //////////////////////////////////////

app.get('/crew', verificaToken, function(req, res) {

    let inicio = req.query.inicio || 0;
    let fin = req.query.fin || 1000;
    inicio = Number(inicio);
    fin = Number(fin);

    Crew.find({ act: true }) ///  objj. especifican condiciones ei. activos , segundo parametro string nombre los campos q se muestran
        .skip(inicio)
        .limit(fin)
        .exec((err, crews) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            Crew.count({ act: true /*  misma condicion que en find */ }, (err, conteo) => {

                res.json({
                    ok: true,
                    data: crews,
                    cuantos: conteo
                });

            });
        });
});



////////////////////////////////////////////////////////
/////// POST //////////////////////////////////////////

app.post('/crew', [verificaToken, verificaAdmin_Role], function(req, res) {

    let body = req.body;

    let crew = new Crew({

        act: body.act || true,
        name: body.name,
        lastname: body.lastname,
        email: body.email,
        img: body.img,
        date: body.date,
        social: body.social,
        roles: body.roles,
        links: body.link


    });

    crew.save((err, crewDB) => {

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
            newData: crewDB
        });

    });

});



////////////////////////////////////////
/////// PUT ////////////////////////////
app.put('/crew/:id', [verificaToken, verificaAdmin_Role], function(req, res) {

    let id = req.params.id;

    let body = _.pick(req.body, ['name', 'lastname', 'email', 'img', 'date', 'social', 'roles', 'links']);

    //let body = _.pick(req.body, ['act', 'title', 'description', 'texto', 'img', 'date', 'place', 'location', 'codigoPLus', 'access', 'category', 'links', 'crew']);
    /* para filtrar la entrada de parametros podemos usar el underscore.pick que filtra el objeto
    o bien utilizar deletes: delete.body.password (elimina en caso de que existiera). */

    Crew.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, crewDB) => {


        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        if (!crewDB) {
            return res.status(400).json({
                ok: false,
                err: 'no existe un tripulante con ese ID'
            });
        }



        res.json({
            ok: true,
            updatedData: crewDB // datos del usuario modificado
        });

    });

});


////////////////////
/////// DELETE ////////

app.delete('/crew/:id', [verificaToken, verificaAdmin_Role], function(req, res) {

    let id = req.params.id;
    let body = _.pick(req.body, ['act']);
    // para filtrar la entrada de parametros podemos usar el underscore.pick que filtra el objeto
    // o bien utilizar deletes: delete.body.password (elimina en caso de que existiera). 

    Crew.findByIdAndUpdate(id, body, { new: true }, (err, crewDB) => {


        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }


        if (!req.body.act) {
            return res.status(400).json({
                ok: true,
                err: {
                    message: `no ha definido un nuevo estado`
                }
            });
        }


        res.json({
            ok: true,
            changeTo: req.body.act,
            updatedData: crewDB
        });


    });

});




module.exports = app;