const axios = require('axios');
const HttpError = require('../models/http-error');

const {GEOCODE_HOST, GEOCODE_ACCESS_TOKEN} = process.env;

async function getCoordsForAddress(address) {
    const response = await axios.get(`${GEOCODE_HOST}${encodeURIComponent(address)}.json?access_token=${GEOCODE_ACCESS_TOKEN}`)
    
    if(!response.data || response.data.features.length < 1){
        throw(new HttpError('Could not fould the location for the given address.', 422));
    }

    const [lng, lat] = response.data.features[0].center;

    return {lat, lng}
}

module.exports = getCoordsForAddress;