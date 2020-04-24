const express = require('express');
const _ = require('underscore');
const Content = require('../models/content');
const app = express();
const { verificaToken, verificaAdmin_Role } = require('../middleware/auth');



////////////////////////////////////////////////////
///////// GET //////////////////////////////////////

app.get('/content', function(req, res) {

    let inicio = req.query.inicio || 0;
    let fin = req.query.fin || 1000;
    inicio = Number(inicio);
    fin = Number(fin);

    Content.find({}) ///  objj. especifican condiciones ei. activos , segundo parametro string nombre los campos q se muestran
        .skip(inicio)
        .limit(fin)
        .exec((err, contents) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            Content.countDocuments({ act: true /*  misma condicion que en find */ }, (err, conteo) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        err: 'error al contar elementos de la BBDD content'
                    });
                }

                res.status(200).json({
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
        descripcion: body.descripcion,
        clase: body.clase,
        estilo: body.estilo,
        text: body.text,
        img: body.img,
        media: body.media,
        link: body.link,
        autor: body.autor


    });

    content.save((err, contentDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!contentDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.status(201).json({
            ok: true,
            newData: contentDB
        });

    });

});



////////////////////////////////////////
/////// PUT ////////////////////////////
app.put('/content/:id', [verificaToken, verificaAdmin_Role], function(req, res) {

    let id = req.params.id;

    let body = _.pick(req.body, ['text', 'img', 'media', 'link', 'autor']);

    //let body = _.pick(req.body, ['act', 'title', 'description', 'texto', 'img', 'date', 'place', 'location', 'codigoPLus', 'access', 'category', 'links', 'crew']);
    /* para filtrar la entrada de parametros podemos usar el underscore.pick que filtra el objeto
    o bien utilizar deletes: delete.body.password (elimina en caso de que existiera). */

    Content.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, contentDB) => {


        if (err) {
            return res.status(500).json({
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



        res.status(200).json({
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
            return res.status(500).json({
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

        if (!contentDB) {
            return res.status(400).json({
                ok: false,
                err: 'no existe contenido con ese ID'
            });
        }

        res.status(200).json({
            ok: true,
            changeTo: req.body.act,
            updatedData: contentDB
        });


    });

});



/////////////////////
////// DELETE KILL ///////

app.delete('/content/kill/:id', [verificaToken, verificaAdmin_Role], function(req, res) {

    let id = req.params.id;

    // eliminacion permanentes de la tabla
    Content.findByIdAndRemove(id, (err, contentDelete) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }



        if (!contentDelete) {
            return res.status(400).json({
                ok: true,
                err: {
                    message: `no existe ningun content con el id ${id}`
                }
            });
        } else {
            res.status(200).json({
                ok: true,
                myUser: req.myUser,
                'contentDelete': contentDelete
            });
        }


    });

});

module.exports = app;