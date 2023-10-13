const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(cors());

//Importing database
const sequelize = require("./backend/util/database");

//Importing routes
const signupRoutes = require("./backend/routes/signUpRoute");
const loginRoutes = require("./backend/routes/loginRoute");
const ExpenseRoutes = require("./backend/routes/ExpenseRoute");
const forgotpassRoutes = require("./backend/routes/forgotpassRoute");

//Importing Models
const userModel = require("./backend/models/userModel");
const expenseModel = require("./backend/models/expenseModel");
const orderModel = require("./backend/models/orderModel");
// const forgotpassModel = require("./backend/models/forgotpassModel");

//using bodyparser and path
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// app.use(express.static(path.join(__dirname, "public")));

// serve your css as static
console.log(__dirname);
// app.use(express.static(__dirname + './frontend'));
//Using routes
app.use(signupRoutes);
app.use(loginRoutes);
app.use(ExpenseRoutes);
app.use(forgotpassRoutes);

//Creating Relations Between Tables
userModel.hasMany(expenseModel);
expenseModel.belongsTo(userModel);

userModel.hasMany(orderModel);
orderModel.belongsTo(userModel);

// userModel.hasMany(forgotpassModel);
// forgotpassModel.belongsTo(userModel);

//It syncs our data models to the database by creating appropriate tables & relations.
sequelize
  .sync()
  .then((result) => {
    app.listen(3000, () => {
      console.log("server running");
    });
  }) //create a new user at the app start if no user exists.
  .catch((err) => {
    console.log(err);
  });

// .sync({ force: true })
