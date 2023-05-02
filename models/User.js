const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Schema = mongoose.Schema;

const movieSchema = new Schema({
    title: { type: String, required: true },
    year: { type: Number },
    genre: { type: String },
    watchLocations: [{ type: String }],
    description: { type: String },
});

const userSchema = new Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    likedMovies: [{ type: String }],
    recommendedMovies: [{ type: movieSchema }],
});

userSchema.pre('save', async function(next) {
    try {
        const user = this
        //allows for updating password, from lecture. Or password is new/new user
        if (!user.isModified('password')) return next(); //exit if not changed

        //generate salt
        const salt = await bcrypt.genSalt(10);

        //hash pass with salt
        const hashedPassword = await bcrypt.hash(this.password, salt);

        user.password = hashedPassword;
        next();
    } catch (error) {
        return next(error); //passed to app.js error handling
    }
});

userSchema.methods.matchPassword = async function(password) {
    try {
        return await bcrypt.compare(password, this.password); //plaintext, hashed pass - containing salt from bcrypt
    } catch (error) {
        throw new Error(error);
    }
};

module.exports = mongoose.model('User', userSchema);