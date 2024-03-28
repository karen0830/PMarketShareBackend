import express from 'express';
import path from 'path';
import multer from 'multer';

const app = express();

export const storage = multer.diskStorage({
  destination: 'src/IA/deteccion-de-objetos/images/',
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name  = file.fieldname + '-' + uniqueSuffix + ext
    cb(null, name);
    req.nameFile = name;
  }
});

export const upload = multer({ storage });
