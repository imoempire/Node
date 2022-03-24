const resetTokenModel = require("../Model/resetToken");
const UserModel = require("../Model/User");
const {isValidObjectId} = require("mongoose")

exports.isResetPasswordValid = async (req, res, next) => {
   const { token, id } = req.query;
   if(!token || !id) return res.status(401).json({
      success: false,
      error: 'Invalid request token'
   })
   if(!isValidObjectId(id)) return res.status(401).json({
      success: false,
      error: 'Invalid User Now'
   })
  const user = await UserModel.findById(id)
   if(!user) return res.status(401).json({
      success: false,
      error: 'User not found'
   })
   const resetToken = await resetTokenModel.findOne({owner: user._id})

   if(!resetToken) return res.status(401).json({
      success: false,
      error: 'Token not found'
   })
 
   const isValid = await resetToken.compareToken(token)

   if(!isValid) return res.status(401).json({
      success: false,
      error: 'Token not Valid'
   })

   req.user = user

   next()
}

exports.isResetTokenValid = async (req, res, next) => {
   const { token, id } = req.query;
   if(!token || !id) return res.status(401).json({
      success: false,
      error: 'Please Invalid request token'
   })
   if(!isValidObjectId(id)) return res.status(401).json({
      success: false,
      error: 'Please Invalid User'
   })
  const user = await UserModel.findById(id)
   if(!user) return res.status(401).json({
      success: false, 
      error: 'Please User not found'
   })
   const resetToken = await resetTokenModel.findOne({owner: user._id})

   if(!resetToken) return res.status(401).json({
      success: false, 
      error: 'Please Token not found'
   })
 
   const isValid = await resetToken.compareToken(token)

   if(!isValid) return res.status(401).json({
      success: false,
      error: 'Please Token not Valid'
   })

   req.user = user

   next()
}