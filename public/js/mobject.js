var flightlist = [];
var selectFlight = null;
var svgmap = null;
var graph = null;
var graphData = {
	labels: [],
	datasets: [
        {
            label: "Alititude(10ft)",
            fillColor: "rgba(220,220,220,0.2)",
            strokeColor: "rgba(220,220,220,1)",
            pointColor: "rgba(220,220,220,1)",
            pointStrokeColor: "#fff",
            pointHighlightFill: "#fff",
            pointHighlightStroke: "rgba(220,220,220,1)",
            data: []
        }
    ]
};

var config = {
	flightListHeader: {
		hexident: "ICAO",
		callsign: "Callsign",
		altitute: "Altitute/ft",
		groundspeed: "GS/kts",
		track: "Track"
	},
	graph_point_num: 30,
	airport: 'ZGSZ',
	airport_map:{
		width: 738,
		height: 541,
		minLat: 113.74469138018,
		maxLat: 113.870538095815,
		minLong: 22.6000570852171,
		maxLong: 22.6852000355079
	},
	filter:{
		altitude: "<100", //ft
	}
};

function createFlightListHeader(){
	str = "<thead><tr>";

	for(var key in config["flightListHeader"]) {
		str += "<td>" + config["flightListHeader"][key] + "</td>"
	}

	str += "</tr></thead>"

	return str;
}

function handlerDataGram(arr) {
	for(var i = 0; i < arr.length; i++) {
		type = arr[i].dgtype;
		hexident = arr[i].hexident;

		switch(type) {
			case 'MSG':
				processMSG(arr[i]);
				break;
			case 'AIR':
				processAIR(arr[i]);
				break;
			case 'ID':
				processID(arr[i]);
				break;
			case 'SEL':
				processSEL(arr[i]);
				break;
			default:
				processOther(arr[i]);
		}
	}
}

function processMSG(datagram){
	hexident = datagram.hexident;
	subMsgType = datagram.transmission_type;

	targetMsg = flightIdx(datagram.hexident);
	if(targetMsg == null) 
		flightlist.push(datagram);
	else
		updateMsg(datagram, targetMsg);

	//bindData();
	//$("#detail").text(icao);
	bindFlightList();

	switch(subMsgType) {
		case "1":
			break;
		case "2":
			altitudeGraphBind();
			createOrMovePlane(hexident, datagram.lat, datagram.long);
			doTrack();
			break;
		case "3":
			altitudeGraphBind();
			createOrMovePlane(hexident, datagram.lat, datagram.long);
			doTrack();
			break;
		case "4":
			verticalSpeedBind();
			airspeedBind();
			doTrack();
			break;
		case "5":
			altitudeBind(); 
			altitudeGraphBind(); 
			break;
		case "6":
			altitudeBind(); 
			altitudeGraphBind();
			break;
		case "7":
			altitudeBind(); 
			altitudeGraphBind();
			break;
		case "8":
			break;
		default:
	}
}

function processAIR(dg){

}

function processID(dg){

}

function processSEL(dg){

}

function processOther(dg){

}

function updateMsg(srcMsg, targetMsg){
	flag = false;

	if(targetMsg == null) return flag;

	for(var key in srcMsg) {
		if(srcMsg[key] == '' || srcMsg[key] == undefined) continue;
		if(srcMsg[key] == targetMsg[key]) continue;

		targetMsg[key] = srcMsg[key];
		flag = true
	}

	return flag;
}

function flightIdx(icao){
	for(var i=0; i<flightlist.length; i++){
		if(flightlist[i].hexident == icao)
			return flightlist[i];
	}

	return null;
}

function findFlightByHexIdent(icao){
	for(var i=0; i<flightlist.length; i++){
		if(flightlist[i].hexident == icao) return flightlist[i]
	}

	return null;
}

function updateFlightList(targetMsg){

}

function buildDataGram(str, firstSep, secondSep){
	arr = [];

	datagramArr = str.split(firstSep);
	var singleGram;
	for(var i = 0; i < datagramArr.length; i++){
		singleGram = new Datagram(datagramArr[i].split(secondSep));
		arr[i] = singleGram;
	}
	return arr;
}

function bindData(){
	bindFlightList();
	flightDetailBind();
	bindSvg();
}

//
function bindFlightList(){
	str = "";
	for(var i=0; i<flightlist.length; i++){
		str += "<tr id='" + flightlist[i]["hexident"] + "'>";
		for(var key in config['flightListHeader']){
			if(key in flightlist[i]){
				str += "<td id = '" + key + "'>" + flightlist[i][key] + "</td>";;
			}
		}
		str += "</tr>"
	}
	$('#flightlist>tbody').html(str);

	initSelectFlight();
	FlightTrClickEvent();
}

function FlightTrClickEvent(){
	$("#flightlist>tbody tr").click(function(){
		if($(this).attr("id") == selectFlight) return;

		selectFlight = $(this).attr("id");
		clearGraphData(selectFlight);
		bindData();
	});
}

function clearGraphData(selectFlight){
	while(graph.datasets[0].points.length > 0){
		graph.removeData();
	}
}

function bindSvg(){

}

function getFlightListString(){
	str = "[";

	if(flightlist.length == 0) return "[]";

	for(var i = 0; i < flightlist.length - 1; i++){
		str += JSON.stringify(flightlist[0]) + ",";
	}

	str += JSON.stringify(flightlist[flightlist.length - 1]) + "]";

	return str;
}

function initFlightDetails(){
	$("#VerticalSpeedIndicator").knob({
		'min': -100,
		'max': 100,
		'angleOffset': 90,
		'cursor': 4,
		'width': '30px',
		'thickness':'.3',
		'displayPrevious':true,
		'readOnly': true,
		'format': function(v){ return v + "ft/m"; }
	});

	$("#AltitudeIndicator").knob({
		'min': 0,
		'max': 30000,
		'angleOffset': 0,
		'width': '30px',
		'thickness':'.3',
		'readOnly': true,
		'format': function(v){ return v + "ft"; }
	});

	$("#AirSpeedIndicator").knob({
		'min': 0,
		'max': 500,
		'angleOffset': 0,
		'width': '30px',
		'thickness':'.3',
		'readOnly': true,
		'format': function(v){ return v + 'kts'; }
	});

	initGraph();
}

function initGraph(){
	var ctx = $("#alititudeGraph").get(0).getContext("2d");
	graph = new Chart(ctx).Line(graphData, {
		scaleShowGridLines : false,
		pointDot : false,
		scaleShowLabels:false
	});
}

function initSelectFlight(){
	if(selectFlight == null && flightlist.length > 0) {
		selectFlight = flightlist[0]['hexident'];
		verticalSpeedBind();
		airspeedBind();
		altitudeBind();
		subFlightDetailBind();
	}
}

function flightDetailBind(){
	subFlightDetailBind(); //绑定航班子明细数据
	verticalSpeedBind();   //绑定垂直速度
	airspeedBind();        //绑定地面速度
	altitudeBind();        //绑定高度
	altitudeGraphBind();   //绑定高度趋势
}

function altitudeGraphBind(){
	flight = flightIdx(selectFlight);
	if(!flight) return;

	curr_data = graph.datasets[0].points.length;
	if(curr_data >= config['graph_point_num'])
		graph.removeData();
	//console.log(curr_data);

	if(flight['altitute'] != '')
		graph.addData([flight['altitute']], '');
}

function subFlightDetailBind(){
	flight = flightIdx(selectFlight);
	if(!flight) return;

	str = "";

	//icao
	str += buildUserDefinedKeyPair('ICAO', flight['hexident']);
	//CallSign
	str += buildUserDefinedKeyPair('CallSign', flight['callsign']);
	//route
	str += buildUserDefinedKeyPair('Route', '');
	//AC_REG
	str += buildUserDefinedKeyPair('ACREG', '');
	//Last Update Time
	loggedtime = flight['loggedtime'].substring(0, flight['loggedtime'].indexOf('.'))
	str += buildUserDefinedKeyPair('UTIME', loggedtime);

	$("#sub-detail").html(str);
}

function buildUserDefinedKeyPair(key, value){
	return '<div class="kv_item"><span class="f_key">' 
		+ key + '</span><span class="f_value">'
		+ value +'</span></div>';
}

function verticalSpeedBind(){
	$("#VerticalSpeedIndicator")
		.val(flightIdx(selectFlight)['vertical_rate'])
		.trigger("change");
}

function airspeedBind(){
	$("#AirSpeedIndicator")
		.val(flightIdx(selectFlight)['groundspeed'])
		.trigger("change");	
}

function altitudeBind(){
	$("#AltitudeIndicator")
		.val(flightIdx(selectFlight)['altitute'])
		.trigger("change");		
}

function createSVGMap(src){
	var embed = document.createElement('embed');
	embed.setAttribute('style', 'width: 100%; height: 100%;');
	embed.setAttribute('type', 'image/svg+xml');
	embed.setAttribute('id', 'svgmap');
	embed.setAttribute('src', src);

	document.getElementById('left').appendChild(embed)

	lastEventListener = function(){
	  svgPanZoom(embed, {
	    zoomEnabled: true,
	    minZoom: 2,
	    maxZomm: 20
	  });

	  svgmap = svgPanZoom("#svgmap");
	  svgmap.zoom(8);
	}
	embed.addEventListener('load', lastEventListener);

	return embed;
}

//new methods
function initSVGMap(){
	svgPanZoom("#svgmap", {
		zoomEnabled: true
	});

	svgmap = svgPanZoom("#svgmap");
	svgmap.zoom(2);
}

// asdb datagram
var Datagram = function(arr){
	var obj = new Object();

	obj.dgtype 				= 	arr[0];  //消息类型
	obj.transmission_type 	= 	arr[1];  //传输类型
	obj.sessionid 			= 	arr[2];  //自动生成session id,默认为111
	obj.aircraftid 			= 	arr[3];  //自动生成的飞机号,默认为11111
	obj.hexident 			= 	arr[4];  //16bit标识
	obj.flightid 			= 	arr[5];  //默认111111
	obj.genedate 			= 	arr[6];  //生成日期
	obj.genetime 			= 	arr[7];  //记录时间
	obj.loggeddate 			= 	arr[8];  //生成日期
	obj.loggedtime 			= 	arr[9];  //生成时间
	obj.callsign 			= 	arr[10]; //呼号,默认三字码eg: CSZ9005
	obj.altitute 			= 	arr[11]; //高度ft
	obj.groundspeed 		= 	arr[12]; //地速kts
	obj.track 				= 	arr[13]; //航向
	obj.lat 				= 	arr[15]; //经度
	obj.long 				= 	arr[14]; //纬度
	obj.vertical_rate 		= 	arr[16]; //垂直速度
	obj.squawk 				= 	arr[17]; //应答机编码? 
	obj.alert 				= 	arr[18]; //
	obj.emergency 			= 	arr[19];
	obj.spi 				= 	arr[20];
	obj.isonground 			= 	arr[21];

	return obj;
}