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
				//geojsonLayer = L.geoJson(data, {onEachFeature: attachPopup}).addTo(map);		    	
		    	buildings = data.features;
		    	for (var building in buildings) {
		    		newBuilding = {};
		    		newBuilding.title = buildings[building].properties["NAME"];
		    		newBuilding.outline = buildings[building].geometry.coordinates;
		    		newBuilding.marker = new L.geoJson(buildings[building], {onEachFeature: attachPopup});
		    		newBuilding.marker.addTo(map);
		    		campusBuildings.push(newBuilding);
		    	}		    	
		    }
		});	
	    function attachPopup(feature, layer) {
	        layer.bindPopup(feature.properties["NAME"]);
	    }		
	}

	var campusVanStops = [];
	var allVanStopMarkers = [];
	function drawVanStops() {
		$.ajax({
		    type: "GET",
		    url: './vanstops.json',
		    dataType: 'json',
		    success: function (data) {		    	
		    	vanstops = data.features;
		    	for (var vanstop in vanstops) {
		    		//L.geoJson(vanstops[vanstop]).addTo(map);
		    		newVanStop = {};
		    		newVanStop.title = vanstops[vanstop].properties.name;
		    		newVanStop.outline = vanstops[vanstop].geometry.coordinates.reverse();
		    		newVanStop.times = [vanstops[vanstop].properties.timeEarly, vanstops[vanstop].properties.timeLate];
		    		newVanStop.estTime = 3;
		    		newVanStop.picture = vanstops[vanstop].properties.picture;
		    		newVanStop.marker = new L.circleMarker(newVanStop.outline, {color: 'purple', fillColor: 'purple', radius: 10, weight: 5, opacity: 1}).bindPopup(newVanStop.title + " - " + vanstops[vanstop].properties.loc);
				  	newVanStop.marker.on('mouseover', function(e) {
				  		this.openPopup();
				  	});
				  	newVanStop.marker.on('mouseout', function(e) {
				  		this.closePopup();
				  	});
				  	newVanStop.marker.on('click', function(e) {
				  		$("#userInput").empty();
				  		for (var marker in allVanStopMarkers) {
				  			if (e.target == allVanStopMarkers[marker]) {
				  				vanstop = campusVanStops[marker];
				  				name = vanstop.title;
				  				timeEarly = vanstop.times[0];
				  				estimate = vanstop.estTime;
				  				img = vanstop.picture;
				  				infoToDisplay = "<h1>Wellesley College Access Van</h1>";
				  				infoToDisplay += "<div><p class='userp'>" + name + "</p>";
				  				if (img.length > 0) {
				  					infoToDisplay += "<img src='" + img + "'/>"; 
				  				}
				  				randomTime = Math.floor(Math.random(1)*16);
				  				dictOfTimes = {
				  					0: ["06", convertToTwoDigits(String(timeEarly[1])), "PM"],
				  					1: ["06", String(timeEarly[1]+30), "PM"],
				  					2: ["07", convertToTwoDigits(String(timeEarly[1])), "PM"],
				  					3: ["07", String(timeEarly[1]+30), "PM"],
				  					4: ["08", convertToTwoDigits(String(timeEarly[1])), "PM"],
				  					5: ["08", String(timeEarly[1]+30), "PM"],
				  					6: ["09", convertToTwoDigits(String(timeEarly[1])), "PM"],
				  					7: ["09", String(timeEarly[1]+30), "PM"],
				  					8: ["10", convertToTwoDigits(String(timeEarly[1])), "PM"],
				  					9: ["10", String(timeEarly[1]+30), "PM"],
				  					10: ["11", convertToTwoDigits(String(timeEarly[1])), "PM"],
				  					11: ["11", String(timeEarly[1]+30), "PM"],
				  					12: ["12", convertToTwoDigits(String(timeEarly[1])), "AM"],
				  					13: ["12", String(timeEarly[1]+30), "AM"],
				  					14: ["01", convertToTwoDigits(String(timeEarly[1])), "AM"],
				  					15: ["01", String(timeEarly[1]+30), "AM"]
				  				};

				  				function convertToTwoDigits(string) {
				  					if (string.length == 1) {
				  						return "0" + string;
				  					}
				  					else {
				  						return string;
				  					}
				  				}

				  				function setLateOrEarly() {
				  					prob = Math.random(1);
				  					if (prob < 0.5) {
				  						return ["red", "late"];
				  					}
				  					else {
				  						return ["green", "early"];
				  					}
				  				}
				  				lateOrEarly = setLateOrEarly();
				  				infoToDisplay += "<p class='userp'>Scheduled arrival time: " + dictOfTimes[randomTime][0] + ":" + dictOfTimes[randomTime][1] + " " + dictOfTimes[randomTime][2] + "</p>";
				  				infoToDisplay += "<p class='userp " + lateOrEarly[0] + "'>Estimated time until arrival: " + String(Math.ceil(Math.random(1)*5)) + " min " + lateOrEarly[1] + "</p></div>";
				  				console.log(infoToDisplay);
				  				$("#userInput").append(infoToDisplay);
				  			}
				  		}
				  	});
		    		allVanStopMarkers.push(newVanStop.marker);
		    		newVanStop.marker.addTo(map);	    		
		    		campusVanStops.push(newVanStop);		    		
		    	}
		    }
		});
	}


	//$("userInput").niceScroll({mousescrollstep:40, hidecursordelay: 200, scrollspeed: 40, cursorwidth: 7, cursorcolor: "#157195", cursoropacitymax: .7, cursoropacitymin: .3});
	initialize();
	drawCampus();
	drawVanStops();

});