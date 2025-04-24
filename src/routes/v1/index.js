const express = require("express");
const { authMiddleware } = require("../../middlewares");

const { InfoController } = require("../../controllers");

const router = express.Router();

router.get("/info", authMiddleware, InfoController.info);


module.exports = router;
