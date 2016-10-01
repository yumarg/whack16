$(document).ready(function() {

	var map;
	function initialize() {
	    var mapOptions = {
	      zoom: 16,
	      center: {lat: 42.292, lng: -71.3059},
	      mapTypeId: 'roadmap'
	    };

	    map = new google.maps.Map(document.getElementById('map'),
	        mapOptions);
	    map = L.map('map').setView([42.292, -71.3059], 16);
		L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png?{foo}', {foo: 'bar'}).addTo(map);	    
	}

	var campusBuildings = [];
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
		    		campusBuildings.push(newBuilding);
		    	}
		    }
		});	

	    function attachPopup(feature, layer) {
	        layer.bindPopup(feature.properties["NAME"]);
	    }		

	}

	var campusVanStops = [];
	function drawVanStops() {
		$.ajax({
		    type: "GET",
		    url: './vanstops.json',
		    dataType: 'json',
		    success: function (data) {
		        geojsonLayer = L.geoJson(data, {onEachFeature: attachPopup}).addTo(map);		    	
		    	vanstops = data.features;
		    	console.log(vanstops);
		    	for (var vanstop in vanstops) {
		    		newVanStop = {};
		    		newVanStop.title = vanstops[vanstop].properties.name;
		    		newVanStop.outline = vanstops[vanstop].geometry.coordinates;
		    		newVanStop.times = [vanstops[vanstop].timeEarly, vanstops[vanstop].timeLate];
		    		newVanStop.estTime = [3];
		    		campusVanStops.push(newVanStop);
		    	}
		    }
		});	

	    function attachPopup(feature, layer) {
	        layer.bindPopup(feature.properties.name + " - " + feature.properties.loc);
	    }
	}	
	// console.log(campusVanStops);

	$("userInput").niceScroll({mousescrollstep:40, hidecursordelay: 200, scrollspeed: 40, cursorwidth: 7, cursorcolor: "#157195", cursoropacitymax: .7, cursoropacitymin: .3});
	initialize();
	drawCampus();
	drawVanStops();

});