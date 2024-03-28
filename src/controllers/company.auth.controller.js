import bcrypt from "bcryptjs";
import { createAcccessTokenCompany } from "../libs/jwt.js";
import { adminApp } from "../firebase.js";
import { ref, getStorage, deleteObject } from "firebase/storage";
import { IncomingForm } from "formidable";
import fs from "fs";
import CompanyModel from "../models/company.models.js";
import User from "../models/user.models.js";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import mongoose from 'mongoose'
import SHA256 from 'crypto-js/sha256.js';
import { promisify } from "util";
import { storage, upload } from "../IA/deteccion-de-objetos/multer.js";
import { run } from "../IA/deteccion-de-objetos/app.js";
import connection from "../dbMysql.js";
import { getAllProducts, getAllProductsId, insertProduct, typeCategory, typeCategoryName } from "../storedProcedures/storedProcedures.js";
import multer from "multer";


export const registerCompany = async (req, res) => {
    const {
        userNameCompany,
        email,
        typeCompany,
        phoneNumber,
        password,
        passwordC
    } = req.body;

    try {
        // Verificar si ya existe una compañía con el mismo nombre de usuario
        const existingCompanyByUsername = await CompanyModel.findOne({ userNameCompany: userNameCompany });
        const userFound = await User.findOne({ username: userNameCompany });
        if (existingCompanyByUsername || userFound) {
            return res.status(400).json({ message: "Email or username in use." });
        }

        // Verificar si ya existe una compañía con el mismo correo electrónico
        const existingCompanyByEmail = await CompanyModel.findOne({ email });
        const existuserFound = await User.findOne({ email });
        if (existingCompanyByEmail || existuserFound) {
            return res.status(400).json({ message: "Email or username in use." });
        }

        // Hash de la contraseña
        const hash = await bcrypt.hash(password, 10);

        // Crear nueva compañía
        const newCompany = new CompanyModel({
            userNameCompany,
            email,
            typeCompany,
            phoneNumber,
            password: hash,
            profileImage: 'https://firebasestorage.googleapis.com/v0/b/marketshare-c5720.appspot.com/o/ImagenDefecto%2Fimagen_2024-01-30_210342187.png?alt=media&token=d605a2b0-61fd-4e57-9dc0-0b96efa743e2',
            rutaImage: 'gs://marketshare-c5720.appspot.com/images/ImagenDefecto%2Fimagen_2024-01-30_210342187.png'
        });

        // Guardar la nueva compañía en la base de datos
        const companySaved = await newCompany.save();

        // Respuesta exitosa
        res.json(companySaved);
    } catch (error) {
        // Manejo de errores
        res.status(500).json({ message: error.message });
    }
};

export const loginCompany = async (req, res) => {
    const { email, password } = req.body;
    console.log(req.body);
    try {
        const companyFound = await CompanyModel.findOne({ email: email });
        console.log(companyFound);
        if (!companyFound) {
            return res.status(400).json({ message: "Usuario no encontrado" });
        }

        const isMatch = await bcrypt.compare(password, companyFound.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Usuario o contraseña incorrectos" });
        }

        const tokenCompany = await createAcccessTokenCompany(companyFound._id);
        res.json({
            token: tokenCompany,
            user: companyFound
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const logoutCompany = (req, res) => {
    // res.cookie("tokenCompany", "", {
    //     expires: new Date(0),
    // });
    return res.sendStatus(200);
};

export const verifyTokenCompany = async (req, res) => {
    const token = req.Token; // Obtén solo el token, omitiendo 'Bearer'
    // const token = req.cookies.token;
    console.log(token);
    if (token === 'null') {
        return res.status(401).json({ message: "Unauthorized 1" });
    }


    // if (!token) return res.status(401).json({ message: "Unauthorized" });

    try {
        // Decodifica el token para obtener la información del usuario
        const decodedToken = jwt.decode(token);
        console.log(decodedToken);
        let id = decodedToken.id;
        const companyFound = await CompanyModel.findById({ _id: id });
        console.log(companyFound);

        return res.json(companyFound);
    } catch (error) {
        console.error("Error al verificar el token:", error);
        return res.status(403).json({ message: "Invalid token" });
    }
};



export const addPublications = async (url, contenido, token) => {
    // Obtén solo el token, omitiendo 'Bearer'
    // const token = req.cookies.token;
    console.log(token);
    const decodedToken = jwt.decode(token);
    console.log(decodedToken);
    let id = decodedToken.id;


    const result = async (url, contenido) => {
        const userFound = await CompanyModel.findOne({ _id: id });
        console.log(userFound);
        try {
            await CompanyModel.updateOne(
                { _id: decodedToken.id },
                {
                    $push: {
                        publications: {
                            type: "img",
                            url: url,
                            contenido: contenido,
                            profileImage: userFound.profileImage,
                            user: userFound.userNameCompany,
                            reactions: {
                                comments: [],
                                share: [],
                                like: [],
                            },
                        },
                    },
                }
            );
            console.log("Nuevo campo agregado correctamente:", result);
        } catch (err) {
            console.error("Error al agregar el nuevo campo:", err);
        }
    }

    result(url, contenido)

    const userFoundM = async () => {
        const userFound = await CompanyModel.findOne({ _id: id });

        return res.json({
            publications: userFound.publications.reverse(),
        });
    };

    userFoundM();
};


export const imageProfile = async (req, res) => {
    const authorizationHeader = req.headers['authorization'];
    console.log("header", req.headers);
    const token = authorizationHeader.split(' ')[1]; // Obtén solo el token, omitiendo 'Bearer'
    // const token = req.cookies.token;
    if (token === 'null') {
        return res.status(401).json({ message: "Unauthorized 1" });
    }
    console.log(token);
    console.log(req.body);
    const form = new IncomingForm(); // Changed this line
    form.parse(req, (err, fields, files) => {
        const bucket = adminApp
            .storage()
            .bucket("gs://marketshare-c5720.appspot.com");
        if (err) {
            console.error("Error al procesar el formulario:", err);
            res.status(500).send("Error al procesar el formulario");
            return;
        }

        const archivo = files.miArchivo; // Asegúrate de que el nombre coincida con el campo de tu formulario
        if (!archivo) {
            res.status(400).send("No se ha subido ningún archivo");
            return;
        }
        console.log(archivo[0])
        const storagePath = "images/" + archivo[0].newFilename + archivo[0].originalFilename; // Ruta en Firebase Storage donde se guardará el archivo
        const file = bucket.file(storagePath);
        const localReadStream = fs.createReadStream(archivo[0]._writeStream.path);
        const stream = file.createWriteStream({
            metadata: {
                contentType: archivo.type,
            },
        });

        stream.on("error", (err) => {
            console.error("Error al subir el archivo a Firebase Storage:", err);
            res.status(500).send("Error al subir el archivo a Firebase Storage");
        });

        stream.on("finish", () => {
            console.log("Archivo subido exitosamente a Firebase Storage");
            const config = {
                action: "read",
                expires: "03-01-2500",
            };
            file.getSignedUrl(config, (err, url) => {
                if (err) {
                    console.error("Error al obtener el enlace de la imagen:", err);
                    res.status(500).send("Error al obtener el enlace de la imagen");
                } else {
                    // El usuario está autenticado
                    // Puedes realizar operaciones que requieran autenticación aquí
                    const decodedToken = jwt.decode(token);
                    console.log(decodedToken.id);
                    // Continúa con el proceso de actualización del documento de usuario
                    // const userDocRef = doc(db, 'users', decodedToken.uid);

                    const storage = getStorage();
                    const getUserById = async (email) => {
                        try {
                            const user = await User.findOne({ email });
                            console.log(User);
                            return user; // Devuelve el usuario encontrado
                        } catch (err) {
                            console.error("Error al buscar el usuario por ID:", err);
                            return null; // En caso de error, devuelve null o maneja el error según tus necesidades
                        }
                    };

                    console.log(decodedToken.id);
                    getUserById(decodedToken.email)
                        .then((foundUser) => {
                            if (foundUser) {
                                console.log("Usuario encontrado:", foundUser);
                                console.log("Ruta de la imagen:", foundUser.rutaImagen);
                                updateImage(foundUser);
                            } else {
                                console.log("Usuario no encontrado o error en la búsqueda.");
                            }
                        })
                        .catch((err) => {
                            console.error("Error al buscar el usuario por ID:", err);
                        });

                    async function updateImage(userFound) {
                        const fileURL = userFound.rutaImagen;
                        // Obtén la referencia al archivo a partir de la URL
                        const imageRef = ref(storage, fileURL);
                        // Borra el archivo
                        try {
                            await deleteObject(imageRef)
                                .then(() => {
                                    console.log("Archivo eliminado exitosamente");
                                })
                                .catch((error) => {
                                    console.error("Error al eliminar el archivo:", error);
                                });
                            const result = await User.updateOne(
                                { _id: userFound._id },
                                {
                                    rutaImagen: `gs://marketshare-c5720.appspot.com/${storagePath}`,
                                    profileImage: url,
                                }
                            );
                            console.log('Campo "nombre" actualizado correctamente:', result);
                        } catch (err) {
                            console.error('Error al actualizar el campo "nombre":', err);
                        }

                        updateProfilePublications(req, res, url);

                        let email = decodedToken.email;
                        console.log(email);
                        let userFoundMongodb = await User.findOne({ email });
                        console.log("User actualiado", userFoundMongodb);
                        res.json({
                            imagen: userFoundMongodb.profileImage
                        });
                    }
                }
            });
        });

        localReadStream.pipe(stream);
    });
};

const updateProfilePublications = async (req, res, url) => {
    try {
        const authorizationHeader = req.headers['authorization'];
        console.log("header", req.headers);
        const token = authorizationHeader.split(' ')[1]; // Obtén solo el token, omitiendo 'Bearer'
        // const token = req.cookies.token;
        if (token === 'null') {
            return res.status(401).json({ message: "Unauthorized 1" });
        }
        // Busca al usuario por su ID y actualiza todas las publicaciones con la nueva profileImage
        const decodedToken = jwt.decode(token);
        await User.updateOne(
            { _id: decodedToken.id },
            { $set: { "publications.$[].profileImage": url } }
        );
        console.log('ProfileImage actualizada en todas las publicaciones del usuario');
    } catch (error) {
        console.log("Error al actualizar las publicaciones:", error);
        return res.status(500).send("Error al actualizar las publicaciones");
    }
}

export const updateProfileReactionsLove = async (req, res) => {
    try {
        const url = "hdjhfjhsdfjfhjf";
        const authorizationHeader = req.headers['authorization'];
        const token = authorizationHeader.split(' ')[1]; // Obtén solo el token, omitiendo 'Bearer'

        if (token === 'null') {
            return res.status(401).json({ message: "Unauthorized 1" });
        }

        const decodedToken = jwt.decode(token);
        const userName = decodedToken.name;

        // Busca las publicaciones de otros usuarios donde el usuario actual ha reaccionado
        const otherUserPublications = await User.find({
            "publications.reactions.like.user": userName
        });

        if (!otherUserPublications) {
            return res.status(404).json({ message: "User not found" });
        }



        console.log(otherUserPublications);
        // Actualiza la foto de perfil en las reacciones de otros usuarios
        await Promise.all(otherUserPublications.map(async (publication) => {
            publication.reactions.like.forEach(element => {
                if (element.user === userName) {
                    element.profileImage = url;
                }
            });
            await publication.save();
        }));

        console.log('Foto de perfil actualizada en las reacciones de otros usuarios');

        return res.status(200).json({ message: "Profile image updated successfully" });
    } catch (error) {
        console.log("Error al actualizar las publicaciones:", error);
        return res.status(500).send("Error al actualizar las publicaciones");
    }
}


//const path = require('path');

// Función para subir el video a Firebase Storage y obtener la URL firmada
const uploadVideoToStorage = (filePath, fileName) => {
    const bucket = adminApp.storage().bucket();

    // Subir el archivo a Firebase Storage
    return bucket.upload(filePath, {
        destination: `publications/${fileName}` // Especifica la ruta y el nombre del archivo en Firebase Storage
    })
        .then(() => {
            // Generar una URL firmada para acceder al archivo
            return bucket.file(`publications/${fileName}`).getSignedUrl({
                action: 'read',
                expires: '03-01-2500', // Fecha de expiración de la URL
            });
        })
        .then((signedUrls) => {
            // Devolver la URL firmada
            return signedUrls[0];
        })
        .catch((error) => {
            console.error('Error al subir el video a Firebase Storage:', error);
            throw error;
        });
};

// Función para procesar el formulario y subir el video a Firebase Storage
export const addPublicationsVideo = (req, res) => {
    const authorizationHeader = req.headers['authorization'];
    console.log("header", req.headers);

    if (!authorizationHeader) {
        return res.status(401).json({ message: "Unauthorized 1" });
    }

    const token = authorizationHeader.split(' ')[1]; // Obtén solo el token, omitiendo 'Bearer'
    // const token = req.cookies.token;
    if (token === 'null') return res.status(401).json({ message: "Unauthorized" });
    const decodedToken = jwt.decode(token);
    const form = new IncomingForm();

    form.parse(req, (err, fields, files) => {
        const contenido = fields.Hola[0] ? fields.Hola[0] : "";
        if (err) {
            console.error('Error al procesar el formulario:', err);
            res.status(500).send('Error al procesar el formulario');
            return;
        }
        console.log(files);
        // Obtener el nombre original del archivo de video
        console.log(files);
        const originalFileName = files.publication ? files.publication[0].newFilename + files.publication[0].originalFilename : null;
        console.log(originalFileName);
        if (!originalFileName) {
            res.status(400).send('No se ha subido ningún archivo de video');
            return;
        }

        // Renombrar el archivo para eliminar caracteres especiales
        const fileName = originalFileName.replace(/[^\w\s.-]/gi, '');

        // Obtener la ruta del archivo del campo de formulario 'video'
        const filePath = files.publication ? files.publication[0].filepath : null;
        if (!filePath) {
            res.status(400).send('No se ha subido ningún archivo de video');
            return;
        }

        // Subir el video a Firebase Storage y obtener la URL firmada
        uploadVideoToStorage(filePath, fileName)
            .then((signedUrl) => {
                // Enviar la URL firmada como respuesta
                const result = async () => {
                    const id = decodedToken.id;
                    let companyFound = await CompanyModel.findOne({ _id: id });
                    console.log(companyFound);
                    try {
                        await CompanyModel.updateOne(
                            { _id: decodedToken.id },
                            {
                                $push: {
                                    publications: {
                                        url: signedUrl,
                                        type: "video/mp4",
                                        contenido: contenido,
                                        profileImage: companyFound.profileImage,
                                        user: companyFound.userNameCompany,
                                        reactions: {
                                            comments: [],
                                            share: [],
                                            like: [],
                                        },
                                    },
                                },
                            }
                        );
                        console.log("Nuevo campo agregado correctamente:", result);
                        companyFound = await CompanyModel.findOne({ _id: id });

                        return res.json({
                            publications: companyFound.publications,
                        });
                    } catch (err) {
                        console.error("Error al agregar el nuevo campo:", err);
                        res.status(500).send("Error al agregar el nuevo campo:", err);
                    }
                }

                result();
            })
            .catch((error) => {
                // Manejar errores
                console.error('Error al subir el video a Firebase Storage:', error);
                res.status(500).send('Error al subir el video a Firebase Storage');
            });
    });
};

export const getPublicationsCompany = async (req, res) => {
    const token = req.Token; // Obtén solo el token, omitiendo 'Bearer'

    // if (!token) return res.status(401).json({ message: "Unauthorized" });
    const decodedToken = jwt.decode(token);
    let id = decodedToken.id;
    let user = await CompanyModel.findOne({ _id: id });
    res.json({
        publications: user.publications.reverse()
    })
}

export const archivedStories = async (req, res) => {
    const authorizationHeader = req.headers['authorization'];
    console.log("header", req.headers);

    if (!authorizationHeader) {
        return res.status(401).json({ message: "Unauthorized 1" });
    }

    const token = authorizationHeader.split(' ')[1]; // Obtén solo el token, omitiendo 'Bearer'
    // const token = req.cookies.token;
    const decodedToken = jwt.decode(token);
    if (token === 'null') return res.status(401).json({ message: "Unauthorized" });

    let email = decodedToken.email;
    let userFound = await User.findOne({ email });

    let stories = userFound.stories;
    console.log(stories);
    stories.forEach((element) => {
        console.log(element);
        if (element.fecha_create >= element.fecha_limit) {
            console.log("entro");
            User.updateOne(
                { _id: decodedToken.id }, // Esto es el filtro, que selecciona el documento a actualizar basado en el _id
                {
                    $push: {
                        archivedStory: {
                            url: element.url,
                        }, // Esto agrega el nuevo campo 'nuevoCampo' con el valor 'valor'
                    },
                    $pull: {
                        stories: {
                            url: element.url,
                            fecha_create: element.fecha_create,
                            fecha_limit: element.fecha_limit,
                        },
                    },
                },
                (err, result) => {
                    // Esta es la función de callback que se ejecuta después de la operación de actualización
                    if (err) {
                        console.error("Error al agregar el nuevo campo:", err);
                    } else {
                        console.log("Nuevo campo agregado correctamente:", result);
                    }
                }
            );
        } else console.log("Menor");
    });

    let user = await User.findOne({ email });
    return res.json({
        id: user._id,
        email: user.email,
        tokens: token,
        stories: user.stories,
        publi: user.archivedStories,
    });
};

export const addStories = async (req, res) => {
    const form = new IncomingForm(); // Changed this line
    form.parse(req, (err, fields, files) => {
        const bucket = adminApp
            .storage()
            .bucket("gs://marketshare-c5720.appspot.com");
        if (err) {
            console.error("Error al procesar el formulario:", err);
            res.status(500).send("Error al procesar el formulario");
            return;
        }

        const archivo = files.miArchivo; // Asegúrate de que el nombre coincida con el campo de tu formulario
        if (!archivo) {
            res.status(400).send("No se ha subido ningún archivo");
            return;
        }

        const storagePath = "stories/" + archivo[0].originalFilename; // Ruta en Firebase Storage donde se guardará el archivo
        const file = bucket.file(storagePath);
        const localReadStream = fs.createReadStream(archivo[0]._writeStream.path);
        const stream = file.createWriteStream({
            metadata: {
                contentType: archivo.type,
            },
        });

        stream.on("error", (err) => {
            console.error("Error al subir el archivo a Firebase Storage:", err);
            res.status(500).send("Error al subir el archivo a Firebase Storage");
        });

        stream.on("finish", () => {
            console.log("Archivo subido exitosamente a Firebase Storage");
            const config = {
                action: "read",
                expires: "03-01-2500",
            };
            file.getSignedUrl(config, (err, url) => {
                if (err) {
                    console.error("Error al obtener el enlace de la imagen:", err);
                    res.status(500).send("Error al obtener el enlace de la imagen");
                } else {
                    const authorizationHeader = req.headers['authorization'];
                    console.log("header", authorizationHeader);

                    if (!authorizationHeader) {
                        return res.status(401).json({ message: "Unauthorized 1" });
                    }

                    const token = authorizationHeader.split(' ')[1]; // Obtén solo el token, omitiendo 'Bearer'
                    // const token = req.cookies.token;
                    const decodedToken = jwt.decode(token);
                    if (token === 'null') return res.status(401).json({ message: "Unauthorized" });
                    const fechaActual = new Date();
                    const fechaLimite = new Date(
                        fechaActual.getTime() + 24 * 60 * 60 * 1000
                    );

                    const result = async () => {
                        const userFound = await User.findOne({ _id: decodedToken.id });
                        console.log(userFound);
                        try {
                            await CompanyModel.updateOne(
                                { _id: decodedToken.id }, // Esto es el filtro, que selecciona el documento a actualizar basado en el _id
                                {
                                    $push: {
                                        stories: {
                                            url: url,
                                            fecha_create: fechaActual,
                                            fecha_limit: fechaLimite,
                                        }, // Esto agrega el nuevo campo 'nuevoCampo' con el valor 'valor'
                                    },
                                }
                            );
                            console.log("Nuevo campo agregado correctamente:", result);
                        } catch (err) {
                            console.error("Error al agregar el nuevo campo:", err);
                        }
                    }

                    result();
                    const userFoundM = async () => {
                        console.log(decodedToken);
                        const userFound = await CompanyModel.findOne({ _id: decodedToken.id });
                        console.log(userFound);
                        return res.json({
                            id: userFound._id,
                            email: userFound.email,
                            tokens: token,
                            imagen: userFound.profileImage,
                            username: userFound.username,
                            stories: userFound.stories,
                        });
                    };

                    userFoundM();
                }
            });
        });
        localReadStream.pipe(stream);
    });
};

export const profileCompany = async (req, res) => {
    const authorizationHeader = req.headers['authorization'];
    const token = authorizationHeader.split(' ')[1]; // Obtén solo el token, omitiendo 'Bearer'
    // const token = req.cookies.token;
    console.log("Tokencito ", token);
    if (token === 'null') {
        return res.status(401).json({ message: "Unauthorized 1" });
    }
    const decodedToken = jwt.decode(token);
    console.log(decodedToken.id);
    let id = decodedToken.id;
    const userFound = await CompanyModel.findOne({ _id: id });
    console.log(userFound);

    if (!userFound)
        return res.status(400).json({
            message: "User not found",
        });

    res.json(userFound);
};

export const getAllPublicationsCompany = async (req, res) => {
    const authorizationHeader = req.headers['authorization'];
    console.log("header", req.headers);
    const token = authorizationHeader.split(' ')[1]; // Obtén solo el token, omitiendo 'Bearer'
    // const token = req.cookies.token;
    console.log("token", token);
    try {
        // const token = req.Token;
        const decodedToken = jwt.decode(token);
        let publications;
        if (token === 'null') {
            publications = await CompanyModel.find({}, 'publications');
            console.log(publications);
            return res.json({
                publis: publications
            })
        } else {
            publications = await CompanyModel.find({ _id: { $ne: decodedToken.id } }, 'publications');
            console.log(publications);
            res.json({
                publis: publications
            })
        }
    } catch (error) {
        console.log(error);
    }
}

export const reactionLoveCompany = async (req, res) => {
    const { link, userName } = req.body;
    const authorizationHeader = req.headers['authorization'];
    console.log("header", req.headers);
    const token = authorizationHeader.split(' ')[1]; // Obtén solo el token, omitiendo 'Bearer'
    // const token = req.cookies.token;
    console.log("token", token);
    const decodedToken = jwt.decode(token);
    console.log(userName);

    if (token === 'null' || !decodedToken) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const id = decodedToken.id;
    const company = await CompanyModel.findOne({ _id: id });
    const userFound = await User.findOne({ _id: id });
    if (!company && !userFound) {
        return res.status(404).json({ message: "not found" });
    }

    if (company) {
        const name = company.userNameCompany;
        const imageProfile = await CompanyModel.findOne({ userNameCompany: name }, 'profileImage');
        console.log("imagen: ", imageProfile);
        console.log(userName);
        console.log(link);

        const document = await CompanyModel.findOne({
            userNameCompany: userName,
            "publications.url": link
        }, { "publications.$": 1 });

        console.log("docu ", document);

        const publication = document.publications[0];

        let userExists = false;

        for (const element of publication.reactions.like) {
            if (element.user === name) {
                userExists = true;
                break;
            }
        }

        console.log(userExists);

        if (userExists) {
            await CompanyModel.findOneAndUpdate(
                {
                    userNameCompany: userName,
                    "publications.url": link,
                    "publications.reactions.like.user": name,
                },
                {
                    $pull: {
                        "publications.$.reactions.like": { user: name },
                    },
                }
            );
        } else {
            await CompanyModel.findOneAndUpdate(
                {
                    userNameCompany: userName,
                    "publications.url": link,
                },
                {
                    $push: {
                        "publications.$.reactions.like": {
                            imageProfile: imageProfile.profileImage,
                            user: name,
                            num: 1,
                        },
                    },
                },
                { new: true }
            );
        }

        const publicationFound = await CompanyModel.findOne(
            { userNameCompany: userName, "publications.url": link },
            { "publications.$": 1 }
        );

        console.log(publicationFound.publications[0].reactions);

        return res.json({
            publications: publicationFound.publications[0]
        });
    } else if (userFound) {
        console.log("userFound");
        const document = await CompanyModel.findOne({
            "publications.url": link
        }, { "publications.$": 1 });

        console.log("docu ", document);

        const publication = document.publications[0];

        let userExists = false;

        for (const element of publication.reactions.like) {
            if (element.user === userFound.username) {
                userExists = true;
                break;
            }
        }

        console.log(userExists);

        if (userExists) {
            await CompanyModel.findOneAndUpdate(
                {
                    "publications.url": link,
                    "publications.reactions.like.user": userFound.username,
                },
                {
                    $pull: {
                        "publications.$.reactions.like": { user: userFound.username },
                    },
                }
            );
        } else {
            await CompanyModel.findOneAndUpdate(
                {
                    "publications.url": link,
                },
                {
                    $push: {
                        "publications.$.reactions.like": {
                            imageProfile: userFound.profileImage,
                            user: userFound.username,
                            num: 1,
                        },
                    },
                },
                { new: true }
            );
        }

        const publicationFound = await CompanyModel.findOne(
            { "publications.url": link },
            { "publications.$": 1 }
        );

        console.log(publicationFound.publications[0].reactions);

        return res.json({
            publications: publicationFound.publications[0]
        });
    }
};

export const verifyProduct = async (req, res, info) => {
    try {
        //     // Ejecutar la verificación de la imagen
        if (!info.categories) {
            req.response = false;
        } else {
            if (info.categories) {
                let status = true;

                const response = await run(`./src/IA/deteccion-de-objetos/images/${req.nameFile}`, info.categories);
                console.log(response);
                if (response == false) {
                    status = false
                }

                // Verificar si la respuesta es "Sí"
                req.response = status;
                req.category = info.categories;
                req.Token = req.Token;
            } else {
                req.response = false
            }
        }
    } catch (error) {
        console.log(error);
        // return res.status(500).json("Error en la verificación de la imagen.");
    }
}

const upload2 = multer({ storage }).single('imgProduct'); // 'imgProduct' debe coincidir con el nombre del campo de entrada en tu formulario

export const addPublicationsVerify = async (req, res) => {
    try {
        upload2(req, res, async (err) => {
            if (err) {
                // Manejar errores de multer
                console.error(err);
                return res.status(400).json({ message: 'Error al cargar el archivo.' });
            }

            // Accede al archivo cargado a través de req.file
            const file = req.file;
            console.log('Archivo cargado:', file);

            // Accede a la información adicional en el cuerpo de la solicitud
            const info = JSON.parse(req.body.info);
            console.log('Información adicional:', info);

            // Realiza cualquier acción necesaria con el archivo cargado
            console.log('Nombre del archivo:', file.filename);
            req.nameFile = file.filename;
            await verifyProduct(req, res, info);
            console.log("Token", req.Token);
            if (req.response) {
                try {
                    console.log("reqq", req.file);
                    const bucket = adminApp
                        .storage()
                        .bucket("gs://marketshare-c5720.appspot.com");

                    const archivo = req.file; // Asegúrate de que el nombre coincida con el campo de tu formulario
                    console.log(archivo);
                    if (!archivo) {
                        res.status(400).send("No se ha subido ningún archivo");
                        return;
                    }

                    const storagePath = "products/" + archivo.filename; // Ruta en Firebase Storage donde se guardará el archivo
                    const filePath = archivo.path;
                    bucket.upload(filePath, {
                        destination: storagePath,
                        metadata: {
                            contentType: archivo.mimetype
                        }
                    }, (err, uploadedFile) => {
                        if (err) {
                            console.error('Error al subir el archivo:', err);
                            // Manejar el error
                        } else {
                            console.log('Archivo subido exitosamente a Firebase Storage');
                            // Obtener el enlace de descarga del archivo subido
                            uploadedFile.getSignedUrl({
                                action: 'read',
                                expires: '03-01-2500' // Definir la fecha de expiración del enlace si es necesario
                            }, (err, url) => {
                                if (err) {
                                    console.error('Error al obtener el enlace de descarga del archivo:', err);
                                    // Manejar el error

                                } else {
                                    const decodedToken = jwt.decode(req.Token);
                                    console.log(req.Token);
                                    const id = decodedToken.id;
                                    console.log(id);
                                    addPublications(url, info.description, req.Token)
                                    const result = async () => {
                                        const typeCategory = await typeCategoryName(info.categories)
                                        console.log(typeCategory);
                                        const res = await insertProduct(info.name, info.quantity, info.description, info.seller, info.ratings, info.ratingsCount, info.shipping, info.quantity, url, id, typeCategory[0].idCategory, info.sku, info.width, info.height, info.depth, info.weight, info.extraShippingFee, info.active, info.priceTaxExcl, info.priceTaxIncl, info.taxRate, info.comparedPrice);
                                        console.log(res);
                                        fs.unlink(`./src/IA/deteccion-de-objetos/images/${req.nameFile}`, (err) => {
                                            if (err) {
                                                console.error('Error al eliminar el archivo:', err);
                                            } else {
                                                console.log('Archivo eliminado correctamente');
                                            }
                                        });

                                    }
                                    result();
                                    res.json("ok")
                                }
                            });
                        }
                    });
                } catch (error) {
                    console.log(error);
                }

            } else {
                // Responder al cliente si la imagen no coincide con la categoría
                fs.unlink(`./src/IA/deteccion-de-objetos/images/${req.nameFile}`, (err) => {
                    if (err) {
                        console.error('Error al eliminar el archivo:', err);
                    } else {
                        console.log('Archivo eliminado correctamente');
                    }
                });
                return res.status(400).json("La imagen no coincide con la categoría.");
            }
        });




        // Continuar con tu lógica de negocio aquí, utilizando req.body y req.nameFile
        // Ejemplo:
        // const nuevaPublicacion = { ...info, imagen: req.nameFile };
        // Procesar la nuevaPublicacion...

        // Devolver una respuesta adecuada
    } catch (error) {
        console.log(error);
    }
};

export const productsId = async (req, res) => {
    try {
        const token = req.Token;
        const decodedToken = jwt.decode(token);
        const results = await new Promise((resolve, reject) => {
            connection.query('select * from Products where id = ?', [decodedToken.id], (error, results) => {
                if (error) {
                    console.error('Error al seleccionar los productos:', error);
                    reject(error);
                } else {
                    console.log('productos seleccionados correctamente', results);
                    resolve(results);
                }
            });
        });

        res.json()
    } catch (error) {
        console.error('Error al ejecutar la consulta:', error);
    }
}

export const getProductsId = async (req, res) => {
    try {
        const { Token } = req;
        const decodedToken = jwt.decode(Token);
        const response = await getAllProductsId(decodedToken.id);
        for (let data = 0; data < response.length; data++) {
            const category = await typeCategory(response[data].idCategory)
            console.log(category);
            response[data].nameCategory = category[0].nameCategory
        }
        console.log(response);
        res.json(response)
    } catch (error) {
        console.log(error);
    }
}