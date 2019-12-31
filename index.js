

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(display_map);
    } else {
        x.innerHTML = "Geolocation is not supported by this browser.";
    }
}

var myCoordinate = [77.63054869999999,
    12.942986399999999];
function display_map(position) {
    myCoordinate = [position.coords.longitude, position.coords.latitude];
    console.log(myCoordinate);
    generate_map();
}





const apiKey = "XvZBxrgXFbNTu5apmPvmX9irKCeIHGiM";
var map;
function generate_map() {
    map = tt.map({
        key: apiKey,
        container: 'map',
        center: myCoordinate,
        style: 'tomtom://vector/1/basic-main',
        zoom: 13
    });
    map.addControl(new tt.FullscreenControl());
    map.addControl(new tt.NavigationControl());
}

function createMarkerElement(type) {
    var element = document.createElement('div');
    element.innerHTML = "<img src='img/marker.png' style='width: 30px; height: 30px';>";

    return element;
}

function addMarkers(feature) {
    var startPoint, endPoint;
    if (feature.geometry.type === 'MultiLineString') {
        startPoint = feature.geometry.coordinates[0][0]; //get first point from first line
        endPoint = feature.geometry.coordinates.slice(-1)[0].slice(-1)[0]; //get last point from last line
    } else {
        startPoint = feature.geometry.coordinates[0];
        endPoint = feature.geometry.coordinates.slice(-1)[0];
    }

    new tt.Marker({ element: createMarkerElement('start') }).setLngLat(startPoint).addTo(map);
    new tt.Marker({ element: createMarkerElement('end') }).setLngLat(endPoint).addTo(map);
}

function findFirstBuildingLayerId() {
    var layers = map.getStyle().layers;
    for (var index in layers) {
        if (layers[index].type === 'fill-extrusion') {
            return layers[index].id;
        }
    }

    throw new Error('Map style does not contain any layer with fill-extrusion type.');
}
function search() {
    generate_map();
    var start = document.getElementById('from').value;
    var end = document.getElementById('to').value;
    stend = [
        {
            "lng": 85.32528,
            "lat": 23.3699
        },
        {
            "lng": 77.58387,
            "lat": 12.9928
        }
    ]
    console.log(start);
    console.log(end);

    tt.services.geocode({
        key: apiKey,
        batchItems: [
            { query: start },
            { query: end }]
    })
        .go()
        .then(function (res) {
            console.log(res);
            stend[0] = (res[0].results[0].position);
            console.log(res[0].results[0].position);
            stend[1] = (res[1].results[1].position);
            console.log(res[1].results[0].position);
            // var locs=String(stend[0]['lng'])+','+String(stend[0]['lat'])+":"+String(stend[1]['lng'])+","+String(stend[1]['lat']);
            // console.log(locs);
            tt.services.calculateRoute({
                key: apiKey,
                traffic: false,
                locations: stend
            })
                .go()
                .then(function (response) {

                    var geojson = response.toGeoJson();
                    console.log(geojson);
                    map.addLayer({
                        'id': 'route',
                        'type': 'line',
                        'source': {
                            'type': 'geojson',
                            'data': geojson
                        },
                        'paint': {
                            'line-color': '#00d7ff',
                            'line-width': 8
                        }
                    }, findFirstBuildingLayerId());

                    addMarkers(geojson.features[0]);

                    var bounds = new tt.LngLatBounds();
                    geojson.features[0].geometry.coordinates.forEach(function (point) {
                        bounds.extend(tt.LngLat.convert(point));
                    });
                    map.fitBounds(bounds, { duration: 0, padding: 50 });
                });
        });
}