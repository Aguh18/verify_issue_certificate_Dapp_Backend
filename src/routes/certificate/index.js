const express = require("express");
const multer = require('multer');

const { InfoController, CertifcateController } = require("../../controllers");
const { authMiddleware } = require("../../middlewares");
const router = express.Router();


const upload = multer();

router.post("/generate", upload.none(), authMiddleware, CertifcateController.issueCertificate);
router.post("/verify", authMiddleware, CertifcateController.verifyCertificate);


module.exports = router;
