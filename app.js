$(document).ready(function() {

	var map;
	function initialize() {
	    var mapOptions = {
	      zoom: 16,
	      center: {lat: 42.292, lng: -71.3059},
	      mapTypeId: 'roadmap'
	    };

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
		    	buildings = data.features;
		    	for (var building in buildings) {
		    		newBuilding = {};
		    		newBuilding.title = buildings[building].properties["NAME"];
		    		newBuilding.outline = buildings[building].geometry.coordinates;
		    		newBuilding.marker = new L.geoJson(buildings[building], {color: "#e1ba40", weight: 2, onEachFeature: attachPopup});
		    		newBuilding.marker.on('mouseover', function(e) {
		    			this.openPopup();
		    		});
				  	newBuilding.marker.on('mouseout', function(e) {
				  		this.invoke('closePopup');
				  	});		    		
		    		newBuilding.marker.addTo(map);
		    		campusBuildings.push(newBuilding);
		    	}		    	
		    }
		});	
	    function attachPopup(feature, layer) {
	        layer.bindPopup("<strong>BUILDING</strong><br>" + feature.properties["NAME"]);
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
		    		newVanStop = {};
		    		newVanStop.title = vanstops[vanstop].properties.name;
		    		newVanStop.outline = vanstops[vanstop].geometry.coordinates.reverse();
		    		newVanStop.times = [vanstops[vanstop].properties.timeEarly, vanstops[vanstop].properties.timeLate];
		    		newVanStop.loc = vanstops[vanstop].properties.loc;
		    		newVanStop.picture = vanstops[vanstop].properties.picture;
		    		newVanStop.marker = new L.circleMarker(newVanStop.outline, {color: '#ad3ccc', fillColor: '#ad3ccc', radius: 12, weight: 12}).bindPopup("<strong>VAN STOP</strong><br>" + newVanStop.title + "<br>" + vanstops[vanstop].properties.loc);
				  	newVanStop.marker.on('mouseover', function(e) {
				  		this.setRadius(20);
				  		this.openPopup();
				  	});
				  	newVanStop.marker.on('mouseout', function(e) {
				  		this.setRadius(10);
				  		this.closePopup();
				  	});
				  	newVanStop.marker.on('click', function(e) {
				  		$("#userInput").empty();
				  		for (var marker in allVanStopMarkers) {
				  			if (e.target == allVanStopMarkers[marker]) {
				  				vanstop = campusVanStops[marker];
				  				name = vanstop.title;
				  				timeEarly = vanstop.times[0][1];
				  				estimate = vanstop.estTime;
				  				img = vanstop.picture;
				  				infoToDisplay = "<p id='display' style='font-weight: bold; color: #126180; font-size: 20px; margin-bottom: 15px'><span style='font-size: 24px'>WELLESLEY COLLEGE</span> <br> ACCESS VAN </p>"
				  				infoToDisplay += "<div id='info'><p style='font-size: 18px; color: #126180; margin-bottom: 10px'>Info for Van Stop:</p><p><strong>" + name + "</strong><br><em>" + newVanStop.loc + "</em></p>";
				  				if (img.length > 0) {
				  					infoToDisplay += "<img class='pic' src='" + img + "'/>"; 
				  				}
				  				randomTime = Math.floor(Math.random(1)*16);
				  				dictOfTimes = {
				  					0: ["06", timeEarly, "PM"],
				  					1: ["06", String(parseInt(timeEarly)+30), "PM"],
				  					2: ["07", timeEarly, "PM"],
				  					3: ["07", String(parseInt(timeEarly)+30), "PM"],
				  					4: ["08", timeEarly, "PM"],
				  					5: ["08", String(parseInt(timeEarly)+30), "PM"],
				  					6: ["09", timeEarly, "PM"],
				  					7: ["09", String(parseInt(timeEarly)+30), "PM"],
				  					8: ["10", timeEarly, "PM"],
				  					9: ["10", String(parseInt(timeEarly)+30), "PM"],
				  					10: ["11", timeEarly, "PM"],
				  					11: ["11", String(parseInt(timeEarly)+30), "PM"],
				  					12: ["12", timeEarly, "AM"],
				  					13: ["12", String(parseInt(timeEarly)+30), "AM"],
				  					14: ["01", timeEarly, "AM"],
				  					15: ["01", String(parseInt(timeEarly)+30), "AM"]
				  				};				  				

				  				function setLateOrEarly() {
				  					prob = Math.random(1);
				  					if (prob < 0.5) {
				  						return ["#ea666e", "late"];
				  					}
				  					else {
				  						return ["#96ee82", "early"];
				  					}
				  				}
				  				lateOrEarly = setLateOrEarly();
				  				infoToDisplay += "<p>Scheduled arrival time: " + dictOfTimes[randomTime][0] + ":" + dictOfTimes[randomTime][1] + " " + dictOfTimes[randomTime][2] + "</p>";
				  				infoToDisplay += "<p>Estimated time until arrival: <span style='color:" + lateOrEarly[0] + "'>" + String(Math.ceil(Math.random(1)*5)) + " min " + lateOrEarly[1] + "</span></p></div>";
				  				$("#userInput").append(infoToDisplay);
				  			}
				  		}
				  	});
		    		allVanStopMarkers.push(newVanStop.marker);
		    		newVanStop.marker.addTo(map);	    		
		    		campusVanStops.push(newVanStop);		    		
		    	}
		    	drawInitialSchedule(campusVanStops);		    	
		    }
		});
	}

	function drawInitialSchedule(stops) {
		for (var i = 0; i < stops.length; i++) {
			stop = stops[i];
			scheduleToDisplay = "<tr>";
			scheduleToDisplay += "<td>" + stop.title + "<br><em>" + stop.loc + "</em></td><td>" + stop.times[0][0] + ":" + stop.times[0][1] + " " + stop.times[0][2] + "</td><td>" + stop.times[1][0] + ":" + stop.times[1][1] + " " + stop.times[1][2] + "</td></tr>";
			$("#schedule tbody").append(scheduleToDisplay);
		}
	}

	initialize();
	drawCampus();
	drawVanStops();
});