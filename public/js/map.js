function draw(){

}

function move(hexident, lat, long){
	var x, y;

	result = getXY(lat, long);
	if(!result) return;
	x = result[0];
	y = result[1];

	d3.select("#plane_" + hexident).attr("cx", x).attr("cy", y);
}

function drawPlane(){

}

function drawBay(){  
}

function doTrack(){

}

function createOrMovePlane(hexident, lat, long){
	if(d3.select("#plane_" + hexident).size() > 0){
		move(hexident, lat, long);
		return;
	}

	var r = 2;
	var color = "red";

	var x, y;
	result = getXY(lat, long);
	if(!result) return;
	x = result[0];
	y = result[1];

	d3.select("#Map")
	.append("circle")
	.attr("cx",x)
	.attr("cy", y)
	.attr("r", r)
	.attr("id", "plane_" + hexident)
	.style("fill", color);
}

function createBay(bayno, lat, long){
	var r = 0.5;
	var color = "black";

	var x, y;
	result = getXY(lat, long);
	if(!result) return;
	x = result[0];
	y = result[1];

	d3.select("#Map").append("circle")
	.attr("cx",x)
	.attr("cy", y)
	.attr("r", r)
	.attr("id", "bay_" + bayno)
	.style("fill", color);
}

function getXY(lat, long){
	if(!checkPoint(lat, long)) return false;
	svgconfig = config['airport_map'];

	xRate = svgconfig['width'] /(svgconfig['maxLat'] - svgconfig['minLat']);
	yRate = svgconfig['height'] / (svgconfig['maxLong'] - svgconfig['minLong']);

	x = (lat - svgconfig['minLat']) * xRate;
	y = (svgconfig['maxLong'] - long) * yRate;

	return [Math.round(x), Math.round(y)];
}

function checkPoint(lat, long){
	lat = parseFloat(lat);
	long = parseFloat(long);
	svgconfig = config['airport_map'];

	if(lat < svgconfig['minLat'] || lat > svgconfig['maxLat']) return false;
	if(long < svgconfig['minLong'] || long > svgconfig['maxLong']) return false;

	return true;	
}


// 初始化机位信息
function initBayZGSZ(){
	createBay('106', '113.81972222222223', '22.62966666666667');
	createBay('301', '113.81138888888889', '22.629055555555556');
	createBay('302', '113.8111111111111', '22.6295000');
	createBay('303', '113.81083333333333', '22.63');
	createBay('304', '113.81027777777777', '22.630083333333335');
	createBay('305', '113.81', '22.630166666666668');
	createBay('306', '113.80944444444444', '22.630111111111113');
	createBay('307', '113.80916666666667', '22.630055555555558');
}