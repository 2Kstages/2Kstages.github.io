//**************************************************
//**************************************************
//Common Class
Common = function() {
	
	//Canvas dimensions on page [repeated in css]
	this.CANVAS_WIDTH = 617;
	this.CANVAS_HEIGHT = 307;
	
	// worldMap image
	var worldMapReady = false;
	this.worldMapImage = new Image();
	this.worldMapImage.onload = function () {
		worldMapReady = true;
	};
	this.worldMapImage.src = "gfx/DreddWorldMap.jpg";
	
	//variables for inset rectangle on main map
	//(get set inside the initPage function)
	this.recW = 0;
	this.recH = 0;
}

//init page
Common.prototype.initPage = function(){ 

	//Determine correct size (width, height) for the mini-rectangle
	//moved this from base of Common definitions because it registered zero from the image
	this.recW = this.CANVAS_WIDTH / this.worldMapImage.width * this.CANVAS_WIDTH;
	this.recH = this.CANVAS_HEIGHT / this.worldMapImage.height * this.CANVAS_HEIGHT;

	//initialize both canvas elements
	canvasMap.init();
	canvasBit.init();
}

//get mouse coords on page
Common.prototype.mouseCoords = function(e){ 
	return {x: e.pageX, y: e.pageY};
}

/*
//return random integer between lower & upper bounds
Common.prototype.randInt = function(lower, upper){
    lower = parseInt(lower); //forcing lower to be a number
	return (Math.floor(Math.random()*(upper-lower+1)))+lower;
}
*/

//is point in rectangle?
Common.prototype.isPointInBox = function(point, boxLoc, boxDim){ 
	if( ( point.x > boxLoc.x && point.x < (boxLoc.x + boxDim.w) ) &&
		( point.y > boxLoc.y && point.y < (boxLoc.y + boxDim.h) ) ){
		return true;
	}
	else{
		return false;
	}
}

//**************************************************
//**************************************************
//Coords Class
Coords = function(x, y) {
	this.x = x || 0;
	this.y = y || 0;
}

//set coords
Coords.prototype.setCoords = function(coords){ 
	this.x = coords.x;
	this.y = coords.y;
}

//**************************************************
//**************************************************
//Canvas Class
Canvas = function(id) {
	this.ctx;						//to hold canvas context
	this.canvasElement;				//to hold element identifier
	this.id = id;					//store canvas id from html-arg
	
	this.offset = new Coords();		//Canvas location on page
	this.mouseLoc = new Coords();	//Mouse location on Canvas
	this.dragOn = false;			//are we dragging w. mousedown?
	this.mouseOn = false;			//is the mouse on Canvas?
}

//initialize the canvas map
Canvas.prototype.init = function(){ 

	this.canvasElement = document.getElementById(this.id);
	this.setDimensions({width: common.CANVAS_WIDTH, height: common.CANVAS_HEIGHT});
	var self = this; //required for registering event handlers
	
	//Sanity check (does the canvas exist?)
	if (this.canvasElement.getContext){
		this.ctx = this.canvasElement.getContext('2d');
		this.clearCanvas();
		
		switch(this.id)
		{
			case "worldMap":  
				this.drawBigMap();
				this.drawMiniRect(0, 0, common.recW, common.recH);
				document.onmousedown = 	function(e){ e.stopPropagation(); self.checkPos(e); self.dragON(e); };
				document.onmousemove = 	function(e){ e.stopPropagation(); self.checkPos(e); self.checkDrag(e); };
				document.onmouseup = 	function(e){ e.stopPropagation(); self.checkPos(e); self.dragOFF(e); };	
			break;
				
			case "mapBit": 
				this.ctx.drawImage(common.worldMapImage, 0, 0); 
				linkMap.drawAreas(0, 0);
			break;
		}
		
		//Set canvas offsets
		this.offset.setCoords({x: this.canvasElement.parentElement.offsetLeft, y: this.canvasElement.parentElement.offsetTop});
	}
}

Canvas.prototype.checkPos = function(e){
	//first check we are inside the canvas
	if(common.isPointInBox(common.mouseCoords(e), this.offset, {w: this.canvasElement.width, h: this.canvasElement.height}))
	{
		this.mouseOn = true;
		this.getMouseCoords(e);
		//console.log("(" + this.mouseLoc.x + "," + this.mouseLoc.y + ")");
	}	
	else
	{
		this.mouseOn = false;
	}
}
Canvas.prototype.checkDrag = function(e){ 
	//Are we dragging? Is the mouse inside the Canvas?
	if(this.dragOn && this.mouseOn){
		this.calcMiniRect();
	}
}

Canvas.prototype.dragON = function(e){ 
	if(this.mouseOn){
		this.dragOn = true;
		this.calcMiniRect();
	}
}

Canvas.prototype.dragOFF = function(e){ 
	this.dragOn = false;
}

//get mouse coords within canvas
Canvas.prototype.getMouseCoords = function(e){
	var mouseCoords = common.mouseCoords(e);
	this.mouseLoc.setCoords({x: (mouseCoords.x - this.offset.x), y: (mouseCoords.y - this.offset.y)});
}

//set dimensions of canvas
Canvas.prototype.setDimensions = function(dimensions){
	this.canvasElement.width = dimensions.width;
	this.canvasElement.height = dimensions.height;
}

//clear the canvas to all white
Canvas.prototype.clearCanvas = function(){ 
	this.ctx.fillStyle = "white";
	this.ctx.fillRect(0, 0, common.CANVAS_WIDTH, common.CANVAS_HEIGHT);
}

//---
Canvas.prototype.drawBigMap = function(){ 
	var sx = 0; //xOffset inside original image
	var sy = 0; //yOffset inside original image
	var sW = common.worldMapImage.width; //width inside original to copy
	var sH = common.worldMapImage.height; //height inside original to copy
	var dx = 0; //where to draw in canvas, x
	var dy = 0; //where to draw in canvas, y
	var dW = common.CANVAS_WIDTH; //width to draw selection at
	var dH = common.CANVAS_HEIGHT;//height to draw selection at

	this.ctx.drawImage(common.worldMapImage, sx, sy, sW, sH, dx, dy, dW, dH);
}

//---
Canvas.prototype.calcMiniRect = function(){ 
	
	//1. Draw a rectangle on the map, centered on the mouse BUT within bounds
	
	//Determine correct size (width, height) for the rectangle
	var recW = common.recW;
	var recH = common.recH;
	
	//Determine correct top left location for the rectangle
	var recX = this.mouseLoc.x - (recW/2);
	var recY = this.mouseLoc.y - (recH/2);
	
	//Correct for bounds
	if(recX < 0) {recX = 0;}
	else if(recX + recW > common.CANVAS_WIDTH) {recX = common.CANVAS_WIDTH - recW;}
	if(recY < 0) {recY = 0;}
	else if(recY + recH > common.CANVAS_HEIGHT) {recY = common.CANVAS_HEIGHT - recH;}
	
	this.drawMiniRect(recX, recY, recW, recH);
	
	//2. Redraw the second Canvas to match the rectangle of the first Canvas
	var xScale = common.worldMapImage.width / common.CANVAS_WIDTH;
	var yScale = common.worldMapImage.height / common.CANVAS_HEIGHT;
	var blowX = -recX*xScale; //shifted x coordinate for top left corner of blow-up scale map
	var blowY = -recY*yScale; //shifted y coordinate for top left corner of blow-up scale map
	
	canvasBit.ctx.beginPath();
		//drawing over the previous frame
		canvasBit.ctx.fillStyle = "white";
		canvasBit.ctx.fillRect(0, 0, common.CANVAS_WIDTH, common.CANVAS_HEIGHT);
		canvasBit.ctx.drawImage(common.worldMapImage, blowX, blowY);
		
		//move the image that contains the map element 
		//to match the position of the visible drawn image
		$("#mapBitHolder img").css("left", blowX);
		$("#mapBitHolder img").css("top", blowY);
		linkMap.drawAreas(blowX, blowY);
	canvasBit.ctx.closePath();
}

//---
Canvas.prototype.drawMiniRect = function(recX, recY, recW, recH){ 
	this.clearCanvas();
	this.drawBigMap();
	
	//Draw rectangle on top of map
	this.ctx.strokeStyle = "red";
	this.ctx.lineWidth = 2;
	
	this.ctx.beginPath();
	this.ctx.rect(recX, recY, recW, recH);
	this.ctx.stroke();
	this.ctx.closePath();
	
	this.ctx.beginPath();
	this.ctx.arc(recX + recW/2, recY + recH/2, recW/35, 0, 2*Math.PI);
	this.ctx.stroke();
	this.ctx.closePath();
}

//**************************************************
//**************************************************
//linkMap Class
var LinkMap = function(){
	this.oLinkMap={
		//"---":[[[[,],[,]]]],
		"anc":[[[1344,750],[1346,748],[1351,750],[1356,746],[1372,750],[1371,761],[1366,761],[1365,759],[1351,759],[1351,757],[1348,756]]],
		"brc":[[[642,204],[649,196],[657,194],[661,194],[670,189],[673,189],[672,194],[674,194],[674,198],[669,200],[653,202],[651,205]]],
		"cah":[[[652,159],[655,160],[655,164],[656,164],[656,167],[655,168],[649,168],[647,165]]],
		"cib":[[[379,646],[388,646],[389,644],[395,644],[395,642],[405,643],[405,648],[399,653],[396,653],[393,656],[393,660],[390,660],[386,657],[386,653],[381,650]]],
		"com":[[[282,433],[287,424],[292,433]]],
		"hot":[[[1210,357],[1214,351],[1218,357]]],
		"mur":[[[628,192],[628,190],[630,188],[633,187],[634,186],[633,185],[634,183],[640,183],[640,188],[638,190],[635,190],[633,192]]],
		//"sc2":[[[[1198,357],[1196,350],[1189,350],[1186,348],[1186,345],[1195,344],[1200,342],[1204,342],[1209,345],[1214,345],[1214,347],[1219,347],[1219,349],[1213,350],[1210,353],[1205,353]]]],
		"urc":[[[127,151],[133,162],[121,162]]]
		};
	this.oLinkName={
		//'---':'',							//see https://judgedredd.fandom.com/wiki/Category:Locations
		'anc':'Antarctic City',				
		'brc':'Brit-Cit',					//see https://judgedredd.fandom.com/wiki/Brit-Cit
		'cah':'Cal-Hab',					
		'cib':'Ciudad Barranquilla',		
		'com':'Comuna 13',					//see https://judgedredd.fandom.com/wiki/Comuna_13
		//'em1':'East-Meg One',				//not in SVG, The Inspectre, Orlok, Agent of East-Meg One, see https://judgedredd.fandom.com/wiki/East_Meg_One
		//'em2':'East-Meg Two',				//not in SVG, Red Razors, see https://judgedredd.fandom.com/wiki/East-Meg_Two
		//'hoc':'Hondo City',				//not in SVG, Shimura, Inaba, Hondo City Justice, Judge Dredd [Our Man in Hondo] - 1989, see https://judgedredd.fandom.com/wiki/Hondo_City
		'hot':'Hong Tong',					//see https://judgedredd.fandom.com/wiki/Hong_Tong
		//'mfz':'Mongolian Free Zone'		//not in SVG (aka Mongolian Exclusion Zone, Mongolian Free State), The Returners [Chandhu], see https://2000ad.fandom.com/wiki/Mongolian_Free_State			
		'mur':'Murphyville',				//Judge Dredd [Emerald Isle] - 1991, see https://judgedredd.fandom.com/wiki/Murphyville
		//'nui':'Nu-Iceland', 				//not in SVG, Havn
		//'sc2':'Sino-Cit Two',				//see https://judgedredd.fandom.com/wiki/Sino_Block
		//'smc':'Sydney-Melbourne Conurb',	//not in SVG, Chopper, O'Rork, see https://judgedredd.fandom.com/wiki/Oz_(2000_AD)
		'urc':'Uranium City'				//Judge Dredd [The Forsaken]
		//'vac':'Vatican City' 				//not in SVG, Devlin Waugh, see https://judgedredd.fandom.com/wiki/Vatican_City
		
		//Mictlan - Teotihuacan				//Missionary Man: Place of the Dead
		//Brazil into Argentina				//Ant Wars
		//Machu Picchu - Zancudo Picchu		//Zancudo
		//Guatemala							//Judge Dredd [Guatemala]
		};
		
		//? - what about ++OFF-PLANET++
		//? - what about ++DEADWORLD++
		//Present off-world locations as circular planet/moon graphics at right of the map
			//Luna-1:		Breathing Space
			//Titan:		Purgatory
			//Deadworld:	Young Death, Dreams/The Fall/Visions ... of Deadworld
			//Space Corps:	The Corps, Maelstrom
			//SJS:			Insurrection, Lawless
			//[random]:		Pussyfoot 5, Judge Planet
			//[other]:		The Kleggs, Dominion, The Torture Garden, Blunt
			
			//see https://judgedredd.fandom.com/wiki/Space_Corps
			
		//NEW NOTES:
		//Vatican City	Devlin Waugh (Swimming in Blood, Chasing Herod, Reign of Frogs, Sirius Rising, Blood Debt)
		//Aquatraz		Devlin Waugh (Swimming in Blood)
		//MC-1			Devlin Waugh (Brief Encounter)
		//Brit-Cit		Devlin Waugh (Chasing Herod, Vile Bodies, All Hell)
		//Cannes		Devlin Waugh (Chasing Herod)
		//Bahrain		Devlin Waugh (Chasing Herod)
		//Fortress Neuschwanstein, Bavarian Alps	Devlin Waugh (Chasing Herod)
		//Timbuk2		Devlin Waugh (Chasing Herod, Reign of Frogs)
		//Indo-City		Devlin Waugh (Reign of Frogs)
		//Uplands of Ahmadabad, Saraswati River		Devlin Waugh (Reign of Frogs)
		//Rose Island (Eastern Samoa): Devlin Waugh (Reign of Frogs, All Hell)
		//Bahamas: Devlin Waugh (Reign of Frogs)
		//Bahamas (Fangland, Andros Island): Devlin Waugh (Red Tide)
		//Arctic Circle / North Pole / Ice Station Zulu: Devlin Waugh (Sirius Rising)
		//The Phillipines (giant volcano): Devlin Waugh (Sirius Rising)
		//The French Riviera, Mecca, Urbar: Devlin Waugh (A Mouthful of Dust) 
		//Jiangsu Province, China (Devlin Waugh: All Hell)
		//The Radlands of Ji (Devlin Waugh: All Hell)
		//Sino-Cit Two (Devlin Waugh: All Hell)
		//Kowloon (Devlin Waugh: All Hell)
		//Sino-Tibetan border, Kamrup (Devlin Waugh: All Hell)
		//Kilimanjaro, Pan Africa (Devlin Waugh: Innocence & Experience)
		//Monaco, Meditteranean Free State (Devlin Waugh: Innocence & Experience)
		//Kem-Kwong Monastery (Devlin Waugh: Innocence & Experience)
		//Machu Picchu (Devlin Waugh: Innocence & Experience)
		//Eton (Devlin Waugh: Innocence & Experience)
		//Lisbon (Devlin Waugh: Kiss of Death)
		//The Lost City of Grok (Devlin Waugh: Kiss of Death)
		
		//Interstellar
			//The Sirius System: Devlin Waugh (Sirius Rising)
			
		//Interdimensional	
			//The Chasm of Perpetual Delight and Endless Sorrow:	(Devlin Waugh: Blood Debt)
		
		
	//notes on structure
	//the first blank '' is designed for a potential sub-title, in case of multiple lists of data
	this.oLinkStories={
		//'---':['',  ['', '']],
		'anc':[['x',['Hershey', 'Hershey/data', 'The Cold in the Bones'],
					['Wynter', 'OneOffs/Dreddverse']],
			   ['Antarctica Territories',	
					['Judge Dredd', 'JudgeDredd/1995', 'Crusade']]], 
		'brc':[['',	['Armitage', 'Armitage/data'],
					['Brit-Cit Babes', 'BritCitBabes/data'],
					['Brit-Cit Brute', 'BritCitBrute/data'],
					['Culling Crew', 'OneOffs/Dreddverse'],
					['Diamond Dogs', 'DiamondDogs/data'],
					['The Returners', 'Returners/data', 'Heartswood'],
					['Storm Warning', 'StormWarning/data'],
					['Strange & Darke', 'Strange&Darke/data'],
					['Treasure Steel', 'TreasureSteel/data']]],
		'cah':[['', ['Calhab Justice', 'CalhabJustice/data'],
					['Judge Dredd', 'JudgeDredd/2001', 'Bodies of Evidence'],
					['Judge Dredd', 'JudgeDredd/1998', 'Headbangers']]],
		'cib':[['x',['Hershey', 'Hershey/data', 'The Brutal'],
					['The Returners', 'Returners/data', 'Irmazhina']],
			   ['Paran&aacute; River Valley',	
					['The Returners', 'Returners/data', 'Amazonia']],
			   ['Judge Dredd',	
					['Banana City', 'JudgeDredd/1989', '2111'],
					['Monsterus Mashinashuns...', 'JudgeDredd/2005', '2127'], //The Monsterus Mashinashuns of P.J. Maybe
					['Regime Change', 'JudgeDredd/2006', '2128'],
					['Mega-City Confidential', 'JudgeDredd/2014', '2136'],
					['Desperadlands', 'JudgeDredd/2021', '2143']]],
		'com':[['',	['Hershey', 'Hershey/data', 'Disease']]], 
		'hot':[['', ['Johnny Woo', 'JohnnyWoo/data']]],
		'mur':[['',	['Judge Joyce', 'JudgeJoyce/data']]],
		'urc':[['',	['Harmony', 'Harmony/data']]]
		};
		
	this.listHTML = [];		
}

//click functionality on area elements
LinkMap.prototype.initClicks = function(){
	//set
	$("map#mapBitActiveLayer area")
		.click(function(){ 
			var code = $(this).attr("id");
			linkMap.drawData(code); 
		});
}

//...
LinkMap.prototype.drawData = function(code){
	var locale = linkMap.oLinkName[code];
	$("h2#localeHeader").html(locale);
	
	var listing = linkMap.oLinkStories[code];
	
	//clear up previous lists
	$(".storyList").remove();
	$("h3").remove();
	
	if(listing[0][0] != '')
	{
		//you have multiple lists
		for (var i = 0, iLen = listing.length; i < iLen; i++) {
			if(listing[i][0] == 'x')
			{
				linkMap.makeList(listing[i]);
			}
			else
			{
				this.listHTML.push(['<h3>', listing[i][0], '</h3>'].join(''));
				linkMap.makeList(listing[i]);
			}
		}
	}
	else
	{
		//you just have one list of stories
		linkMap.makeList(listing[0]);
	}
	
	$("h2#localeHeader").after(this.listHTML.join(''));
	this.listHTML = [];

}

//...
LinkMap.prototype.makeList = function(listing){
	this.listHTML.push('<ul class="storyList">');
		
	for (var i = 1, iLen = listing.length; i < iLen; i++) {
		this.listHTML.push(['<li><a href="../', listing[i][1], '.html">', listing[i][0], '</a>'].join(''));
		
		if(listing[i].length == 3) { //there's a sub-title to add
			this.listHTML.push([' [', listing[i][2], ']'].join(''));
		}
		this.listHTML.push('</li>');
	}
	
	this.listHTML.push('</ul>');
}
	
//draw the areas function
LinkMap.prototype.drawAreas = function(blowX, blowY){
	
	var country;
	var areaMap = [];	//collection of area elements
	
	//sLinkCode is just the string portion before the coords array
	for (var sLinkCode in this.oLinkMap) {
		
		var locale = this.oLinkMap[sLinkCode]; //gets the array of coords
		
		//if(sLinkCode == "mur") {console.log("Got mur");}
		
		//draw a single path on the Canvas
		for (var iPath = 0, iPathLen = locale.length; iPath < iPathLen; iPath++) {
		
			//used for the html area elements for inside the html map
			var areaArray = []; //area coords
			var areaHTML = [];	//for a single area element
		
			//get the first (x,y) in the list
			var startX = locale[iPath][0][0] + blowX;
			var startY = locale[iPath][0][1] + blowY;
		
			//move to start position for drawing on the canvas
			canvasBit.ctx.moveTo(startX, startY);
			areaArray.push(startX - blowX, startY - blowY); //populate first coord
			
			//nested loop because there are two coordinates
			for (var iCoord = 1, iCoordLen = locale[iPath].length; iCoord < iCoordLen; iCoord++) {
				
				var nextX = locale[iPath][iCoord][0];
				var nextY = locale[iPath][iCoord][1];
				
				canvasBit.ctx.lineTo(nextX + blowX, nextY + blowY);
				areaArray.push(nextX, nextY); //populate the rest of the coords
			}
			
			//close the loop, as otherwise there will be a segment missing
			//from last vertex to start vertex
			canvasBit.ctx.lineTo(startX, startY);
			canvasBit.ctx.strokeStyle = "red";
			canvasBit.ctx.stroke();
			
			//creating the HTML
			areaHTML = [
				'<area ',
					'shape="poly" ',
					'coords ="', areaArray.join(','), '" ',
					'href="javascript: void(0);" ',
					'id="', sLinkCode, '" />'].join('');
			areaMap.push(areaHTML);
			
			//clear for next loop
			areaHTML = [];
			areaArray = [];
		}
	}
	
	document.getElementById("mapBitActiveLayer").innerHTML = "";
	document.getElementById("mapBitActiveLayer").innerHTML = areaMap.join('');
	this.initClicks();
}


//**************************************************
//**************************************************
//Finally, executing some code:

var common = new Common();
var linkMap = new LinkMap();
var canvasMap = new Canvas("worldMap");
var canvasBit = new Canvas("mapBit");	

window.onload = function(){
	common.initPage();
}