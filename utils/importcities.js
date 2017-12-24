var mongoClient = require('mongodb').MongoClient;
var fs = require('fs');

mongoClient.connect('mongodb://localhost/', function (err, client) {
    var db = client.db('eventops');
    var citiesCol = db.collection('cities');
    
    
    //citiesCol.createIndex({location:'2dsphere'});

    var i = 0;
    fs.readFile('cities.js',function(err,data){
        console.log('Read. Importing')
        var cities = JSON.parse(data.toString());
        console.log('Imported');
        //console.log('Evaluation complete');
        var done = 0;
        for(var i in cities){
            cities[i].location = [parseFloat(cities[i].lng),parseFloat(cities[i].lat)];
            delete cities['lat'];
            delete cities['lng'];

            (function(c){
                citiesCol.insert(c,{w:0,j:false},function(err,data){
                    done++;
                    if(done%100==0) console.log('Done',done);
                });
            })(cities[i]);
            
/*
            if(i%100==0){
                console.log(i,cities.length);
            }*/
        
        }
        client.close();
        /*
        cities.insert(city,{w:0,j:false})
        .then((doc)=>{
        })
        .catch((err)=>{
            console.log('WARN!=>',err);
        });*/
        i++;

        if(i%100==0){
            console.log(i);
        }
    
    });
});
