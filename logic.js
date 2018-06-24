const mapboxToken = "pk.eyJ1IjoidGhpcmRodW1hbiIsImEiOiJjamljYXUyeTcwNHBlM3hxb3dtZWtiMmFpIn0.5BIldxj0ATxmuJBaknExeQ";

// web links
var primary_data = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

var plates = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"

// Define functions

d3.json(primary_data, function (data) {
  createFeatures(data.features);
});

function createFeatures(earthquakeData) {
  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.place +
      "</h3><hr><p>" + new Date(feature.properties.time) + "</p>" +
      "</h3><hr><p>Magnitude: " + feature.properties.mag + "</p>");
  }
  var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,
    pointToLayer: function (feature, latlng) {
      var geojsonMarkerOptions = {
        radius: 3.5 * feature.properties.mag,
        fillColor: ColorWheel(feature.properties.mag),
        color: "black",
        weight: 1,
        opacity: .95,
        fillOpacity: 0.6
      };
      return L.circleMarker(latlng, geojsonMarkerOptions);
    }
  });
  createMap(earthquakes);
}

function ColorWheel(d) {
  if (d > 6) {
    return 'darkred'
  } else if (d > 5) {
    return 'red'
  } else if (d > 4) {
    return 'orangered'
  } else if (d > 3) {
    return 'darkorange'
  } else if (d > 2) {
    return 'orange'
  } else if (d > 1) {
    return 'yellow'
  } else {
    return 'lightyellow'
  }
};

var bounds = new L.LayerGroup();

d3.json(plates, function (geoJson) {
    L.geoJSON(geoJson.features, {
        style: function (geoJsonFeature) {
            return {
                weight: 2,
                color: 'deeppink'
            }
        },
    }).addTo(bounds);
})

// Map function

function createMap(earthquakes) {

  var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/dark-v9/tiles/256/{z}/{x}/{y}?access_token=" + mapboxToken);

  var baseMaps = {
    "Street Map": streetmap
  };

  var overlayMaps = {
    'Earthquakes': earthquakes,
    "Plate Boundaries": bounds,
  };

  var Map = L.map("map-id", {
    center: [
      48, -96
    ],
    layers: [streetmap, earthquakes,bounds],
    zoom: 3.9
  });
  L.control.layers(baseMaps, overlayMaps).addTo(Map);

  var legend = L.control({ position: 'topright' });
  legend.onAdd = function (Map) {
    var div = L.DomUtil.create('div', 'info legend'),
      grades = [0, 1, 2, 3, 4, 5, 6],
      labels = [];
    div.innerHTML += 'Richter Scale<br><hr>'
    for (var i = 0; i < grades.length; i++) {
      div.innerHTML +=
        '<i style="background:   ' + ColorWheel(grades[i] + 1) + '">&nbsp&nbsp&nbsp&nbsp</i> ' +
        grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }
    return div;
  };
  legend.addTo(Map);
}
