import mongoose from "mongoose";

const url = 'mongodb+srv://karen123:karen123@cluster0.yaxtqh3.mongodb.net/test';
// const url = 'mongodb://localhost:27017/test'
const connectDB = async () => {
    try {
        await mongoose.connect(url,  {
            // useFindAndModify: false,
            // useNewUrlParser: true,
            // useUnifiedTopology: true,
            writeConcern: {
                w: 'majority',
                j: true,
                wtimeout: 1000
            },
            // otras opciones...
        });
        console.log('Conexión exitosa con MongoDB');
    } catch (error) {
        console.error('Error al conectar con MongoDB:', error);
    }
};

// Conexion bases de datooos

export default connectDB;