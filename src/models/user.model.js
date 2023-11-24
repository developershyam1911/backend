import mongoose, { Schema } from "mongoose";
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowecase: true,
            index: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        fullname: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        avatar: {
            type: String, //cloudinary url
            required: true,
        },
        coverImage: {
            type: String
        },
        watchHistory: [{
            type: Schema.Types.ObjectId,
            ref: "Video"
        }],
        password: {
            type: String,
            required: [true, "Password is required"],
        },
        refreshToken: {
            type: String
        }
    },

    {
        timestamps: true
    }
)

//password ko hash krne ke liye pre hook ka use
userSchema.pre('save', async function (next) {
    if (!this.isModified("password")) {
        return next();
    }
    this.password = await bcrypt.hash(this.password, 10)
    next()
})
// password ko compare krne ke liye
userSchema.methods.isPasswordCorrect = async function(password){
return await bcrypt.compare(password, this.password)
}

userSchema.methods.genrateAccessToken =  function(){
  return   jwt.sign(
    {
        _id:this._id,
        email:this.email,
        username:this.username
    },
        process.env.ACCCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
    
   )
}
userSchema.methods.genrateRefreshToken = function(){
    return   jwt.sign(
        {
            _id:this._id,
        },
            process.env.REFRESH_TOKEN_SECRET,
            {
                expiresIn:process.env.REFRESH_TOKEN_EXPIRY
            }
       )
}

export const User = mongoose.model("User", userSchema)