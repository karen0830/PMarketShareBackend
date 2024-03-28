// const express = require('express');
// const bodyParser = require('body-parser');
// const bcrypt = require('bcrypt');
// const app = express();
// const cookieParser = require("cookie-parser");
// const sessions = require('express-session');
// const mysql = require('mysql2');
// //le decimos a express que use el paquete cookie parser
// //para trabajar con cookies
// app.use(cookieParser());
// //le decimos a express que configure las sesiones con
// //llave secreta secret
// //creamos el tiempo de expiracion en milisegundos
// const timeEXp = 1000 * 60 * 60 * 24;
// app.use(sessions({
// secret: "rfghf66a76ythggi87au7td",
// saveUninitialized: true,
// cookie: { maxAge: timeEXp },
// resave: false
// }));

// // Habilitar a express para analizar y leer diferentes datos de la solicitud, por ejemplo, formularios
// app.use(bodyParser.urlencoded({ extended: true }));
// app.set('view engine', 'ejs'); // Establecer express para utilizar plantillas ejs
// app.use('/public/', express.static('./public')); // Cargar archivos estáticos desde la carpeta 'public'

// const port = 10101;

// const dbConfig = {
//   connectionLimit: 100,
//   host: 'localhost',
//   user: 'root',
//   password: 'Lopez1234',
//   database: 'karen',
//   debug: false
// };

// const pool = mysql.createPool(dbConfig);

// app.get('/inicio-sesion', (req, res) => {
//   //recogemos la cookie de sesion
//   let session = req.session;
//   //verificamos si existe la sesion llamada correo y además que no haya expirado y también que
//   //sea original, es decir, firmada por nuestro server
//   if (session.correo) {
//   return res.render('inicio-sesion', {nombres: session.nombres})//se retorna la plantilla llamada
//   //index al cliente
//   }
//   return res.render('inicio-sesion', {nombres: session.nombres})//se retorna la plantilla llamada index al
//   //cliente
//   })

// app.get('/', (req, res) => {
//   // Renderizar la plantilla llamada 'interfaz-inicio' que contiene el formulario de registro
//   res.render('interfaz-inicio');
// });

// app.post('/interfaz-inicio', (req, res) => {
//   // Obtener los valores de los campos de entrada del formulario de registro
//   let correo = req.body.correo;
//   let nombres = req.body.nombres;
//   let contrasenia = req.body.contrasenia;
//   let contra = req.body.contrasenia1;
//   const saltRounds = 11;
//   const salt = bcrypt.genSaltSync(saltRounds);
//   // Convertir la contraseña del usuario en un hash
//   const hash = bcrypt.hashSync(contrasenia, salt);
//   const hash1 = bcrypt.hashSync(contra, salt);
//   pool.query(
//     "INSERT INTO datos VALUES (?, ?, ?, ?)",
//     [nombres, correo, hash, hash1],
//     (error) => {
//       if (error) throw error;
//       // Renderizar la plantilla 'registro-exitoso' que muestra la interfaz con una alerta personalizada
//       res.send("registro exitoso")
//     }
//   );
// });

//     app.get('/interfaz-inicio', (req, res) => {
//       // Renderizar la plantilla llamada 'interfaz-inicio' que contiene el formulario de registro
//       res.render('interfaz-inicio');
//     });

//     app.post('/login', (req, res) => {
//       //se obtienen los valores de los inputs del formulario
//       //de login
//       let correo = req.body.correo;
//       let contrasenia = req.body.contrasenia;
//     pool.query("SELECT contrasenia, nombre FROM datos WHERE correo=?", [correo],
//     (error, data) => {
//       if (error) throw error;
//       //si existe un correo igual al correo que llega en el formulario de login...
//       console.log(data.length);
//       if (data.length > 0) {
//       let contraseniaEncriptada = data[0].contrasenia;
//       //si la contraseña enviada por el usuario, al comparar su hash generado,
//       //coincide con el hash guardado en la base de datos del usuario, hacemos login
//       if (bcrypt.compareSync(contrasenia, contraseniaEncriptada)) {
//       //recogemos session de la solicitud del usuario
//       let session = req.session;
//       //iniciamos sesion al usuario
//       //en este caso la llamamos correo
//       //y ella contiene el email del usuario
//       //encriptado
//       session.correo = correo;
//       //también agregamos los nombres del Usuario a la sesión
//       session.nombres = `${data[0].nombre}`
//       return res.redirect('/inicio-sesion');
//       }
//       //si la contraseña enviada por el usuario es incorrecta...
//       return  res.render("interfaz-inicio", {
//         alert: true,
//         alertTitle: "Error",
//         alertMessage: "Contraseña incorrecta",
//         alertIcon: "error",
//         showConfirmButton: true,
//         timer: false,
//         ruta: "interfaz-inicio",
//       });
//     }else if(data.length == 0){
//       //si no existe el usuario en la base de datos...
//       return  res.render("interfaz-inicio", {
//         alert: true,
//         alertTitle: "Error",
//         alertMessage: "El usuario ingresado no existe",
//         alertIcon: "error",
//         showConfirmButton: true,
//         timer: false,
//         ruta: "interfaz-inicio",
//       });
//     }
    
    
//   });
// });

// app.get('/test-cookies', (req, res) => {
//   //recogemos la cookie de sesion
//   session = req.session;
//   //verificamos si existe la sesion llamada correo y ademas que no haya expirado y también
//   //que
//   //sea original, es decir, firmada por nuestro serve
//   if (session.correo) {
//     res.send(`Usted tiene una sesión en nuestro sistema con correo:
//     ${session.correo}`);
//     } else
//     res.send('Por favor inicie sesión para acceder a esta ruta protegida')
// })

// app.get('/logout', (req, res) => {
//   //recogemos la cookie de sesion
//   let session = req.session;
//   //verificamos si existe la sesion llamada correo y ademas que no haya expirado y también
//   //que
//   //sea original, es decir, firmada por nuestro server
//   //si la sesión está iniciada la destruimos
//   if (session.correo) {
//   //la destruimos
//   req.session.destroy();
//   //redirigimos al usuario a la ruta raíz
//   return res.redirect('/interfaz-inicio');
//   } else
//   return res.send('Por favor inicie sesión')
// })

// app.listen(port, '0.0.0.0', function() {
//   console.log('Example app listening on port ' + port);
// });









