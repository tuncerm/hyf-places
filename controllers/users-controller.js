const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {validationResult} = require('express-validator');

const HttpError = require('../models/http-error');
const User = require('../models/user');

const getUsers = async (req, res, next) => {
    let users;

    try{
        users = await User.find({}, '-password').exec();
    } catch {
        return next(new HttpError('Something Went Wrong!', 500));
    }

    res.json({users: users.map(user=>user.toObject({getters: true}))});
}

const signup = async (req, res, next) => {
    console.log(req.file.url)
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return next(new HttpError('Invalid inputs detected.', 422));
    }
    
    const {name, email, password} = req.body;

    let existingUser;

    try{
        existingUser = await User.findOne({email}).exec();
    } catch {
        return next(new HttpError('Something went wrong!', 500));
    }

    if(existingUser){
        return next(new HttpError('User already exist!', 422));
    }

    let hashedPassword;
    try{
        hashedPassword = await bcrypt.hash(password, 12);
    } catch {
        return next(new HttpError('Failed to create User', 500));
    }

    const createdUser = new User({
        name,
        email,
        password: hashedPassword,
        image: req.file.url,
        places: []
    });

    try{
        await createdUser.save();
    } catch (error){
        return next(new HttpError('Failed to create User', 500));
    }

    let token;
    try{
        token = await jwt.sign({userId: createdUser.id, email}, process.env.JWT_SECRET, {expiresIn: '1h'});
    } catch {
        return next(new HttpError('Failed to Login newly created User', 500));
    }

    res.status(201).json({userId: createdUser.id, email, token});
}

const login = async (req, res, next) => {
    const {email, password} = req.body;

    let existingUser;

    try{
        existingUser = await User.findOne({email}).exec();
    } catch {
        return next(new HttpError('Something went wrong!', 500));
    }

    if(!existingUser){
        return next(new HttpError('Invalid credentials!', 403));
    }

    let isValidPassword;
    try{
        isValidPassword = await bcrypt.compare(password, existingUser.password);
    } catch {
        return next(new HttpError('Something went wrong!', 500));
    }

    if(!isValidPassword){
        return next(new HttpError('Invalid credentials!', 403));
    }

    let token;
    try{
        token = await jwt.sign({userId: existingUser.id, email}, process.env.JWT_SECRET, {expiresIn: '1h'});
    } catch {
        return next(new HttpError('Failed to log the User in.', 500));
    }

    res.status(201).json({userId: existingUser.id, email, token});
}

module.exports = {
    getUsers,
    signup,
    login
}