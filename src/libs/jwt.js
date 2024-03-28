import { TOKEN_SECRET } from "../config.js";
import jwt from 'jsonwebtoken'
export function createAcccessToken(user) {
    return new Promise((resolve, reject) => {
        // Incluye los datos del usuario en el payload del token
        const payload = {
            id: user.id,
            email: user.email,
            name: user.username,
            // Agrega otros campos del usuario aquí
        };

        console.log(payload);

        jwt.sign(
            payload,
            TOKEN_SECRET,
            {
                expiresIn: "86400000"
            }, (err, token) => {
                if (err) reject(err)
                resolve(token)
            }
        )
    });
}


export function createAcccessTokenCompany(companyid) {
    return new Promise((resolve, reject) => {
        // Incluye los datos del usuario en el payload del token
        const payload = {
            id: companyid
            // Agrega otros campos del usuario aquí
        };

        console.log(payload);

        jwt.sign(
            payload,
            TOKEN_SECRET,
            {
                expiresIn: "86400000"
            }, (err, token) => {
                if (err) reject(err)
                resolve(token)
            }
        )
    });
}
