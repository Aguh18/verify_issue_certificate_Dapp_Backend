const express = require("express");

const { InfoController, CertifcateController } = require("../../controllers");

const router = express.Router();

router.post("/create", CertifcateController.create);


module.exports = router;
