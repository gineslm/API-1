const express = require('express');
const bcrypt = require('bcrypt');
const _ = require('underscore');
const Content = require('../models/content');
const app = express();
const { verificaToken, verificaAdmin_Role } = require('../middleware/auth');



////////////////////////////////////////////////////
///////// GET //////////////////////////////////////

app.get('/content', verificaToken, function(req, res) {

    let inicio = req.query.inicio || 0;
    let fin = req.query.fin || 1000;
    inicio = Number(inicio);
    fin = Number(fin);

    Content.find({ act: true }) ///  objj. especifican condiciones ei. activos , segundo parametro string nombre los campos q se muestran
        .skip(inicio)
        .limit(fin)
        .exec((err, contents) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            Content.count({ act: true /*  misma condicion que en find */ }, (err, conteo) => {

                res.json({
                    ok: true,
                    data: contents,
                    cuantos: conteo
                });

            });
        });
});



////////////////////////////////////////////////////////
/////// POST //////////////////////////////////////////

app.post('/content', [verificaToken, verificaAdmin_Role], function(req, res) {

    let body = req.body;

    let content = new Content({

        act: body.act || true,
        destino: body.destino,
        area: body.area,
        text: body.text,
        clase: body.clase,
        img: body.img,
        link: body.link,
        autor: body.autor


    });

    content.save((err, contentDB) => {

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
            newData: contentDB
        });

    });

});



////////////////////////////////////////
/////// PUT ////////////////////////////
app.put('/content/:id', [verificaToken, verificaAdmin_Role], function(req, res) {

    let id = req.params.id;

    let body = _.pick(req.body, ['text', 'clase', 'img', 'link', 'autor']);

    //let body = _.pick(req.body, ['act', 'title', 'description', 'texto', 'img', 'date', 'place', 'location', 'codigoPLus', 'access', 'category', 'links', 'crew']);
    /* para filtrar la entrada de parametros podemos usar el underscore.pick que filtra el objeto
    o bien utilizar deletes: delete.body.password (elimina en caso de que existiera). */

    Content.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, contentDB) => {


        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        if (!contentDB) {
            return res.status(400).json({
                ok: false,
                err: 'no existe contenido con ese ID'
            });
        }



        res.json({
            ok: true,

            updatedData: contentDB // datos del usuario modificado

        });

    });

});


////////////////////
/////// DELETE ////////

app.delete('/content/:id', [verificaToken, verificaAdmin_Role], function(req, res) {

    let id = req.params.id;
    let body = _.pick(req.body, ['act']);
    // para filtrar la entrada de parametros podemos usar el underscore.pick que filtra el objeto
    // o bien utilizar deletes: delete.body.password (elimina en caso de que existiera). 

    Content.findByIdAndUpdate(id, body, { new: true }, (err, contentDB) => {


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
            updatedData: contentDB
        });


    });

});



module.exports = app;