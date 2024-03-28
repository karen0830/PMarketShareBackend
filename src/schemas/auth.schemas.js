import {z} from "zod";

export const CompanyShema = z.object({
    userNameCompany: z.string({
        required_error: 'El nombre de usuario de la empresa es obligatorio'
    }),
    typeCompany: z.string({
        required_error: 'El tipo de empresa es obligatorio'
    }),
    phoneNumber: z.number({
        required_error: "El número de teléfono es obligatorio"
    }),
    email:  z.string({
        required_error: 'El correo electrónico es obligatorio',
    }).email({
        message: 'El correo electrónico no es válido',
    }),
    password: z.string({
        required_error: 'La contraseña es obligatoria',
    }).min(8, {
        message: 'La contraseña debe tener al menos 8 caracteres',
    }).refine((value) => {
        const hasUppercase = /[A-Z]/.test(value);
        return hasUppercase 
    }, {
        message: 'La contraseña debe contener al menos una letra mayúscula',
    }).refine((value) => {
        const hasLowercase = /[a-z]/.test(value);
        return hasLowercase
    }, {
        message: 'La contraseña debe contener al menos una letra minúscula'
    }).refine((value) => {
        const hasSpecialCharacters = /[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]/.test(value);
        return hasSpecialCharacters
    }, {
       message: 'La contraseña debe contener caracteres especiales' 
    }),
})

export const registerSchema = z.object({
    username: z.string({
        required_error: 'Username is required',
    }),
    email: z.string({
        required_error: 'Email is required',
    }).email({
        message: 'Invalid email',
    }),
    password: z.string({
        required_error: 'Password is required',
    }).min(8, {
        message: 'Password must be at least 8 characters',
    }).refine((value) => {
        const hasUppercase = /[A-Z]/.test(value);
        return hasUppercase 
    }, {
        message: 'Password must contain uppercase letter',
    }).refine((value) => {
        const hasLowercase = /[a-z]/.test(value);
        return hasLowercase
    }, {
        message: 'Password must contain lowercase letter'
    }).refine((value) => {
        const hasSpecialCharacters = /[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]/.test(value);
        return hasSpecialCharacters
    }, {
       message: 'Password must contain special characters' 
    }),
});


export const loginSchema = z.object({
    email: z.string({
        required_error: "Email is required",
    }).email({
        message: "Email is Not Valid",
    }),
    password: z.string({
        required_error: 'Password is required',
    }).min(8, {
        message: 'Password must be at least 8 characteres',
    })
})

export const loginCompanyShema = z.object({
    email: z.string({
        required_error: "Email is required",
    }),
    password: z.string({
        required_error: 'Password is required',
    })
})