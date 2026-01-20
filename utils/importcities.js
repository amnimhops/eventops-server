const fs = require('fs');
const City = require('../persistence/city');

module.exports = function(){

    console.log('Populating cities from cities.js');
    
    return new Promise((resolve, reject) => {
        fs.readFile('utils/cities.js', function(err, data) {
            if (err) {
                console.error('Error reading file:', err);
                return;
            }
            
            console.log('City file read, parsing data...');
            const cities = JSON.parse(data.toString());
            console.log(cities.length, 'cities found, inserting into database, this may take a while...');
            
            let done = 0;
            const totalCities = cities.length;
            const cityDocs = [];

            cities.forEach((city) => {
                const cityDoc = new City({
                    name: city.name,
                    country: city.country,
                    location: [parseFloat(city.lng), parseFloat(city.lat)],
                    description: city.description
                });
                cityDocs.push(cityDoc);
            });

            City
                .insertMany(cityDocs, { ordered: false, writeConcern: { w: 0 } })
                .then(() => resolve())
                .catch(() => reject());
        });
    });
};