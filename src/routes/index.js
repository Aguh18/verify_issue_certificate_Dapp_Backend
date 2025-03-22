const express = require("express");

const v1Routes = require("./v1");

const accoutRoutes = require("./account");

const certificateRoutes = require("./certificate");

const router = express.Router();

router.use("/account", accoutRoutes);
router.use("/v1", v1Routes);
router.use("/certificate", certificateRoutes);

module.exports = router;
