const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();

app.use(fileUpload());






app.post('/upload', function(req, res) {



    // tamaño maximo permitido
    const maxSize = 700000;
    const folder = req.body.folder; // carpeta para construir lka ruta

    // verificacion de la existencia de archivo
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: "No se ha selecionado ningun archivo"
            }
        });
    }

    // capturamos el archivo
    let sampleFile = req.files.inputFile; // inputfile corresponde con el name del input
    // console.log(sampleFile);



    // validacion de las extensiones
    let extensiones = ['image/png', 'image/jpg', 'image/gif', 'image/jpeg'];
    if (extensiones.indexOf(sampleFile.mimetype) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: `El tipo de archivo ${sampleFile.mimetype} no esta permitido, extensiones permitidas:` + extensiones
            }
        });
    }

    // validacion del tamaño de archivo
    if (sampleFile.size > maxSize) {

        return res.status(400).json({
            ok: false,
            err: {
                message: `El tamaño de la imagen excede el maximo permitido de ${maxSize}`
            }
        });
    }


    // subida del archivo
    sampleFile.mv(`uploads/${sampleFile.name}`, function(err) {
        if (err)
            return res.status(500).json({
                ok: false,
                err: {
                    err
                }
            });

        res.json({
            ok: true,
            message: 'imagen suvida correctamente',
            nombre: sampleFile.name,

        });
    });


});



module.exports = app;