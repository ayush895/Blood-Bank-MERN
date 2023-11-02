const express=require('express');
const {registerController,loginController, currentController} = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

const router=express.Router();

//Routes
//REGISTER || POST
router.post('/register',registerController);

//LOGIN || POST
router.post('/login',loginController);

//Get Current-user ||GET

router.get('/current-user',authMiddleware,currentController);

module.exports=router;