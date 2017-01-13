var type = '', distance, hf = 'http://ehealthafrica.carto.com/api/v2/sql?format=GeoJSON&q=SELECT * FROM cam_hf',
    fe_buas = 'http://ehealthafrica.carto.com/api/v2/sql?format=GeoJSON&q=SELECT * FROM fe_buas',
    fe_hamletpt = 'http://ehealthafrica.carto.com/api/v2/sql?format=GeoJSON&q=SELECT * FROM fe_hamletpt',
    ha_50m_buffer = 'http://ehealthafrica.carto.com/api/v2/sql?format=GeoJSON&q=SELECT * FROM hamlet_50m_buffer',
    ha_200m_buffer = 'http://ehealthafrica.carto.com/api/v2/sql?format=GeoJSON&q=SELECT * FROM hamlet_200m_buffer',
    ssa_75m_buffer = 'http://ehealthafrica.carto.com/api/v2/sql?format=GeoJSON&q=SELECT * FROM ssa_75m_buffer',
    fc_settlementname = 'http://ehealthafrica.carto.com/api/v2/sql?format=GeoJSON&q=SELECT * FROM fc_settlementname',
//    bua_grid = 'http://ehealthafrica.carto.com/api/v2/sql?format=GeoJSON&q=SELECT * FROM bua_grid',
    bua_grid = 'http://ehealthafrica.carto.com/api/v2/sql?format=GeoJSON&q=SELECT * FROM geoserver_getfeature_47',
    gana_tracks = 'http://ehealthafrica.carto.com/api/v2/sql?format=GeoJSON&q=SELECT * FROM geoserver_getfeature_46 where speed < 5.0',
    geoData = null, bua_gridLayer = null, gana_tracksLayer = null,
    hfLayer = null, buasLayer = null, hasLayer = null, ha50mLayer = null, ha200mLayer = null, ssa75mLayer = null, fcNamesLayer = null,
    markerGroup = null,
    cameroonAdm1, buasData, hasData, hfData, ha50mData, ha200mData, ssa75mData, fcNamesData, bua_gridData, ganaData,
    trackLayer = new L.GeoJSON(),
    prefecture_layer = null, sub_prefecture_layer = null, bufferLayer = null,
    cameroon_district = null, cameroon_area = null,
    areaLabel = [], testLabels = [], ssaLabels = [], buaLabels = [], hasLabels = [], fcLables = [],
    within, within_fc, buffered = null,
    districtAdmin = false, areaAdmin = false,
    BING_KEY = 'AuhiCJHlGzhg93IqUH_oCpl_-ZUrIE6SPftlyGYUvr9Amx5nzA-WqGcPquyFZl4L',
    googleSat = L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',{maxZoom: 20, subdomains:['mt0','mt1','mt2','mt3']}),
    bingImagery = new L.BingLayer(BING_KEY),
    bingAerialLabel = new L.BingLayer(BING_KEY, {type: 'AerialWithLabels'}),
    googleStreets = L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',{maxZoom: 20, subdomains:['mt0','mt1','mt2','mt3']}),
    terrain = L.tileLayer('http://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}',{maxZoom: 20, subdomains:['mt0','mt1','mt2','mt3']}),
    osm = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 20}),
    mapbox = L.tileLayer('https://maps.nlp.nokia.com/maptiler/v2/maptile/newest/normal.day.grey/{z}/{x}/{y}/256/png8?lg=eng&token=61YWYROufLu_f8ylE0vn0Q&app_id=qIWDkliFCtLntLma2e6O', {maxZoom: 20})


var map = L.map('map', {
    center: [12, 15],
    zoom: 12,
    animation: true,
    zoomControl: false,
    layers: [googleSat]
    //minZoom: 6

});

map.on('zoomend', function () {
    adjustLayerbyZoom(map.getZoom())
})

L.control.scale({
    position: 'topright',
    maxWidth: 100,
    metric: true,
    updateWhenIdle: true
}).addTo(map);

new L.Control.Zoom({
    position: 'bottomright'
}).addTo(map);


//Adding OSM Basemap
function osmBase()
{
   osm.addTo(map);
    map.removeLayer(bingImagery);
    map.removeLayer(bingAerialLabel);
    map.removeLayer(googleSat);
}
   
//Adding Bing Aerial Basemap
function bingAerial()
{
    bingImagery.addTo(map);
    map.removeLayer(osm);
    map.removeLayer(bingAerialLabel);
    map.removeLayer(googleSat);
}

//Adding Bing Hybrid Basemap
function bingHybrid()
{
    bingAerialLabel.addTo(map);
    map.removeLayer(osm);
    map.removeLayer(bingImagery);
    map.removeLayer(googleSat);
}

//Adding Google Sat Imagery Basemap
function googleBase()
{
    googleSat.addTo(map);
    map.removeLayer(osm);
    map.removeLayer(bingImagery);
    map.removeLayer(bingAerialLabel);
}

function triggerUiUpdate() {
    showLoader();
    hfData = getHF(hf);
    buasData = getBUA(fe_buas);
    ha50mData = getHA50(ha_50m_buffer);
    ha200mData = getHA200(ha_200m_buffer);
    ssa75mData = getSSA75(ssa_75m_buffer);   
    fcNamesData = getFCNAMES(fc_settlementname);
    bua_gridData = getBUAGrid(bua_grid);
    ganaData = getTracks(gana_tracks)
    hideLoader();
}


function removeHF() {
    if (hfLayer != null)
        map.removeLayer(hfLayer);
}

function addHF() {
    if (hfLayer = null)
     map.addLayer(hfLayer);
}

function addDataToMap(geoData) {
    var markerHealth = L.icon({
        iconUrl: "image/Hospital_Logo_01.png",
        iconSize: [10, 10],
        iconAnchor: [25, 25]
    });
        hfLayer = L.geoJson(geoData, {
        pointToLayer: function (feature, latlng) {
            var marker = L.marker(latlng, {icon: markerHealth})
                //markerGroup.addLayer(marker);
            return marker
        }
    })
    map.addLayer(hfLayer);
}

//addTracksToMap

function addTracksToMap(geoData) {
    var invalid = L.icon({
        iconUrl: "image/invalid.png",
        iconSize: [10, 10],
        iconAnchor: [25, 25]
    });
    
    var valid = L.icon({
        iconUrl: "image/valid.svg",
        iconSize: [10, 10],
        iconAnchor: [25, 25]
    });
    
        gana_tracksLayer = L.geoJson(geoData, {
        pointToLayer: function (feature, latlng) {
            var marker = L.marker(latlng, {icon: invalid})
                //markerGroup.addLayer(marker);
            return marker
        }
    })
//    map.addLayer(gana_tracksLayer);
}

function adjustLayerbyZoom(zoomLevel) {
    if (zoomLevel > 14)
        for (var i = 0; i < buaLabels.length; i++) {
            buaLabels[i].addTo(map)
        }
    else {
        for (var i = 0; i < buaLabels.length; i++) {
            map.removeLayer(buaLabels[i])
        }
    }
    
    if (zoomLevel > 14)
        for (var i = 0; i < ssaLabels.length; i++) {
            ssaLabels[i].addTo(map)
        }
    else {
        for (var i = 0; i < ssaLabels.length; i++) {
            map.removeLayer(ssaLabels[i])
        }
    }
    
        
    if (zoomLevel > 15) {
        map.addLayer(fcNamesLayer);
        for (var i = 0; i < fcLables.length; i++) {
            fcLables[i].addTo(map)
        }
    }
    else {
         map.removeLayer(fcNamesLayer);
        for (var i = 0; i < fcLables.length; i++) {
            map.removeLayer(fcLables[i])
        }
    }
    
    
    if (zoomLevel > 14) {
        map.addLayer(bua_gridLayer);
    }
//    else if (zoomLevel < 14){
//         map.removeLayer(bua_gridLayer);
//    }
    
}

function addBUAToMap(geoData) {
    var layerStyles = {
            'buas': {
                "clickable": false,
                "color": '#FF1493',
                "fillColor": '#D6D6D6',
                "weight": 2,
                "opacity": 2,
                "fillOpacity": 0.1
            }
      }
        buasLayer = L.geoJson(geoData, {
       style: layerStyles['buas'],
        onEachFeature: function (feature, layer) {
            var labelIcon = L.divIcon({
                className: 'labelbua',
                html: feature.properties.settlementname
            })
            buaLabels.push(L.marker(layer.getBounds().getCenter(), {
                    icon: labelIcon
                }))
        }
    }).addTo(map)
    
    
}

function add50MToMap(geoData) {
    var layerStyles = {
            'ha50': {
                "clickable": false,
                "color": '#FF0000',
                "fillColor": '#D6D6D6',
                "weight": 2,
                "opacity": 2,
                "fillOpacity": 0.1
            }
      }
    
        ha50mData = L.geoJson(geoData, {
       style: layerStyles['ha50']
    }).addTo(map)
    
    
}


function add200MToMap(geoData) {
    var layerStyles = {
            'ha200': {
                "clickable": false,
                "color": '#FF7F00',
                "fillColor": '#D6D6D6',
                "weight": 2,
                "opacity": 2,
                "fillOpacity": 0.3
            }
      }
        ha200mLayer = L.geoJson(geoData, {
       style: layerStyles['ha200']
    }).addTo(map)
    
    
}

function addBUAGridToMap(geoData) {
    var layerStyles = {
        'not_visited': {
                "clickable": false,
                "color": '#FF0000',
                "fillColor": '#D6D6D6',
                "weight": 1,
                "opacity": 2,
                "fillOpacity": 0.1
            },
        'visited': {
                "clickable": false,
                "color": '#FF0000',
                "fillColor": '#D6D6D6',
                "weight": 1,
                "opacity": 2,
                "fillOpacity": 0.1
            }
      }
        bua_gridLayer = L.geoJson(geoData, {
//       style: layerStyles['buagrid']
            style: function(feature){
                switch (feature.properties.status) {
                    case 'not_visited': return {
                "clickable": false,
                "color": '#FF0000',
                "fillColor": '#D6D6D6',
                "weight": 1,
                "opacity": 2,
                "fillOpacity": 0.1
            };
                    case 'visited': return {
                "clickable": false,
                "color": '#008000',
                "fillColor": '#D6D6D6',
                "weight": 1,
                "opacity": 2,
                "fillOpacity": 0.1
            };
                }
            }
    })
//            .addTo(map)
 }

function addSSA75MToMap(geoData) {
    var layerStyles = {
            'ssa200': {
                "clickable": false,
                "color": '#260099',
                "fillColor": '#D6D6D6',
                "weight": 2,
                "opacity": 2,
                "fillOpacity": 0.1
            }
      }
        ssa75mLayer = L.geoJson(geoData, {
       style: layerStyles['ssa200']
    }).addTo(map)
    
    
}

var allColours = {
        'hapt': {
            radius: 3,
            fillColor: "#fff",
            color: "#000",
            weight: 2,
            opacity: 1,
            fillOpacity: 1.0
        },
        'ssapt': {
            radius: 2,
            fillColor: "#008000",
            color: "#000",
            weight: 1,
            opacity: 1,
            fillOpacity: 1.0
        },
        'valid': {
            radius: 2,
            fillColor: "#FFFF0A",
            color: " #FFFF0A",
            weight: 1,
            opacity: 1,
            fillOpacity: 1.0
        }
    }



function addFCNAMESToMap(geoData) {
    if (hasLayer != null)
        map.removeLayer(hasLayer)
        fcNamesLayer = L.geoJson(geoData, {
       pointToLayer: function (feature, latlng) {
           var marker =  L.circleMarker(latlng, allColours['hapt'])
           return marker
        },
        onEachFeature: function (feature, layer) {
            var labelIcon = L.divIcon({
                className: 'labelshow',
                html: feature.properties.settlementname
            })
            fcLables.push(L.marker(layer.getBounds().getCenter(), {
                    icon: labelIcon
                }))
        }
    })

}

function showLoader() {
    $('.fa-spinner').addClass('fa-spin')
    $('.fa-spinner').show()
}

function hideLoader() {
    $('.fa-spinner').removeClass('fa-spin')
    $('.fa-spinner').hide()
}


function getHF(queryUrl) {
    showLoader()
    $.post(queryUrl, function (data) {
        hideLoader()
        addDataToMap(data)
        console.log('Data-Geo:  ', data);
    }).fail(function () {
        console.log("error!")
    });
}

function getBUA(queryUrl) {
    showLoader()
    $.post(queryUrl, function (data) {
        hideLoader()
        addBUAToMap(data)
        console.log('Data-Geo:  ', data);
    }).fail(function () {
        console.log("error!")
    });
}
function getBUAGrid(queryUrl) {
    showLoader()
    $.post(queryUrl, function (data) {
        hideLoader()
        addBUAGridToMap(data)
        console.log('Data-Geo:  ', data);
    }).fail(function () {
        console.log("error!")
    });
}

//function getHAS(queryUrl) {
//    showLoader()
//    $.post(queryUrl, function (data) {
//        hideLoader()
//        addHASToMap(data)
//        console.log('Data-Geo:  ', data);
//    }).fail(function () {
//        console.log("error!")
//    });
//}

function getHA50(queryUrl) {
    showLoader()
    $.post(queryUrl, function (data) {
        hideLoader()
        add50MToMap(data)
        console.log('Data-Geo:  ', data);
    }).fail(function () {
        console.log("error!")
    });
}

function getHA200(queryUrl) {
    showLoader()
    $.post(queryUrl, function (data) {
        hideLoader()
        add200MToMap(data)
        console.log('Data-Geo:  ', data);
    }).fail(function () {
        console.log("error!")
    });
}


function getSSA75(queryUrl) {
    showLoader()
    $.post(queryUrl, function (data) {
        hideLoader()
        addSSA75MToMap(data)
        console.log('Data-Geo:  ', data);
    }).fail(function () {
        console.log("error!")
    });
}


function getFCNAMES(queryUrl) {
    showLoader()
    $.post(queryUrl, function (data) {
        hideLoader()
        addFCNAMESToMap(data)
        console.log('Data-Geo:  ', data);
    }).fail(function () {
        console.log("error!")
    });
}

function getTracks(queryUrl) {
    showLoader()
    $.post(queryUrl, function (data) {
        hideLoader()
        addTracksToMap(data)
        console.log('Data-Geo:  ', data);
    }).fail(function () {
        console.log("error!")
    });
}

//function getAdminLayers() {
//    showLoader()
//    var adminLayers = {}
//
//    //Add Admin Layers to Map
//
//
//     $.get('resources/admin_area.geojson', function (cam_area) {
//        adminLayers['camArea'] = JSON.parse(cam_area)
//        addAdminLayersToMap(adminLayers)
//		}).fail(function () {
//            logError(null)
//        })
//
//
//    $.get('resources/admin_district.geojson', function (cam_district) {
//        adminLayers['camDistrict'] = JSON.parse(cam_district)
//        addAdminLayersToMap(adminLayers)
//		}).fail(function () {
//            logError(null)
//        })
//
//
//    $.get('resources/cameroon_admin1.geojson', function (cam_admin1) {
//        adminLayers['camAdmin1'] = JSON.parse(cam_admin1)
//        addAdminLayersToMap(adminLayers)
//		}).fail(function () {
//            logError(null)
//        })
//}

function logError(error) {
    console.log("error!")
}

triggerUiUpdate();
//getAdminLayers();
