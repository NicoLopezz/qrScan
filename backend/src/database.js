import mongoose from 'mongoose';
import config from './config.js';

(async()=> {
    const db = await mongoose.connect(config.mongodbURL)
    console.log('Database is connected to:' , db.connection.name);
    
})()


// Función para conectar a la base de datos según el localNumber
// const connectToLocalDB = async (localNumber) => {
//     console.log("dentro de la fucion conectToLocalDB ")
//     const dbName = `Local_${localNumber}`;  // Definir el nombre de la base de datos usando localNumber
//     const mongoURI = `${config.mongodbURL}/${dbName}`;  // Concatenar la base de datos a la URI base

//     try {
//         const db = await mongoose.connect(mongoURI, {
//             useNewUrlParser: true,
//             useUnifiedTopology: true,
//         });
//         console.log(`Conectado a la base de datos: ${db.connection.name}`);
//         return db;
//     } catch (error) {
//         console.error("Error al conectar a la base de datos:", error.message);
//         throw error;
//     }
// };
// export default connectToLocalDB;

// import mongoose from 'mongoose' 
// import config from './config.js'

// //using .env

