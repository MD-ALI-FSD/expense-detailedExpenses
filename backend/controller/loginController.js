//Importing "Product" model to save and retrive data from the products table in the database

const userModel = require("../models/userModel");
const forgotPassModel = require("../models/forgotpassModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Sib = require('sib-api-v3-sdk');

const { v4: uuidv4 }   = require('uuid');



/***********************************************************/
// Controller for Forgot Password
/***********************************************************/
exports.postForgotPassword = async (req, res) => {
  try{
  console.log("inside forgot pass");
  const receiverEmail = req.body.email;
  // const currUserId = req.user.id;

  // /verifying email
  const user = await userModel.findOne({ where: { email: req.body.email } });
  // If email not found
  if (!user){
    console.log("user not found");
    return res
      .status(400)
      .json({ success: false, message: "email does not Exists!" });
  }

  const uniqeId = uuidv4();
  console.log(uniqeId);
  //update table
  const FPR = await forgotPassModel.create({
    id: uniqeId,
    isactive: true,
    userid: user.id,
  });

  
  //sending email
  const defaultClient = await Sib.ApiClient.instance;
  var apiKey = await defaultClient.authentications['api-key'];
  const transEmailApi = await  new Sib.TransactionalEmailsApi();
  apiKey.apiKey= "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";
  // apiKey.apiKey= process.env.SENDINBLUE_API_KEY;

  
  const path = `http://localhost:3000/user/resetpassword/${uniqeId}`

    const sender = {
      email: 'alidj007@gmail.com',
      name: 'Ali',
    };

    const receivers = [
      {
        email: receiverEmail,
      }
    ];
  
  const sendEmail = await transEmailApi.sendTransacEmail({
      sender,
      to: receivers,
      subject: 'Forgot Password',
      textContent: `Please login to update your password`,
      htmlContent: `<a href="${path}">Click Here</a> to reset your password!`,
    });
    // const response = await transEmailApi.sendTransacEmail(emailRequest
    console.log('Email sent successfully');
    return res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    return res.status(500).json({ message: 'Error sending email' });
  }
};

/*******************************************/
//helper function to verify credentials
function isstringinvalid(string) {
  if (string == undefined || string.length === 0) {
    return true;
  } else {
    return false;
  }
}

// var token = "";
//helper function to generate tokenised user Id
function generateAccessToken(id) {
  // exports.token = generateRandomToken(32);
  // console.log(token);
  return jwt.sign({ userId: id }, "69EdyIEvGh2Dj2jlihmhOhZ9S2VwvGMb");
}
//helper function to generate token
function generateRandomToken(length) {
  const charset =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let gtoken = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    gtoken += charset[randomIndex];
  }
  return gtoken;
}

// Generate a random access token with a specific length (e.g., 32 characters)
// const accessToken = generateRandomToken(32);
// console.log(accessToken);

/***********************************************************/
//  Controller to verify User before loggin in
/***********************************************************/
exports.postVerifyUser = async (req, res, next) => {
  try {
    const uemail = req.body.email;
    const upassword = req.body.password;

    //data validation
    if (isstringinvalid(uemail) || isstringinvalid(upassword)) {
      console.log("inside verify invalidstring backend");
      return res
        .status(400)
        .json({ message: "Email id or password is missing" });
    }
    console.log(uemail, upassword);

    //data fetching from the user table and then comparing it
    const user = await userModel.findAll({ where: { email: uemail } });
    if (user.length > 0) {
      //comparing tokenised user-id with real user-id in the table
      bcrypt.compare(upassword, user[0].password, (err, result) => {
        if (err) {
          res
            .status(500)
            .json({ success: false, message: "Something went wrong" });
        }
        if (result === true) {
          console.log("inside verify response backend");
          console.log(user[0].id);
          res.status(200).json({
            success: true,
            message: "user logged in successfully",
            // dat: user[0].id, //sending tokenised user-id to the frontend
            token: generateAccessToken(user[0].id),
          });
        } else {
          return res
            .status(400)
            .json({ success: false, message: "password is incorrect" });
        }
      });
    } else {
      return res
        .status(404)
        .json({ success: false, message: "User does not exist" });
    }
  } catch (err) {
    res.status(500).json({ message: err, success: false });
  }
};

// Export the variable so it can be used in other files
// module.exports = token;


