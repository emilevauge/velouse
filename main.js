
// create a map in the "map" div, set the view to a given place and zoom
var map = L.map('map');

// add an OpenStreetMap tile layer
L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

map.locate({setView: true, maxZoom: 16});

var markers = {};
var stations = new Array();

$( document ).ready(function() {
    loadStationsFromLocalStorage();
    $.get( "http://localhost:1337" ,{src: "www.velo.toulouse.fr/service/carto"}, stationsLoaded, "xml" );
});

function loadStationsFromLocalStorage(){
    for(var i = 0; i < localStorage.length; i++){
        var station = JSON.parse(localStorage.getItem(localStorage.key(i)));
        createOrUpdateMarker(station);
    }
}

function createOrUpdateMarker(station){
    var marker;
    if (typeof(markers[station.number]) != 'undefined') {
        markers[station.number].bindPopup(station.name+"<br>"+station.free).setIcon(new L.divIcon({className:"stationDiv", html:station.free + "/"+station.available, iconSize: new L.Point(30, 16)}));
    }else{
        marker = L.marker([station.lat, station.lon]).addTo(map)
        .bindPopup(station.name).setIcon(new L.divIcon({className:"stationDiv", html:station.free + "/"+station.available, iconSize: new L.Point(30, 16)}));
        markers[station.number]=marker;
    }
}

function stationsLoaded( data ) {
    var nb_stations = data.documentElement.children[0].children.length;
    for (var i = 0; i < nb_stations; i++) {
        var station = {
            name:data.documentElement.children[0].children[i].attributes[0].nodeValue,
            number:data.documentElement.children[0].children[i].attributes[1].nodeValue,
            address:data.documentElement.children[0].children[i].attributes[2].nodeValue,
            lat:data.documentElement.children[0].children[i].attributes[4].nodeValue,
            lon:data.documentElement.children[0].children[i].attributes[5].nodeValue
        };
        $.ajax({
            url:"http://localhost:1337" , 
            data:{src: "www.velo.toulouse.fr/service/stationdetails/toulouse/" +station.number}, 
            station: station,
            success: function(data) {
                stationDetailLoaded(data , this.station);
            }, 
            dataType:"xml" });
    }
}

function stationDetailLoaded(data, station) {
    station.available = data.documentElement.children[0].textContent;
    station.free = data.documentElement.children[1].textContent;
    localStorage.setItem(station.number, JSON.stringify(station));
    createOrUpdateMarker(station);
}
