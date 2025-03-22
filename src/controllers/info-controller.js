const { StatusCodes } = require("http-status-codes");
const { prisma } = require("../config");

const info = (req, res) => {


  
  return res.status(StatusCodes.OK).json({
    success: true,
    message: "API is live",
    error: {},
    data: {},
  });
};

module.exports = {
  info,
};
