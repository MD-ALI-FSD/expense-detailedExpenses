const forgotpassModel = require("../models/forgotpassModel");
const path = require('path');
const bcrypt = require("bcrypt");
// const bcrypt = require("bcryptjs");
const userModel = require("../models/userModel");
const sequelize = require("../util/database");
const { CLIENT_RENEG_LIMIT } = require("tls");

const express = require("express");
const app = express();
// exports.postVerifyRequest = async (req, res) => {
//   const reqId = req.params.reqId;
//   console.log("inside verify back");
//   console.log(reqId)

//   // Send the HTML file as a response
//   // res.sendFile(path.join(__dirname, "../", "../", "frontend", "updatePassword.html"));
//   // res.redirect("/frontend/updatePassword.html");
  // res.redirect('http://localhost:5500/frontend/updatePassword.html');
//   // res.sendFile(path.join(process.cwd(), "frontend", "updatePassword.html"));
// }

/*********************************************************/
//send HTML 
/*********************************************************/
exports.postVerifyRequest = async (req, res, next) => {
  try {
    console.log("inside verify html");
    console.log(req.params.uniqueId);
    
    // const FPR = await forgotpassModel.findOne({
    //   where: { id: req.params.uniqueId },
    // });
    // if (!FPR)
    //   return res.status(400).json({ success: false, message: "invalid link" });
    // express.static(path.join(__dirname, "../", "../", "frontend", "updatePassword.html"));
      // res.sendFile(path.join(__dirname, "../", "../", "frontend", "updatePassword.html"));
    
     return res.status(200).send(`<!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Create New Password</title>
      
          <link
            href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css"
            rel="stylesheet"
          />
        </head>
        <body>
          <h1
            id="pageTitle"
            class="text-center fs-2 mb-4 p-2 bg-dark text-white pb-3"
          >
            Create New Password
          </h1>
          <div
            id="forgotPassDiv"
            class="container d-flex p-4 pb-0"
            style="max-width: 650px"
          >
            <!-- LOGIN FORM -->
            <div
              id="loginDiv"
              class="form-control p-3 px-4"
              style="background: #f2f2f2"
            >
              <form id="resetPasswordNow">
                <label class="form-label mt-2 mb-1" for="password">Password:</label>
                <input
                  required
                  class="form-control"
                  type="password"
                  name="password"
                  id="password"
                />
      
                <label class="form-label mt-2 mb-1" for="confirmPassword"
                  >Confirm Password:</label
                >
                <input
                  required
                  class="form-control"
                  type="password"
                  name="confirmPassword"
                  id="confirmPassword"
                />
      
                <input type="submit" value="SEND" class="btn btn-success mt-3" />
              </form>
            </div>
            <!-- FORGOT PASSWORD FORM -->
          </div>
      
          <div class="container d-flex flex-column p-4 pb-0" style="max-width: 650px">
            <p id="msg" class="p-1 px-2" style="display: none">p</p>
            <p id="loginNow" style="display: none">
              You can
              <a
                style="font-weight: bold"
                href="http://localhost:3000/login/login.html"
                >Login Now</a
              >
              with the new password.
            </p>
          </div>
      
          <script>
            document
              .getElementById("resetPasswordNow")
              .addEventListener("submit", async (e) => {
                e.preventDefault();
                const pass = document.getElementById("password");
                const confirmPass = document.getElementById("confirmPassword");
                if (pass.value !== confirmPass.value) {
                  alert("MisMatched Passwords!");
                  pass.value = "";
                  confirmPass.value = "";
                } else {
                  try {
                    const response = await axios.post(
                      "http://localhost:3000/password/resetpassword/${req.params.uniqueId}",
                      { pass: pass.value, confirmPass: confirmPass.value }
                    );
      
                    alert(response.data.message);
                    pass.value = "";
                    confirmPass.value = "";
                    document.getElementById("loginNow").style.display = "block";
                  } catch (error) {
                    alert(error.response.data.message);
                    pass.value = "";
                    confirmPass.value = "";
                    console.log(error.response.data.message);
                  }
                }
              });
          </script>
          <script src="https://cdnjs.cloudflare.com/ajax/libs/axios/1.4.0/axios.min.js"></script>
        </body>
      </html>`);
  } catch (error) {
    console.error(error);
  }
};

/*********************************************************/
//create New Password
/*********************************************************/
exports.PostCreateNewPassword = async (req, res, next) => {
  console.log("inside update password");
  const  idd  = req.params.uniqueId;
  console.log("idd: " + idd);
  // console.log("Request URL: " + req.originalUrl);
  
  const { pass, confirmPass } = req.body;

  if (pass !== confirmPass)
    return res
      .status(400)
      .json({ success: false, message: "MisMatched Passwords!" });

  const t = await sequelize.transaction();
  try {
    const FPR = await forgotpassModel.findOne(
      { where: { id: idd } },
      { transaction: t }
    );

    if (!FPR.isactive) {
      await t.commit();
      return res.status(400).json({
        success: false,
        message: "Link Expired! Go back and generate a New Link",
      });
    }

    const hashedPassword = bcrypt.hashSync(pass, 10);
   

    const updatedFPR = forgotpassModel.update(
      { isactive: false },
      { where: { id: idd } },
      { transaction: t }
    );
    const updatedUser = userModel.update(
      { password: hashedPassword },
      { where: { id: FPR.userid } },
      { transaction: t }
    );

    await Promise.all([updatedFPR, updatedUser]);
    await t.commit();
    res
      .status(200)
      .json({ success: true, message: "Password Updated Successfully" });
  } catch (error) {
    t.rollback();
    console.log(error);
  }
};