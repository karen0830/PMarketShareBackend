import bcrypt from "bcryptjs";
import { createAcccessToken } from "../libs/jwt.js";
import { adminApp } from "../firebase.js";
import { ref, getStorage, deleteObject } from "firebase/storage";
import { IncomingForm } from "formidable";
import fs from "fs";
import User from "../models/user.models.js";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import mongoose from 'mongoose'
import SHA256 from 'crypto-js/sha256.js';
import CompanyModel from "../models/company.models.js";
import { addShoppingCart, decrementQuantityInCart, deleteReview, getAllProductsId, getAllShoppingCart, getCategory, getReviewsIdUser, removeFromCart, sp_insert_reviews, typeCategory } from "../storedProcedures/storedProcedures.js";
import connection from "../dbMysql.js";
import { classify_text } from "../IA/clasificacion/app.js";


export const registerUser = async (req, res) => {
    const { email, username, password } = req.body;
    const userFound = await User.findOne({ email });
    const companyFound = await CompanyModel.findOne({ email });
    const companyFoundUserName = await CompanyModel.findOne({ userNameCompany: username });
    console.log(companyFoundUserName);
    if (userFound || companyFound || companyFoundUserName) {
        return res.status(400).json({ message: "Email or username in use" });
    }
    try {
        const hash = await bcrypt.hash(password, 10);
        const newUser = new User({
            username,
            email,
            password: hash,
            stories: [],
            publications: [],
            archivedStory: [],
        });

        newUser.profileImage =
            "https://firebasestorage.googleapis.com/v0/b/marketshare-c5720.appspot.com/o/ImagenDefecto%2FImagenDefecto.jpg?alt=media&token=1cc881bb-a695-4c5c-ac3d-25687f9ae6a2&_gl=1*qy0x6m*_ga*MTc3NzI1MjIwOS4xNjk2ODAzNTQw*_ga_CW55HF8NVT*MTY5ODE5NjcwNy4xOC4xLjE2OTgxOTY3MzcuMzAuMC4w";
        newUser.rutaImagen =
            "gs://marketshare-c5720.appspot.com/images/ImagenDefecto.jpg";

        const userSaved = await newUser.save();
        const token = await createAcccessToken({ id: userSaved._id });

        res.cookie("token", token);
        // Ejemplo de uso
        const userID = userSaved._id;
        const hashedID = hashString(userID);

        try {
            await User.updateOne(
                { _id: userSaved._id }, // Esto es el filtro, que selecciona el documento a actualizar basado en el _id
                {
                    $push: {
                        hashedID: hashedID // Nombre del campo donde deseas almacenar los IDs hasheados
                    },
                })
        } catch (error) {
            console.log(error);
        }
        res.json({
            id: userSaved._id,
            username: userSaved.username,
            email: userSaved.email,
            imagen: userSaved.profileImage,
            ruta: userSaved.rutaImagen,
            stories: userSaved.stories,
            publi: userSaved.archivedStories,
            publications: userSaved.publications,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


export const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const userFound = await User.findOne({ email });

        if (!userFound) {
            return res.status(400).json({ message: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, userFound.password);
        if (!isMatch) {
            return res.status(400).json({ message: "User or password incorrect" });
        }

        const token = await createAcccessToken(userFound);

        // res.cookie("token", token, {
        //     httpOnly: true, // Esto asegura que la cookie sólo se envía a través de HTTP(S), no accesible a través de JavaScript. Esto ayuda a prevenir ataques de cross-site scripting (XSS).
        //     secure: true, // Esto asegura que la cookie sólo se envía a través de HTTPS. Esto ayuda a prevenir ataques de interceptación de cookies.
        //     sameSite: 'none', // Esto puede ser 'strict', 'lax', 'none', o no establecerlo. Esto ayuda a prevenir ataques de cross-site request forgery (CSRF).
        // });

        console.log(token);
        const result = async () => {
            const userFound = await User.findOne({ email: email });
            console.log(userFound);
            try {
                await User.updateOne(
                    { email: email },
                    {
                        $push: {
                            token: token
                        },
                    }
                );
                console.log("Nuevo campo agregado correctamente:", result);
            } catch (err) {
                console.error("Error al agregar el nuevo campo:", err);
            }
        }
        result();

        const userFound1 = await User.findOne({ email: email });
        console.log(userFound1);

        res.json({
            token: token,
            username: userFound.username,
            email: userFound.email,
            profileImage: userFound.profileImage,
            stories: userFound.stories,
            shares: userFound.shares
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const logoutUser = (req, res) => {
    const token = req.Token;
    const decodedToken = jwt.decode(token);
    const id = decodedToken.id;
    const result = async () => {
        const userFound = await User.findOne({ _id: id });
        console.log(userFound);
        try {
            const updatedUser = await User.updateOne(
                { _id: id },
                {
                    $pull: {
                        token: token
                    },
                }
            );
            console.log("Token eliminado correctamente:", updatedUser);
        } catch (err) {
            console.error("Error al eliminar el token:", err);
        }
    }
    result();    
    return res.sendStatus(200);
};

export const profileUser = async (req, res) => {
    const authorizationHeader = req.headers['authorization'];
    const token = authorizationHeader.split(' ')[1]; // Obtén solo el token, omitiendo 'Bearer'
    // const token = req.cookies.token;
    console.log("Tokencito ", token);
    if (token === 'null') {
        return res.status(401).json({ message: "Unauthorized 1" });
    }
    const decodedToken = jwt.decode(token);
    console.log(decodedToken.id);
    let email = decodedToken.email;
    const userFound = await User.findOne({ email });

    if (!userFound)
        return res.status(400).json({
            message: "User not found",
        });

    res.json({
        id: userFound._id,
        username: userFound.username,
        email: userFound.email,
        imagen: userFound.profileImage,
        stories: userFound.stories,
        publications: userFound.publications,
    });
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

export const getProfileImage = async (req, res) => {
    const authorizationHeader = req.headers['authorization'];
    console.log("header", req.headers);
    const token = authorizationHeader.split(' ')[1]; // Obtén solo el token, omitiendo 'Bearer'
    // const token = req.cookies.token;
    if (token === 'null') {
        return res.status(401).json({ message: "Unauthorized 1" });
    }


    const decodedToken = jwt.decode(token);
    if (token === 'null') return res.status(401).json({ message: "Unauthorized" });
    let email = decodedToken.email;
    let user = await User.findOne({ email });
    res.json({
        profileImage: user.profileImage
    })

}


export const verifyToken = async (req, res) => {
    const authorizationHeader = req.headers['authorization'];
    console.log("header", req.headers);
    const token = authorizationHeader.split(' ')[1]; // Obtén solo el token, omitiendo 'Bearer'
    // const token = req.cookies.token;

    if (token === 'null') {
        return res.status(401).json({ message: "Unauthorized 1" });
    }


    // if (!token) return res.status(401).json({ message: "Unauthorized" });

    try {
        // Decodifica el token para obtener la información del usuario
        const decodedToken = jwt.decode(token);
        console.log(decodedToken);
        let email = decodedToken.email;
        const userFound = await User.findOne({ email });
        console.log(userFound);

        return res.json({
            id: userFound._id,
            email: userFound.email,
            tokens: token,
            stories: userFound.stories,
            imagen: userFound.profileImage,
            username: userFound.username,
            shares: userFound.shares
        });
    } catch (error) {
        console.error("Error al verificar el token:", error);
        return res.status(403).json({ message: "Invalid token" });
    }
};

export const deleteStories = async (req, res) => {
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

export const reactionLove = async (req, res) => {
    const { link, userName } = req.body;
    const authorizationHeader = req.headers['authorization'];
    console.log("header", req.headers);

    if (!authorizationHeader) {
        return res.status(401).json({ message: "Unauthorized 1" });
    }

    const token = authorizationHeader.split(' ')[1]; // Obtén solo el token, omitiendo 'Bearer'
    // const token = req.cookies.token;
    const decodedToken = jwt.decode(token);
    console.log(userName);

    if (token === 'null' || !decodedToken) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const email = decodedToken.email;
    const user = await User.findOne({ email });

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    const name = user.username;
    const imageProfile = await User.findOne({ username: name }, 'profileImage');
    console.log("imagen: ", imageProfile);
    console.log(userName);
    console.log(link);

    const document = await User.findOne({
        username: userName,
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
        await User.findOneAndUpdate(
            {
                username: userName,
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
        await User.findOneAndUpdate(
            {
                username: userName,
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

    const publicationFound = await User.findOne(
        { username: userName, "publications.url": link },
        { "publications.$": 1 }
    );

    console.log(publicationFound.publications[0].reactions);

    return res.json({
        publications: publicationFound.publications[0]
    });
};


export const comments = async (req, res) => {
    try {
        const { comment, link, username } = req.body;
        console.log(req.body);
        await classify_text(comment, req);
        console.log("MP", req.malasPalabras);
        console.log("TOTOTOKEN", req.Token);
        if (req.malasPalabras) {
            const token = req.Token; // Obtén solo el token, omitiendo 'Bearer'
            const decodedToken = jwt.decode(token);
            let id = decodedToken.id;
            const user = await User.findOne({ _id: id });
            const userLink = await CompanyModel.findOne({ userNameCompany: username });
            console.log(userLink);
            await CompanyModel.findOneAndUpdate(
                { email: userLink.email, "publications.url": link },
                {
                    $push: {
                        "publications.$.reactions.comments": {
                            _id: new ObjectId(),
                            user: user.username,
                            comment: comment,
                            profileImage: user.profileImage
                        },
                    },
                }
            );
            const publicationFound = await CompanyModel.findOne(
                { userNameCompany: username, "publications.url": link },
                { "publications.$": 1 }
            );

            console.log(publicationFound.publications[0].reactions);

            return res.json({
                publications: publicationFound.publications[0]
            });
        } else res.status(400).json("EL comentario es inadecuado o no coincide con el producto");
    } catch (error) {
        console.log(error);
    }
};

export const deleteComment = async (req, res) => {
    try {
        const { link, username, idComment } = req.body;
        console.log(req.body);
        const token = req.Token;
        // const token = req.cookies.token;if (!token) return res.status(401).json({ message: "Unauthorized" });
        const decodedToken = jwt.decode(token);
        let email = decodedToken.email;
        const user = await User.findOne({ email });
        
        const result =  await CompanyModel.findOneAndUpdate(
            {
                userNameCompany: username,
                "publications.url": link,
                "publications.reactions.comments.user": user.username,
            },
            {
                $pull: {
                    "publications.$.reactions.comments": { _id: new ObjectId(idComment) },
                },
            }
        );

        const publicationFound = await CompanyModel.findOne(
            { userNameCompany: username, "publications.url": link },
            { "publications.$": 1 }
        );

        // console.log(publicationFound.publications[0].reactions);

        return res.json({
            publications: publicationFound.publications[0]
        });
    } catch (error) {
        console.log(error);
    }
};

// Endpoint para refrescar tokens
export const refreshToken = async (req, res) => {
    const authorizationHeader = req.headers['authorization'];
    const refreshToken = authorizationHeader.split(' ')[1]; // Obtén solo el token, omitiendo 'Bearer'
    // const token = req.cookies.token;

    if (refreshToken === 'null') {
        return res.status(401).json({ message: "Unauthorized 1" });
    }



    try {
        const currentTime = Math.floor(Date.now() / 1000);
        const decodedToken = jwt.decode(refreshToken);
        if (decodedToken.exp < currentTime) {
            console.log("El token de actualización ha expirado");
            const email = decodedToken.email;
            const user = await User.findOne({ email });

            if (!user) {
                return res.status(404).json({ message: "Usuario no encontrado" });
            }

            const newAccessToken = await createAcccessToken(user); // Generar un nuevo token de acceso
            // actualización
            res.clearCookie("token"); // Eliminar el token de actualización antiguo
            res.cookie("token", newAccessToken); // Establecer el nuevo token de acceso como cookie
            const newTokenVerify = jwt.verify(newAccessToken, TOKEN_SECRET); // Verificar el token de
            console.log(newTokenVerify);
            return res.status(200).json({ accessToken: newAccessToken }); // Enviar el nuevo token de acceso al cliente
        } else {
            return res.status(200).json({ message: "Token de actualización válido" });
        }
    } catch (error) {
        console.log(error);
        return res
            .status(403)
            .json({ message: "Error al verificar el token de actualización" });
    }
};


export const getAllPublications = async (req, res) => {
    try {
        const authorizationHeader = req.headers['authorization'];
        console.log("header", req.headers);
        const token = authorizationHeader.split(' ')[1]; // Obtén solo el token, omitiendo 'Bearer'
        // const token = req.cookies.token;
        console.log("token", token);
        const decodedToken = jwt.decode(token);
        console.log(decodedToken);
        let publications;
        // if (token === 'null') {
        publications = await CompanyModel.find({}, 'publications');
        return res.json({
            publis: publications
        })
        // } else {
        //     publications = await CompanyModel.find({ username: { $ne: decodedToken.name } }, 'publications');
        //     console.log(publications);
        //     res.json({
        //         publis: publications
        //     })
        // }
    } catch (error) {
        console.log(error);
    }
}

export const getPublications = async (req, res) => {
    const token = req.Token; // Obtén solo el token, omitiendo 'Bearer'

    // if (!token) return res.status(401).json({ message: "Unauthorized" });
    const decodedToken = jwt.decode(token);
    let id = decodedToken.id;
    let user = await User.findOne({ _id: id });
    res.json({
        publications: user.publications
    })
}

export const followPerson = async (req, res) => {
    const authorizationHeader = req.headers['authorization'];
    console.log("header", req.headers);
    const token = authorizationHeader.split(' ')[1]; // Obtén solo el token, omitiendo 'Bearer'

    if (token === 'null') {
        return res.status(401).json({ message: "Unauthorized 1" });
    }
    const { seguir } = req.body;
    if (!token) return res.status(401).json({ message: "Unauthorized" });
    res.json({
        seguir: seguir
    })
}

export const getProfile = async (req, res) => {
    const authorizationHeader = req.headers['authorization'];
    console.log("header", req.headers);
    const token = authorizationHeader.split(' ')[1]; // Obtén solo el token, omitiendo 'Bearer'

    if (token === 'null') {
        return res.status(401).json({ message: "Unauthorized 1" });
    }

    // const token = req.cookies.token;
    // if (!token) return res.status(401).json({ message: "Unauthorized" });

    // Obtén el username desde req.params o req.query dependiendo de cómo estás pasando el parámetro
    const { username } = req.body; // o req.query según sea necesario

    try {
        const userFound = await User.findOne({ username: username });
        console.log(userFound);

        if (userFound !== null) {
            res.json({
                id: userFound.hashedID,
                username: userFound.username,
                shares: userFound.shares,
                profileImage: userFound.profileImage
            });
        } else {
            return res.status(404).json({ message: "User not found" }); // Cambié el código de estado a 404 para indicar que no se encontró el usuario
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

function hashString(input) {
    return SHA256(input).toString();
}

export const postMessage = async (req, res) => {
    const authorizationHeader = req.headers['authorization'];
    console.log("header", req.headers);

    if (!authorizationHeader) {
        return res.status(401).json({ message: "Unauthorized 1" });
    }

    const token = authorizationHeader.split(' ')[1]; // Obtén solo el token, omitiendo 'Bearer'
    // const token = req.cookies.token;
    const decodedToken = jwt.decode(token);
    console.log(token);
    if (token === 'null') return res.status(401).json({ message: "Unauthorized" });
    try {
        const username = decodedToken.name;
        const { to, message } = req.body;
        console.log(req.body);

        const chatUsers = {
            "userOne": to,
            "userTwo": username
        };

        // Crea un nuevo mensaje
        const newMessage = {
            "from": username,
            "to": to,
            message: message
        };

        const { messages } = await User.findOne({ username: to }, { messages: 1 });

        let chatMessage = false;
        console.log(username);

        // ...

        for (const element of messages) {
            const chatUsersElement = element.ChatUsers;

            // Verifica si ya existe una conversación entre 'from' y 'to'
            if ((chatUsersElement.userOne === to && chatUsersElement.userTwo === username) ||
                (chatUsersElement.userOne === username && chatUsersElement.userTwo === to)) {
                chatMessage = true;

                // Asegúrate de que element.message sea un array antes de intentar agregar
                if (!Array.isArray(element.message)) {
                    element.message = [];
                }

                // Agrega el nuevo mensaje a la conversación existente
                element.message.push(newMessage);

                // Guarda los cambios en el documento de usuario
                await User.findOneAndUpdate(
                    { username: to, 'messages.ChatUsers.userOne': chatUsersElement.userOne, 'messages.ChatUsers.userTwo': chatUsersElement.userTwo },
                    {
                        $set: {
                            'messages.$.message': element.message
                        },
                    }
                );

                await User.findOneAndUpdate(
                    { username: username, 'messages.ChatUsers.userOne': chatUsersElement.userOne, 'messages.ChatUsers.userTwo': chatUsersElement.userTwo },
                    {
                        $set: {
                            'messages.$.message': element.message
                        },
                    }
                );

                break; // Puedes salir del bucle una vez que encuentras una coincidencia
            }
        }

        // ...


        // Si no hay conversación existente, crea una nueva
        if (!chatMessage) {
            const verifyUserFrom = await User.findOne({ username: from });
            const verifyUserTo = await User.findOne({ username: username });
            if (!verifyUserFrom || !verifyUserTo) return res.status(404).json({ message: "User not found" }); // Cambié el código de estado a 404 para indicar que no se encontró el usuario

            await User.findOneAndUpdate(
                { username: to },
                {
                    $push: {
                        messages: {
                            message: [newMessage],
                            ChatUsers: chatUsers
                        }
                    },
                }
            );

            await User.findOneAndUpdate(
                { username: username },
                {
                    $push: {
                        messages: {
                            message: [newMessage],
                            ChatUsers: chatUsers
                        }
                    },
                }
            );
        }

        console.log(decodedToken);
        const user = await User.findOne({ username: to });
        console.log(user);
        res.json({
            user: user
        });
    } catch (error) {
        console.error(error);
        res.status(500).json("Internal Server Error");
    }
};


export const getMessage = async (req, res) => {
    const authorizationHeader = req.headers['authorization'];
    console.log("header", req.headers);

    if (!authorizationHeader) {
        return res.status(401).json({ message: "Unauthorized 1" });
    }

    const token = authorizationHeader.split(' ')[1]; // Obtén solo el token, omitiendo 'Bearer'
    // const token = req.cookies.token;
    const decodedToken = jwt.decode(token);
    console.log(token);
    if (token === 'null') return res.status(401).json({ message: "Unauthorized" });
    try {
        const username = decodedToken.name;
        const { user } = req.body;
        console.log(req.body);

        const { messages } = await User.findOne({ username: user }, { messages: 1 });

        let chatMessage = false;
        console.log(username);

        let getMessagesUser = "";

        // ...

        for (const element of messages) {
            const chatUsersElement = element.ChatUsers;

            // Verifica si ya existe una conversación entre 'from' y 'to'
            if ((chatUsersElement.userOne === user && chatUsersElement.userTwo === username) ||
                (chatUsersElement.userOne === username && chatUsersElement.userTwo === user)) {
                chatMessage = true;

                // Asegúrate de que element.message sea un array antes de intentar agregar
                if (!Array.isArray(element.message)) {
                    element.message = [];
                }

                getMessagesUser = element;

                break; // Puedes salir del bucle una vez que encuentras una coincidencia
            }
        }
        res.json(getMessagesUser);
    } catch (error) {
        console.error(error);
        res.status(500).json("Internal Server Error");
    }
};


export const sharePublications = async (req, res) => {
    const { link, contenido } = req.body;
    const document = await CompanyModel.findOne({
        "publications.url": link
    }, { "publications.$": 1 });
    console.log(link);
    console.log(req);
    const token = req.Token;
    const decodedToken = jwt.decode(token)
    console.log(token);
    const result = async () => {
        const id = decodedToken.id;
        let userFound = await User.findOne({ _id: id });
        console.log(userFound);
        try {
            await User.updateOne(
                { _id: decodedToken.id },
                {
                    $push: {
                        shares: {
                            Publication: document.publications,
                            contenido: contenido,
                            profileImage: userFound.profileImage,
                            user: userFound.username,
                        },
                    },
                }
            );
            console.log("Nuevo campo agregado correctamente:", result);
            const id = decodedToken.id;
            userFound = await User.findOne({ _id: id });
            res.json(userFound)
        } catch (err) {
            console.error("Error al agregar el nuevo campo:", err);
        }
    }
    result();
}

export const getSharePublications = async (req, res) => {
    const token = req.Token;
    const decodedToken = jwt.decode(token)
    console.log(token);
    const id = decodedToken.id;
    let userFound = await User.findOne({ _id: id });
    res.json({
        shares: userFound.shares
    })
}

export const addShopCart = async (req, res) => {
    try {
        const { Token } = req;
        console.log(Token);
        // Verifica si se proporciona el token
        if (!Token) {
            return res.status(401).json({ error: 'No se proporcionó un token de autenticación.' });
        }

        // Decodifica el token para obtener el ID del usuario
        const decodeToken = jwt.decode(Token);

        // Verifica si el token es válido y contiene un ID de usuario
        if (!decodeToken || !decodeToken.id) {
            return res.status(401).json({ error: 'Token de autenticación inválido.' });
        }

        // Busca al usuario en la base de datos utilizando el ID obtenido del token decodificado
        const user = await User.findById(decodeToken.id);

        // Verifica si se encontró al usuario
        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado.' });
        }

        const { idProduct, quantity, size, color } = req.body;

        // Verifica si se proporciona el ID del producto y la cantidad
        if (!idProduct || !quantity) {
            return res.status(400).json({ error: 'Se requiere el ID del producto y la cantidad.' });
        }


        const objectIdString = user._id.toString();
        console.log(objectIdString);
        // Agrega el producto al carrito de compras del usuario
        const response = await addShoppingCart(objectIdString, idProduct, quantity, size, color);

        // Envía la respuesta JSON al cliente
        res.json(response);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Ha ocurrido un error interno en el servidor.' });
    }
};

export const deleteCart = async (req, res) => {
    const { cartId } = req.body;
    console.log(cartId);
    const response = await removeFromCart(cartId);
    res.json(response)
}


export const getAllShoppingCarts = async (req, res) => {
    const { Token } = req;
    console.log(Token);
    // Verifica si se proporciona el token
    if (!Token) {
        return res.status(401).json({ error: 'No se proporcionó un token de autenticación.' });
    }

    // Decodifica el token para obtener el ID del usuario
    const decodeToken = jwt.decode(Token);

    // Verifica si el token es válido y contiene un ID de usuario
    if (!decodeToken || !decodeToken.id) {
        return res.status(401).json({ error: 'Token de autenticación inválido.' });
    }
    const result = await getAllShoppingCart(decodeToken.id);
    for (const element of result) {
        try {
            const results = await new Promise((resolve, reject) => {
                connection.query('select * from Products where id = ?', [element.idProduct], (error, results) => {
                    if (error) {
                        console.error('Error al seleccionar los productos:', error);
                        reject(error);
                    } else {
                        console.log('productos seleccionados correctamente', results);
                        resolve(results);
                    }
                });
            });

            if (results.length > 0) {
                element.img = results[0].img;
                element.price = results[0].price
                element.stock = results[0].stock
            }
        } catch (error) {
            console.error('Error al ejecutar la consulta:', error);
        }
    }

    console.log(result);
    res.json(result)
}

export const decrementQuantityCart = async (req, res) => {
    try {
        const { cartItemId, quantityToRemove } = req.body
        const response = await decrementQuantityInCart(cartItemId, quantityToRemove)
        res.json(response)
    } catch (error) {
        console.log(error);
    }
}

export const getTokenSocialNetwork = async (req, res) => {
    const { id } = req.body;
    const cleanStr = id.replace(":", "").split(":")[0]; // Elimina el primer ":" y corta la cadena en el primer ":"
    console.log(cleanStr); // Resultado: "65bfeef37ae844180d35680b"

    try {
        // Buscar el usuario en la base de datos utilizando el ID proporcionado
        const userFound = await User.findOne({ _id: cleanStr });

        // Si el usuario no existe, devuelve un error
        if (!userFound) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        // Si el usuario existe, devuelve el token de la red social (o lo que corresponda)
        if (userFound.token && userFound.token.length > 0) {
            return res.json({ token: userFound.token[0] });
        } else {
            return res.status(404).json({ error: "Token no encontrado para este usuario" });
        }
    } catch (error) {
        // Si hay un error en la búsqueda del usuario, devuelve un error
        console.error("Error al obtener el token de la red social:", error);
        return res.status(500).json({ error: "Error interno del servidor" });
    }
};

export const commentsProducts = async (req, res) => {
    try {
        const { comment, start, idProduct } = req.body;
        console.log(comment, start, idProduct);
        const categoryId = await getCategory(idProduct);
        console.log(categoryId[0].name , " juyu");
        await classify_text(comment, req);
        console.log("MP", req.malasPalabras);
        if (req.malasPalabras === true) {
            const token = req.Token; // Obtén solo el token, omitiendo 'Bearer'
            const decodedToken = jwt.decode(token);
            let id = decodedToken.id;
            const result = await sp_insert_reviews(comment, id, start, idProduct);
            return res.json(result)
        } else res.status(400).json("EL comentario es inadecuado o no coincide con el producto");
    } catch (error) {
        console.log(error);
    }
};

export const getReviews = async (req, res) => {
    try {
        const { idProduct } = req.body;
        const token = req.Token; // Obtén solo el token, omitiendo 'Bearer'
        const decodedToken = jwt.decode(token);
        let id = decodedToken.id;
        const result = await getReviewsIdUser(idProduct);
        for (const element of result) {
            const user = await User.findOne({ _id: element.idUser });
            console.log(element);
            console.log(user);
            element.imgUrl = user.profileImage;
            element.name = user.username;
        }
        res.json(result);
    } catch (error) {
        console.log(error);
    }
}

export const DeleteReview = async (req, res) => {
    try {
        const { idReview } = req.body;
        const token = req.Token; // Obtén solo el token, omitiendo 'Bearer'
        const decodedToken = jwt.decode(token);
        const result = await deleteReview(idReview);
        res.json(result);
    } catch (error) {
        console.log(error);
    }
}