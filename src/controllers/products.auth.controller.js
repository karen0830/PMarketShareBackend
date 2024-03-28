import { adminApp } from "../firebase.js";
import { ref, getStorage, deleteObject } from "firebase/storage";
import { IncomingForm } from "formidable";
import fs from "fs";
import User from "../models/user.models.js";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import mongoose from 'mongoose'
import CompanyModel from "../models/company.models.js";
import connection from "../dbMysql.js";
import { eliminarProducto, getAllProducts, getCategoryAll, getIdP, typeCategory, updateProducts } from "../storedProcedures/storedProcedures.js";
import { addPublications } from "./company.auth.controller.js";

export const addProduct = async (req, res) => {
    const form = new IncomingForm(); // Changed this line
    form.parse(req, (err, fields, files) => {
        // "category": "Men's Sneaker",
        // "name": "ULTRABOOST 22 SHOES",
        // "seller": "Addidas",
        // "price": 420,
        // "stock": 20,
        // "ratings": 4,
        // "ratingsCount": 3725,
        // "img": "https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/fbaf991a78bc4896a3e9ad7800abcec6_9366/Ultraboost_22_Shoes_Black_GZ0127_01_standard.jpg",
        // "shipping": 1,
        // "quantity": 0
        const category = fields.category[0];
        const stock = fields.stock[0];
        const description = fields.description[0];
        const price = fields.price[0];
        const nameProduct = fields.nameProduct[0];
        const img = fields.img[0];
        console.log("fields ", fields);
        console.log(nameProduct, " ", description, " ", price);
        const bucket = adminApp
            .storage()
            .bucket("gs://marketshare-c5720.appspot.com");
        if (err) {
            console.error("Error al procesar el formulario:", err);
            res.status(500).send("Error al procesar el formulario");
            return;
        }

        const archivo = files.product; // Asegúrate de que el nombre coincida con el campo de tu formulario
        if (!archivo) {
            res.status(400).send("No se ha subido ningún archivo");
            return;
        }
        console.log(archivo[0]);
        const storagePath = "products/" + archivo[0].newFilename + archivo[0].originalFilename; // Ruta en Firebase Storage donde se guardará el archivo
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
                    console.log("header", req.headers);

                    if (!authorizationHeader) {
                        return res.status(401).json({ message: "Unauthorized 1" });
                    }

                    const token = authorizationHeader.split(' ')[1]; // Obtén solo el token, omitiendo 'Bearer'
                    // const token = req.cookies.token;
                    console.log(token);
                    const decodedToken = jwt.decode(token);

                    if (token === 'null') return res.status(401).json({ message: "Unauthorized" });

                    const result = async () => {
                        const id = decodedToken.id;
                        const userFound = await CompanyModel.findOne({ _id: id });
                        console.log(userFound);
                        try {
                            await CompanyModel.updateOne(
                                { _id: decodedToken.id },
                                {
                                    $push: {
                                        products: {
                                            type: "img",
                                            url: img,
                                            nameProduct: nameProduct,
                                            description: description,
                                            category: category,
                                            price: price,
                                            stock: stock
                                        },
                                    },
                                }
                            );
                            console.log("Nuevo campo agregado correctamente:", result);
                        } catch (err) {
                            console.error("Error al agregar el nuevo campo:", err);
                        }
                    }

                    result();

                    let id = decodedToken.id;
                    const userFoundM = async () => {
                        const userFound = await CompanyModel.findOne({ _id: id });

                        return res.json({
                            products: userFound.products
                        });
                    };

                    userFoundM();
                }
            });
        });
        localReadStream.pipe(stream);
    });
};

export const getAllProductCompany = async (req, res) => {
    try {
        const response = await getAllProducts();
        for(let data = 0; data < response.length; data++){
            const category = await typeCategory(response[data].idCategory)
            console.log(category);
            console.log(response[data]);
            response[data].nameCategory = category[0].nameCategory
        }
        // console.log("response", response);
        return res.json({
            products: response
        })
    } catch (error) {
        console.log(error);
    }
}

export const updateProduct = async (req, res) => {
    try {
        const result = req.body;
        console.log(result);
        const response = await updateProducts(result.id, result.name, result.quantity, result.description, result.seller, result.ratings, result.ratingsCount, result.shipping, result.quantity, result.images[0].url, result.idCompany, result.idCategory, result.sku, result.width, result.height, result.depth, result.weight, 5, result.active,  result.priceTaxExcl, result.priceTaxIncl, result.taxRate, result.comparedPrice)
        console.log(response);
        if (result.images[0].url || result.description) {
            await CompanyModel.findOneAndUpdate(
                {
                    userNameCompany: userName,
                    "publications.url": result.images[0].url,
                },
                {
                    $push: {
                        "publications.$": {
                            url: result.images[0].url,
                            contenido: result.description
                        },
                    },
                },
                { new: true }
            );
        }
        console.log("jeje");
        res.json(result);
    } catch (error) {
        console.log(error);
    }
}

export const getAllCategory = async (req, res) => {
    try {
        const response = await getCategoryAll();
        res.json(response);
    } catch (error) {
        console.log(error);
    }
}

export const deleteProduct = async (req, res) => {
    try {
        const {id} = req.body;
        const resolve = await eliminarProducto(id)
        console.log(id);
        res.json("ok")
    } catch (error) {
        console.log(error);
    }
}

export const getIdProduct = async (req, res) => {
    try {
        const {id} = req.body;
        const response = await getIdP(id);
        // console.log("response", response);
        return res.json(response[0])
    } catch (error) {
        console.log(error);
    }
}