$(document).ready(function() {
	L.Map = L.Map.extend({
	    openPopup: function(popup) {
	      this._popup = popup;
	      return this.addLayer(popup).fire('popupopen', {
	          popup: this._popup
	      });
	    }
	});	

	var map = L.map('map').setView([42.292, -71.3059], 16);
	map.attributionControl.setPrefix('');

	L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png?{foo}', {foo: 'bar'}).addTo(map);

	var geocoder;
	function initialize() {
		geocoder = new google.maps.Geocoder();
		console.log("geocoder initialized");
	}

	function hidePopups(allMarkers) {
	  	for (var marker = 0; marker < document.getElementsByClassName('point').length; marker++) {
	  		if (document.getElementsByClassName('point')[marker].dataset.marker != undefined) {
	  			allMarkers[parseInt(document.getElementsByClassName('point')[marker].dataset.marker)].closePopup();
	  		}
	  	}								      		
	}

	var campusBuildings = [];
	var campusRoads = [];
	function drawCampus() {
		$.ajax({
		    type: "GET",
		    url: './buildings_wgs84.json',
		    dataType: 'json',
		    success: function (data) {
		        geojsonLayer = L.geoJson(data, {onEachFeature: attachPopup}).addTo(map);		    	
		    	buildings = data.features;
		    	for (var building in buildings) {
		    		newBuilding = {};
		    		newBuilding.title = buildings[building].properties["NAME"];
		    		newBuilding.outline = buildings[building].geometry.coordinates;
		    		newBuilding.entrances = {};
		    		newBuilding.swipeHours = [];
		    		campusBuildings.push(newBuilding);
		    	}
		    }
		});	

		campusRoads = getRoads();
		for (var i = 0; i < campusRoads.length; i++) {
			road = campusRoads[i];
			L.multiPolyline(road.outline, {color: 'purple', weight: 4}).addTo(map);
		}

	    function attachPopup(feature, layer) {
	        layer.bindPopup(feature.properties["NAME"]);
	    }
	}

	function getRoads() {
		listOfRoads = [];		
		$.ajax({
			method: 'GET',
			url: './wcampus_paths.json',
			dataType: 'json',
			async: false,
			crossDomain: true,
			success: function(data) {
				paths = data.features;
				for (var path in paths) {
					newPath = {};
					newPath.title = paths[path].attributes["OBJECTID"];
					newPath.outline = paths[path].geometry.rings;
					newPath.type = paths[path].attributes["TYPE"];
					listOfRoads.push(newPath);
				}
			}
		});

		$.ajax({
			method: 'GET',
			url: './wcampus_roadsparking.json',
			dataType: 'json',
			async: false,
			crossDomain: true,
			success: function(data) {
				roads = data.features;
				for (var road in roads) {
					newRoad = {};
					newRoad.title = roads[road].attributes["OBJECTID"];
					newRoad.outline = roads[road].geometry.rings;
					newRoad.type = roads[road].attributes["TYPE"];
					listOfRoads.push(newRoad);
				}
			}
		});

		return listOfRoads;
	}

	$("userInput").niceScroll({mousescrollstep:40, hidecursordelay: 200, scrollspeed: 40, cursorwidth: 7, cursorcolor: "#157195", cursoropacitymax: .7, cursoropacitymin: .3});
	initialize();
	drawCampus();

});