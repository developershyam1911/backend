import {asyncHandler} from '../utils/asyncHandler.js'
import {ApiError} from '../utils/ApiError.js'
import {User} from '../models/user.model.js'
import {uploadOnCloudinary} from '../utils/cloudinary.js'
import { ApiResponse } from '../utils/ApiResponse.js'
const registerUser = asyncHandler(async (req, res)=>{
    //  res.status(200).json({
    //     message:"okk"
    // })

    // get user details from frontend 
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar 
    // upload them to cloudinary, avatar
    // create user object - create entry in db 
    // remove password and refresh token field from response
    // check for user creation 
    // return response

      // get user details from frontend 
  const {fullName, email, username, password} =   req.body
//   console.log("email", email)

  // validation - not empty
 if(
    [fullName, email, username, password].some((field)=>field.trim() === "")
 ){
throw new ApiError(400, "All field are required")
 }

 // check if user already exists: username, email
 const existedUser = User.findOne({$or:[{username}, {email}]})
if(existedUser){
    throw new ApiError(409, "User with email or username already exists")
}

// check for images, check for avatar 
const avatarLocalPath = req.fiels?.avtar[0]?.path;
const coverImageLocalPath = req.fiels?.coverImage[0]?.path;

if(!avatarLocalPath){
    throw new ApiError(400, "Avtar file is required")
}

 // upload them to cloudinary, avatar
const avtar = await uploadOnCloudinary(avatarLocalPath)
const coverImage = await uploadOnCloudinary(coverImageLocalPath)
if(!avtar){
    throw new ApiError(400, "Avtar file is required")
}

// create user object - create entry in db 
 const user = await User.create({
    fullName,
    email,
    username:username.tolowerCase(), 
    password,
    avtar:avtar.url,
    coverImage:coverImage?.url || " ",
})

 // remove password and refresh token field from response
const createdUser =await User.findById(user._id).select("-password", "-refreshToken")

// check for user creation 
if(!createdUser){
    throw new ApiError(500, "Something went wrong while registring the user")
}

// return response
return res.status(201).json(
    new  ApiResponse(200, createdUser, "User Registered Successfully")
)
})

export {registerUser}