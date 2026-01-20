const Category = require('../persistence/category');
const Event = require('../persistence/event');

// Coordenadas de Benimaclet, Valencia
const BENIMACLET_LAT = 39.4850;
const BENIMACLET_LNG = -0.3529;
const RADIUS_KM = 5;

// Genera coordenadas aleatorias dentro de un radio de 5km desde Benimaclet
function getRandomLocation() {
    // 1 grado de latitud ≈ 111 km
    // 1 grado de longitud ≈ 111 km * cos(lat)
    const radiusInDegrees = RADIUS_KM / 111;
    
    const u = Math.random();
    const v = Math.random();
    const w = radiusInDegrees * Math.sqrt(u);
    const t = 2 * Math.PI * v;
    const x = w * Math.cos(t);
    const y = w * Math.sin(t);
    
    const newLat = BENIMACLET_LAT + y;
    const newLng = BENIMACLET_LNG + x / Math.cos(BENIMACLET_LAT * Math.PI / 180);
    
    return [newLng, newLat];
}

// Genera una fecha aleatoria en los próximos 30 días
function getRandomDate() {
    const now = new Date();
    const future = new Date(now.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000);
    return future;
}

// Crea categorías en la base de datos
function createCategories() {
    console.log('Populating mock categories...');
    
    return new Promise((resolve, reject) => {
        const categories = [
            { name: 'Music', image: 'music.png' },
            { name: 'Sports', image: 'sports.png' },
            { name: 'Technology', image: 'technology.png' },
            { name: 'Art', image: 'art.png' },
            { name: 'Food & Drink', image: 'food.png' },
            { name: 'Business', image: 'business.png' },
            { name: 'Health & Wellness', image: 'health.png' },
            { name: 'Film & Media', image: 'film.png' },
            { name: 'Education', image: 'education.png' },
            { name: 'Community', image: 'community.png' }
        ];
        
        console.log('Creating', categories.length, 'categories...');
        
        Category.insertMany(categories, { ordered: false })
            .then((results) => {
                console.log('Categories created!', results.length, 'categories inserted');
                resolve(results);
            })
            .catch((err) => {
                console.error('Error creating categories:', err);
                reject(err);
            });
    });
}

// Crea eventos aleatorios
function createEvents(count = 20) {
    console.log('Populating mock events...');
    
    return new Promise((resolve, reject) => {
        // Primero obtener todas las categorías
        Category.find({})
            .then((categories) => {
                if (categories.length === 0) {
                    return reject(new Error('No categories found. Please create categories first.'));
                }
                
                const eventNames = [
                    'Summer Music Festival',
                    'Tech Meetup',
                    'Art Exhibition',
                    'Food Tasting Event',
                    'Marathon Race',
                    'Business Networking',
                    'Yoga Workshop',
                    'Film Screening',
                    'Coding Bootcamp',
                    'Community Gathering',
                    'Jazz Night',
                    'Basketball Tournament',
                    'Startup Pitch',
                    'Photography Workshop',
                    'Wine Tasting',
                    'Beach Volleyball',
                    'Meditation Retreat',
                    'Documentary Festival',
                    'Language Exchange',
                    'Street Market'
                ];
                
                const events = [];
                
                for (let i = 0; i < count; i++) {
                    const start = getRandomDate();
                    const end = new Date(start.getTime() + (2 + Math.random() * 4) * 60 * 60 * 1000);
                    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
                    
                    events.push({
                        name: eventNames[i % eventNames.length] + ' ' + (Math.floor(i / eventNames.length) + 1),
                        location: getRandomLocation(),
                        address: 'Benimaclet, Valencia',
                        category: randomCategory._id,
                        public: Math.random() > 0.2,
                        start: start,
                        end: end,
                        description: `An amazing ${randomCategory.name} event in Benimaclet area!`
                    });
                }
                
                console.log('Creating', events.length, 'events...');
                
                return Event.insertMany(events, { ordered: false });
            })
            .then((results) => {
                console.log('Events created!', results.length, 'events inserted');
                resolve(results);
            })
            .catch((err) => {
                console.error('Error creating events:', err);
                reject(err);
            });
    });
}

module.exports = {
    createCategories,
    createEvents
};
