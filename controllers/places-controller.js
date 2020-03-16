const fs = require('fs');
const mongoose = require('mongoose');

const {validationResult} = require('express-validator');
const getCoordsForAddress = require('../util/location');
const Place = require('../models/place');
const User = require('../models/user');

const HttpError = require('../models/http-error');

const getPlaceById = async (req, res, next) => {
    const placeId = req.params.pid;
    let place;
    try{
        place = await Place.findById(placeId);
    } catch {
        return next(new HttpError('Could not find place', 500));
    }

    if(!place){
        return next(new HttpError('Could not find a place for the provided id.', 404));
    }

    res.json({place: place.toObject({getters: true})});
}

const getPlacesByUserId = async (req, res, next) => {
    const userId = req.params.uid;
    let places;
    try{
        places = await Place.find({creator: userId}).exec();
    } catch {
        return next(new HttpError('Could not find place', 500));
    }

    if(!places || !places.length){
        return next(new HttpError('Could not find a place for the provided id.', 404));
    }

    res.json({places: places.map(place=>place.toObject({getters: true}))});
}

const createPlace = async (req, res, next) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return next(new HttpError('Invalid inputs detected.', 422));
    }

    const { title, description, address } = req.body;

    let coordinates;
    try{
        coordinates = await getCoordsForAddress(address);
    } catch (error){
        return next(error);
    }

    const createdPlace = new Place({
        title,
        description,
        address,
        location: coordinates,
        image: req.file.url,
        creator: req.userData.userId
    });

    let user;
    try{
        user = await User.findById(req.userData.userId).exec();
    } catch {
        return next(new HttpError('Failed to create place', 500));
    }

    if(!user){
        return next(new HttpError('User not found!', 404));
    }

    try{
        const session =  await mongoose.startSession();
        session.startTransaction();
        await createdPlace.save({session});
        user.places.push(createdPlace);
        await user.save({session});
        await session.commitTransaction();
    } catch {
        return next(new HttpError('Failed to create place', 500));
    }

    res.status(201).json({place: createdPlace});
}

const updatePlaceById = async (req, res, next) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return next(new HttpError('Invalid inputs detected.', 422));
    }

    const { title, description } = req.body;
    const placeId = req.params.pid;

    let place;
    try{
        place = await Place.findById(placeId);
    } catch {
        return next(new HttpError('Could not update place.', 500));
    }

    if(place.creator.toString() !== req.userData.userId){
        return next(new HttpError('You are not authorized to edit.', 401));
    }

    place.title = title;
    place.description = description;

    try{
        await place.save();
    } catch {
        return next(new HttpError('Could not update place.', 500));
    }

    res.status(200).json({place: place.toObject({getters: true})});
}

const deletePlaceById = async (req, res, next) => {
    const placeId = req.params.pid;
    let place;
    try{
        place = await Place.findById(placeId).populate('creator');
    } catch {
        return next(new HttpError('Could not delete place.', 500));
    }

    if(!place){
        return next(new HttpError('Could not findplace to delete.', 404));
    }

    if(place.creator.id !== req.userData.userId){
        return next(new HttpError('You are not authorized to delete this.', 401));
    }

    const imagePath = place.image;

    try{
        const session =  await mongoose.startSession();
        session.startTransaction();
        await place.remove({session});
        place.creator.places.pull(place);
        await place.creator.save({session});
        await session.commitTransaction();
    } catch (error){
        return next(new HttpError('Could not remove place.', 500));
    }
    fs.unlink(imagePath, err=>{
        console.log(err);
    });
    res.status(200).json({message: `Deleted place.`});
}

module.exports = {
    getPlaceById,
    getPlacesByUserId,
    createPlace,
    updatePlaceById,
    deletePlaceById
}