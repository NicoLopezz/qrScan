
import { Router } from 'express';
// import { fileURLToPath } from 'url';
// import path, { dirname } from 'path'; enviar archivos html
import { methods as autenthication } from "../controllers/sendMessages.js";


const router = Router();


router.post("/login", autenthication.sendMessage);

export default router;