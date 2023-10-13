const express = require("express");
const router = express.Router();


//importing controllers from 'products.js' file.
const forgotController = require("../controller/forgotController");
//middleware to validate tokenised user-id received as a header in the GET request
const userAuthentication = require("../../middleware/auth");

router.get("/user/resetpassword/:uniqueId", forgotController.postVerifyRequest);

router.post("/password/resetpassword/:uniqueId", forgotController.PostCreateNewPassword);


module.exports = router;