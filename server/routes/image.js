const express = require('express');
const _ = require('underscore');
const Image = require('../models/image');
const fileUpload = require('express-fileupload');
const app = express();
const { verificaToken, verificaAdmin_Role } = require('../middleware/auth');
const fs = require('fs'); // filesistem -> utiliza en la eliminacion de archivos
const path = require('path'); // trabajar con rutas  -> utiliza en la eliminacion de archivos


app.use(fileUpload());


const maxSize = 7000000; /// tañaño maximo de archivos
const pathFolder = path.resolve(__dirname, `../../`);



////////////////////////////////////////////////////
///////// GET //////////////////////////////////////

app.get('/image', function(req, res) {

    let inicio = req.query.inicio || 0;
    let fin = req.query.fin || 1000;
    inicio = Number(inicio);
    fin = Number(fin);

    Image.find({}) ///  objj. especifican condiciones ei. activos {act: true} , segundo parametro string nombre los campos q se muestran
        .skip(inicio)
        .limit(fin)
        .exec((err, imageDB) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            Image.countDocuments({ act: true /*  misma condicion que en find */ }, (err, conteo) => {

                res.status(200).json({
                    ok: true,
                    data: imageDB,
                    cuantos: conteo
                });
            });
        });
});




////////////////////////////////////////////////////////
/////// POST //////////////////////////////////////////

app.post('/image', [verificaToken], function(req, res) {

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

    // creamos new image con request data
    if (req.body.folder === 'undefined') { req.body.folder = null; }

    let image = new Image({
        act: req.body.act || true,
        name: req.body.name,
        alt: req.body.alt,
        folder: req.body.folder,
        extension: '.' + sampleFile.name.split('.')[1]
    });



    //////////////////////////////
    // validaciones del file //

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
    // tamaño maximo permitido

    if (sampleFile.size > maxSize) {
        return res.status(400).json({
            ok: false,
            err: {
                message: `El tamaño de la imagen excede el maximo permitido de ${maxSize}`
            }
        });
    }

    //////////////////////////////
    // save image BBDD //


    try {
        uploadFile(image, sampleFile);
    } catch (error) {
        return res.status().json({
            ok: false,
            message: 'se produjo un error al guardar el archivo',
            error
        });
    }


    image.save((err, imageDB) => {
        if (err) {
            deleteFile(image);
            return res.status(500).json({
                ok: false,
                message: ' se produjo un error en saveBBDD, la imagen se elimino',
                err
            });
        }

        if (!imageDB) {
            deleteFile(image);
            return res.status(400).json({
                ok: false,
                message: 'se produjo un error en saveBBDD, la imagen se elimino',
                err
            });
        }

        res.status(201).json({
            ok: true,
            newData: imageDB
        });
    });



});








////////////////////////////////////////
/////// PUT ////////////////////////////
app.put('/image/:id', [verificaToken], function(req, res) {

    let id = req.params.id;

    let body = _.pick(req.body, ['alt', 'name', 'act']);

    Image.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, imageDB) => {


        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!imageDB) {
            return res.status(400).json({
                ok: false,
                err: 'no existe imagen con ese ID'
            });
        }

        res.status(200).json({
            ok: true,
            updatedData: imageDB // datos del usuario modificado

        });

    });

});





/////////////////////
////// DELETE KILL ///////

app.delete('/image/kill/:id', [verificaToken], function(req, res) {

    let id = req.params.id;


    // eliminacion permanentes de la tabla
    Image.findByIdAndRemove(id, (err, imageDelete) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!imageDelete) {
            return res.status(400).json({
                ok: true,
                err: {
                    message: `no existe ninguna imagen con el id ${id}`
                }
            });
        }


        try {
            deleteFile(imageDelete);
        } catch (er) {
            return res.status(400).json({
                ok: true,
                er,
                message: `no se pudo eliminar el archivo, pongase en contacto con el admin`

            });
        }

        res.status(200).json({
            ok: true,
            myUser: req.myUser,
            imageDelete,
            message: 'el archivo y la fila de ddbb han sido eliminados'
        });
    });

});



////////////////////
/////// DELETE ////////

app.delete('/image/:id', [verificaToken], function(req, res) {

    let id = req.params.id;
    let body = _.pick(req.body, ['act']);
    // para filtrar la entrada de parametros podemos usar el underscore.pick que filtra el objeto
    // o bien utilizar deletes: delete.body.password (elimina en caso de que existiera). 

    Image.findByIdAndUpdate(id, body, { new: true }, (err, imageDB) => {


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

        if (!imageDB) {
            return res.status(400).json({
                ok: true,
                err: {
                    message: `no existe ninguna imagen con el id ${id}`
                }
            });
        }

        res.status(200).json({
            ok: true,
            changeTo: req.body.act,
            updatedData: imageDB
        });


    });

});



const definePath = (image) => {

    let pathFile = pathFolder;
    // console.log('imagefolder =' + image.folder);

    if (image.folder !== null) {


        // si el file esta dentro de una carpeta añadimos esta carpeta al File

        if (!fs.existsSync(pathFolder + '/' + image.folder)) { // solo para la creacion de imagenes si no existe la carpeta se crea
            try {
                console.log('crea directorio ');
                fs.mkdirSync(pathFile + '/' + image.folder, { recursive: true });
            } catch (err) {
                console.log('no se pudo crear el directorio', err);
            }

        }
        pathFile += '/' + image.folder;
    }
    // retornamos la ruta completa con pathfolder+image.folder+image.name+image.extension
    return pathFile + '/' + image.name + image.extension;

};

const uploadFile = (image, sampleFile) => {

    let pathUpload = definePath(image);

    // subimos la imagen
    sampleFile.mv(pathUpload, function(err) {
        if (err) {
            return err;
        }
        console.log(`upload file ${image.name}`);
    });

};

const deleteFile = (image) => {

    let pathFile = definePath(image);

    if (fs.existsSync(pathFile)) {
        fs.unlinkSync(pathFile);
        console.log(`delete file ${image.name}`);
    }

};







////////////////////////////////////////////////////
///////// GET READDIR //////////////////////////////////////




app.get('/image/readDir/', [verificaToken], function(req, res) {

    const parser = require('dir-parser');
    // excludes list
    const excludes = ['.git', 'node_modules', 'dir-info.txt', 'package-lock.json'];

    try {

        parser(pathFolder, {
            excludes: excludes,
            files: true, // Default is false, If true, returns will conatins an array of all subfiles's info;
            children: true, // Default is false, If true, returns will conatins an object of all children's info;
            dirTree: false // Default is true, returns will conatins a tree of the directory;
        }).then(parsed => {


            let files = parsed.children;


            res.status(200).json({
                ok: true,
                data: files,
            });

        });

    } catch (err) {

        return res.status(500).json({
            ok: false,
            message: 'error al importar dir upload',
            err

        });
    }

});


////////////////////////////////////////////////////
///////// GET ByNAME //////////////////////////////////////



app.get('/image/name/:filename', [verificaToken], function(req, res) {

    let filename = req.params.filename;
    console.log(filename);

    Image.find({ name: filename }) ///  objj. especifican condiciones ei. activos {act: true} , segundo parametro string nombre los campos q se muestran
        .exec((err, imageDB) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.status(200).json({
                ok: true,
                data: imageDB,
            });
        });

});








module.exports = app;