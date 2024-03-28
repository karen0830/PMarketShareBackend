import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
    },
    profileImage: {
        type: String, // Puedes usar String para almacenar la URL de la imagen
        default: '/default-profile-image.jpg' // Opcional: una imagen predeterminada si no se proporciona una URL
    },
    rutaImagen: {
        type: String, // Puedes usar String para almacenar la URL de la imagen
        default: '/default-profile-image.jpg' // Opcional: una imagen predeterminada si no se proporciona una URL
    },
    stories: {
        type: [mongoose.Schema.Types.Mixed], // Un array de objetos genéricos
        default: []
    },
    archivedStory: {
        type: [mongoose.Schema.Types.Mixed], // Un array de objetos genéricos
        default: []
    },
    shares: {
        type: [mongoose.Schema.Types.Mixed], // Un array de objetos genéricos
        default: []
    },
    products: {
        type: [mongoose.Schema.Types.Mixed], // Un array de objetos genéricos
        default: []
    },
    followers: {
        type: [mongoose.Schema.Types.Mixed], // Un array de objetos genéricos
        default: []
    },
    hashedID: {
        type: String
    },
    messages: {
        type: [mongoose.Schema.Types.Mixed],
        default: []
    },
    token: {
        type: [mongoose.Schema.Types.Mixed], // Puedes usar String para almacenar la URL de la imagen
        required: true,
        trim: true
    }
}, {
    timestamps: true
})

export default mongoose.model('User', userSchema)