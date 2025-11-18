const pool = require("../config/db");
const AppError = require("../utils/AppError");
const { generateToken } = require("../utils/authUtil");
const catchAsync = require("../utils/catchAsync");
const { bcryptPassword, comparePassword } = require("../utils/encryptDecrypt");

const registerUser=catchAsync(async(req, res)=>{
  const {name, email, password} = req.body;
  let hashPassword='';
  
  // check if required fields are present or not. If not then throw error.
  if(!email || !password || !name) {
    throw new AppError('Required fields are missing', 400);
  }

  //check whether the user already exist or not using the email.
  const user = await pool.query(
    'SELECT * from get_user_by_email($1)', [email]
  )

  //if user exist then throw error that user already exists.
  if(user.rowCount) {
    throw new AppError("User already exists", 409);
  }else {
    const payload = {
      email,
      role: 'user'
    }
    hashPassword = bcryptPassword(password);

    const accessToken = generateToken(payload, process.env.ACCESS_SECRET_KEY,process.env.ACCESS_TOKEN_EXPIRY_TIME);
    const refreshToken = generateToken(payload, process.env.REFRESH_SECRET_KEY,process.env.REFRESH_TOKEN_EXPIRY);

    await pool.query(
      `SELECT * from create_new_user($1, $2, $3)`, [name, email, hashPassword]
    )
  
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict'
    })

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict'
    })

    res.status(201).json({
      status: true,
      data: {
        ...payload,
        accessToken,
        refreshToken,
      },
      message: 'User registered successfully'
    })
  }
})

const loginUser=catchAsync(async(req, res, next)=>{
  const {email, password} = req.body;

  // check if required fields are present or not. If not then throw error.
  if(!email || !password) {
    throw new AppError('Required fields are missing', 400);
  }

  //check whether the user already exist or not using the email.
  const user = await pool.query(
    'SELECT * from get_user_by_email($1)', [email]
  )
  
  if(!user.rowCount) {
    throw new AppError('Invalid Credentials', 401);
  }
  
  const userInfo = user.rows?.[0];
  const {password: userPassword, ...otherUserInfo} = userInfo;


  //decrypt and compare the password
  const isMatched = comparePassword(password, userPassword);

  if(!isMatched) {
    throw new AppError("Invalid password", 401);
  }else {
    const accessToken = generateToken(otherUserInfo, process.env.ACCESS_SECRET_KEY,process.env.ACCESS_TOKEN_EXPIRY_TIME);
    const refreshToken = generateToken(otherUserInfo, process.env.REFRESH_SECRET_KEY,process.env.REFRESH_TOKEN_EXPIRY);
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict'
    })

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict'
    })

    res.status(200).json({
      status: true,
      data: {
        ...otherUserInfo,
        accessToken,
        refreshToken,
      },
      message: 'User logged in successfully'
    })
  }
})

module.exports = {
  registerUser,
  loginUser
} 