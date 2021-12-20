

const isValid = function (value) {
    if (typeof value === "undefined" || value === null || value === Number) return false;
    if (typeof value === "string" && value.trim().length === 0) return false;
    return true;
  };
  const isValidTitle = function (title) {
    return ["Mr", "Mrs", "Miss"].indexOf(title) !== -1;
  };
  const isValidPassword = function (value) {
    if (typeof value === "string" && value.trim().length >= 8 && value.trim().length <= 15) return true;
    return false;
  };
  const isValidRequestBody = function (requestBody) {
    return Object.keys(requestBody).length > 0;
  };


  module.exports = {isValid, isValidTitle, isValidRequestBody, isValidPassword}
  