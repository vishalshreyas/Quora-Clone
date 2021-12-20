const jwt = require("jsonwebtoken")




const authenticate = function (req, res, next) {
  try {
    let authToken = req.headers["x-auth-token"];

    if (!authToken) {
      res.status(401).send({ status: false, message: "Mandatory authentication header missing" });
    }
    else {
      let decodedToken = jwt.verify(authToken, "radium");
      if (decodedToken) {

        req.user = decodedToken._id
        console.log("Token:- ", decodedToken)
        next();
     } else {
        res.status(401).send({ status: false, message: "The authentication token is invalid" });
      }
    }
  } catch (error) {
    res.status(500).send({ status: false, message: error.message });
  }
};

module.exports.authenticate = authenticate;

