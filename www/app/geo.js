
function getUserLocation(callback) {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function(pos){
                callback(null,pos.coords);
            },
            function(err){
                callback(err,null)
            }
        );
    }
}

function setupGoogleMaps(){
    
}