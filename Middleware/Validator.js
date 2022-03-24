const { check, validationResult } = require("express-validator");

exports.userValidator = [
  check("name")
    .trim()
    .not()
    .isEmpty()
    .withMessage("Name is required")
    .isLength({ min: 5, max: 20 })
    .withMessage("Invalid name, Name must be at least 5 to 20 characters long"),
  check("email").normalizeEmail().isEmail().withMessage("Email is invalid"),
  check("password")
    .trim()
    .not()
    .isEmpty()
    .withMessage("Password is missing")
    .isLength({ min: 8, max: 20 })
    .withMessage("Password must be at least 8-20 characters long"),
];

exports.validateUser = (req, res, next) => {
   const error = validationResult(req).array();
   if (error.length) {
      return res.json({error: error[0].msg})
   } 
    next() 
}