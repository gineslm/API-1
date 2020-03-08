const express = require('express');
const bcrypt = require('bcrypt');
const _ = require('underscore');
const Event = require('../models/event');
const app = express();
const { verificaToken, verificaAdmin_Role } = require('../middleware/auth');



////////////////////////////////////////////////////
///////// GET //////////////////////////////////////

app.get('/event', verificaToken, function(req, res) {

    let inicio = req.query.inicio || 0;
    let fin = req.query.fin || 1000;
    inicio = Number(inicio);
    fin = Number(fin);

    Event.find({ act: true }) ///  objj. especifican condiciones ei. activos , segundo parametro string nombre los campos q se muestran
        .skip(inicio)
        .limit(fin)
        .exec((err, events) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            Event.count({ act: true /*  misma condicion que en find */ }, (err, conteo) => {

                res.json({
                    ok: true,
                    data: events,
                    cuantos: conteo
                });

            });
        });
});



////////////////////////////////////////////////////////
/////// POST //////////////////////////////////////////

app.post('/event', [verificaToken, verificaAdmin_Role], function(req, res) {

    let body = req.body;

    let event = new Event({

        act: body.act || true,
        title: body.title,
        description: body.description,
        text: body.text,
        img: body.img || [],
        date: body.date,
        place: body.place,
        location: body.location,
        codigoPlus: body.codigoPlus,
        access: body.access,
        category: body.category,
        links: body.links,
        crew: body.crew


    });

    event.save((err, eventDB) => {

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
            newData: eventDB
        });

    });

});



////////////////////////////////////////
/////// PUT ////////////////////////////
app.put('/event/:id', [verificaToken, verificaAdmin_Role], function(req, res) {

    let id = req.params.id;

    let body = _.pick(req.body, ['title', 'description', 'text', 'img', 'date', 'place', 'location', 'codigoplus', 'access', 'category', 'links', 'crew']);

    //let body = _.pick(req.body, ['act', 'title', 'description', 'texto', 'img', 'date', 'place', 'location', 'codigoPLus', 'access', 'category', 'links', 'crew']);
    /* para filtrar la entrada de parametros podemos usar el underscore.pick que filtra el objeto
    o bien utilizar deletes: delete.body.password (elimina en caso de que existiera). */

    Event.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, eventDB) => {


        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        if (!eventDB) {
            return res.status(400).json({
                ok: false,
                err: 'no existe evento con ese ID'
            });
        }



        res.json({
            ok: true,

            updatedData: eventDB // datos del usuario modificado

        });

    });

});


////////////////////
/////// DELETE ////////

app.delete('/event/:id', [verificaToken, verificaAdmin_Role], function(req, res) {

    let id = req.params.id;
    let body = _.pick(req.body, ['act']);
    // para filtrar la entrada de parametros podemos usar el underscore.pick que filtra el objeto
    // o bien utilizar deletes: delete.body.password (elimina en caso de que existiera). 

    Event.findByIdAndUpdate(id, body, { new: true }, (err, eventDB) => {


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
            updatedData: eventDB
        });


    });

});



module.exports = app;