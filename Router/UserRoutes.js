const { createUser, signIn, verifyEmail, forgetPassword, resetPassword } = require('../Controller/UserControl');
const { isResetPasswordValid, isResetTokenValid } = require('../Middleware/user');
const { userValidator, validateUser } = require('../Middleware/Validator');

const router = require('express').Router();

router.post('/create', userValidator, validateUser , createUser )
router.post('/signin', signIn )
router.post('/verify', verifyEmail )
router.post('/forgetpassword', forgetPassword)
router.post('/reset-password',isResetPasswordValid, resetPassword)
router.get('/verify-token',isResetTokenValid, (req, res) => {
   res.json({
      success: true, 
   })
})

module.exports = router;   