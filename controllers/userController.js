const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");
const validator = require("../Validator/validator");

const RegisterUser = async function (req, res) {
  try{
    let data = req.body;

  if (!validator.isValidRequestBody(data)) {
    return res.status(400).send({
      status: false,
      message: " Invalid request parameters. Please provide user details.",
    });
  }

  const { title, name, phone, email, password } = data;

  if (!validator.isValid(title)) {
    return res.status(400).send({
      status: false,
      message: " Invalid request parameters. Please provide Title",
    });
  }
  if (!validator.isValidTitle(title)) {
    return res.status(400).send({
      status: false,
      message:
        " Invalid request parameters. Please provide Title as Mr or Mrs or Miss",
    });
  }
  if (!validator.isValid(name)) {
    return res.status(400).send({
      status: false,
      message: " Invalid request parameters. Please provide Name",
    });
  }
  if (!validator.isValid(phone)) {
    return res.status(400).send({
      status: false,
      message: " Invalid request parameters. Please provide Phone Number",
    });
  }
  let trimPhone = phone.trim()
  if (!/^[0-9]\d{9}$/gi.test(trimPhone)) {
    return res.status(400).send({
      status: false,
      message: "Phone should be a valid number",
    });
  }
  const phoneNumberAlreadyUsed = await userModel.findOne({ phone: trimPhone });

  if (phoneNumberAlreadyUsed) {
    return res.status(400).send({
      status: false,
      message: `${trimPhone} Phone number is already registered`,
    });
  }
  let trimEmail = email.trim()
  if (!validator.isValid(trimEmail)) {
    return res.status(400).send({
      status: false,
      message: " Invalid request parameters. Please provide E-Mail",
    });
  }

  if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(trimEmail)) {
    return res.status(400).send({
      status: false,
      message: `Email should be a valid email address`,
    });
  }

  const isEmailAlreadyUsed = await userModel.findOne({ email: trimEmail });

  if (isEmailAlreadyUsed) {
    return res.status(400).send({
      status: false,
      message: `${trimEmail} email address is already registered`,
    });
  }

  if (!validator.isValid(password)) {
    return res.status(400).send({
      status: false,
      message: " Invalid request parameters. Please provide Password",
    });
  }

  if (!validator.isValidPassword(password)) {
    return res.status(400).send({
      status: false,
      message:
        " Invalid request parameters. Password length should be between 8 and 15 characters",
    });
  }

  if (data.address) {
    if (validator.isValidRequestBody(data.address)) {
      if(data.address.hasOwnProperty('street')){
        if (!validator.isValid(data.address.street)) {
          return res.status(400).send({
            status: false,
            message: " Invalid request parameters. Please provide Street",
          });
        }
      }
      
      if(data.address.hasOwnProperty('city')){
        if (!validator.isValid(data.address.city)) {
            return res.status(400).send({
              status: false,
              message: " Invalid request parameters. Please provide City",
            });
        }
      }

      if(data.address.hasOwnProperty('pincode')){
        if (!validator.isValid(data.address.pincode)) {
              return res.status(400).send({
                status: false,
                message: " Invalid request parameters. Please provide Pincode",
              });
        }
      }
        
      }else{
      return res.status(400).send({
        status: false,
        message: " Invalid request parameters. Address cannot be empty",
      });
    }
  }

  const savedData = await userModel.create(data);
  return res
    .status(201)
    .send({ status: true, message: "Success", data: savedData });

}catch (err) {
  return res.status(500).send({ status: false, msg: err.message });
}}

const Login = async function (req, res) {
 try{ 
   let requestBody = req.body;

  if (!validator.isValidRequestBody(requestBody)) {
    return res.status(400).send({
      status: false,
      message: "Invalid request parameters. Please provide login details",
    });
  }

  const { email, password } = requestBody;

  if (!validator.isValid(email)) {
    return res
      .status(400)
      .send({ status: false, message: `Email is required` });
  }

  if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
    return res.status(400).send({
      status: false,
      message: `Email should be a valid email address`,
    });
  }

  if (!validator.isValid(password)) {
    return res
      .status(400)
      .send({ status: false, message: `Password is required` });
  }


  const user = await userModel.findOne({ email, password });

  if (!user) {
    return res
      .status(401)
      .send({ status: false, message: `Invalid login credentials` });
  }

  let payload = { _id: user._id };
  let token = jwt.sign(payload, "radium", { expiresIn: "30m" });
  res.header("x-auth-token", token);
  return res
    .status(200)
    .send({ status: true, message: "Login Success", data: user });
  }catch (err) {
      return res.status(500).send({ status: false, msg: err.message });
    }
};

module.exports = { RegisterUser, Login };
