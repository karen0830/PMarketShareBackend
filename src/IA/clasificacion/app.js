import API_KEY_GEMINI from "../config.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(API_KEY_GEMINI);
async function malasPalabras(frase) {
  try {
    let prompt = `Por favor, evalúa si el siguiente comentario sobre un producto es relevante y cumple con las normas de conducta, sin utilizar lenguaje ofensivo en ningún idioma. Verifica si el comentario se centra en la calidad, experiencia o características del producto, ya sea de manera positiva o negativa, independientemente del idioma en que esté escrito. 

    El comentario a evaluar es: ‘${frase}’. Si el comentario es apropiado, relevante y se centra en el producto, ya sea de manera positiva o negativa, y cumple con las normas de conducta, devuelve ‘true’. Si el comentario es irrelevante, no proporciona información útil sobre el producto, no se centra en la calidad, experiencia o características del mismo, o contiene lenguaje ofensivo en cualquier idioma, devuelve ‘false’ y el porque.
    `;
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    console.log(text, " text");
    const resultBoolean = text.trim().toLowerCase() === 'true';
    return resultBoolean;
  } catch (error) {
    // Otro tipo de error
    console.error("Error en la búsqueda de malas palabras:", error);
    // Manejar el error y devolver un resultado adecuado
    // En este caso, podrías retornar true para indicar que el comentario no es adecuado
    return false;
  }
}


export async function classify_text(frase, req) {
  try {
    const resultBoolean = await malasPalabras(frase);
    req.malasPalabras = resultBoolean;
    req.Token = req.Token;
  } catch (error) {
    req.malasPalabras = false
    return error
  }
}

let frase = "eres un"
