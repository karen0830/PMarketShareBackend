import API_KEY_GEMINI from "../config.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";


const genAI = new GoogleGenerativeAI(API_KEY_GEMINI);

function fileToGenerativePart(path, mimeType) {
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(path)).toString("base64"),
      mimeType
    },
  };
}

export async function run(url, category) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });
    let objeto = category;
    let prompt = `Responde con true minuscula o con false minuscula en caso de que se encuentre o no se encuentre el objeto por el que te preguntan. ¿En la imagen hay productos o un producto?`;
    const imageParts = [
      fileToGenerativePart(url, "image/jpeg")
    ];

    const result = await model.generateContent([prompt, ...imageParts]);
    const response = await result.response;
    const text = await response.text();
    // Convertir el texto a un booleano
    const resultBoolean = text.trim().toLowerCase() === 'true';
    console.log("booleano", resultBoolean); // Salida: true o false según el texto devuelto
    console.log("IA", text);
    return resultBoolean;
  } catch (error) {
    // Si ocurre un error al utilizar la inteligencia artificial, manejar el error aquí
      // Si ocurre un error diferente, manejarlo aquí
      // Manejar el error y devolver un mensaje de error adecuado
      console.error("Error en la inteligencia artificial:", error);
      return "Error en la inteligencia artificial: La imagen es terrible o la IA falló al analizarla.";
  }
}
