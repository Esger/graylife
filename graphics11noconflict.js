// JavaScript Document
var $j = jQuery.noConflict();
$j(document).ready(function($){
	var canvas = document.getElementById('thetoroid'); // The canvas where life is drawn
	var graphcanvas = document.getElementById('thegraph'); // The canvas where the graph is drawn
	var cellsize= $j('input[name=cellsizer]:checked').val(); // Width and heigth of a cell in pixels
	var spacewidth = (canvas.width / cellsize);
	var spaceheight = (canvas.height / cellsize);
	var numbercells = spacewidth * spaceheight; // Number of available cells
	var livecells; // Array with x,y coordinates of living cells
	var fillratio = $j('.fillratio').val(); // Percentage of available cells that will be set alive initially
	var startnumberlivecells = numbercells * fillratio / 100;
	var yscale = 3*graphcanvas.height/numbercells; //Ratio to apply values on y-axis
	var cellsalive; // Number of cells alive
	var neighbours; // Array with neighbours count
	var steps = 0; // Number of iterations / steps done
	var interval = 0; // Milliseconds between iterations
	var history; // Array of arrays with livecells
	var running = false;
	var liferules = [[],[]];
	
	// Set some variables
	function setspace() {
		cellsize = $j('input[name=cellsizer]:checked').val(); //Must be even or 1
		spacewidth = (canvas.width / cellsize);
		spaceheight = (canvas.height / cellsize);
		numbercells = spacewidth * spaceheight;
		fillratio = $j('.fillratio').val();
		startnumberlivecells = numbercells * fillratio / 100;
		cellsalive = startnumberlivecells;
	}
	
	// Empty the arrays to get ready for restart.
	function initarrays() {
		livecells = [];
		neighbours = [];
		history = [];
	}
	
	function initliferules() {
		var count
		for (count=0; count<9; count++) {
			liferules[0][count]=false;
			liferules[1][count]=false;
		}
		if ($j('#newlife0').is(":checked")) {liferules[0][0]=true;}
		if ($j('#newlife1').is(":checked")) {liferules[0][1]=true;}
		if ($j('#newlife2').is(":checked")) {liferules[0][2]=true;}
		if ($j('#newlife3').is(":checked")) {liferules[0][3]=true;}
		if ($j('#newlife4').is(":checked")) {liferules[0][4]=true;}
		if ($j('#newlife5').is(":checked")) {liferules[0][5]=true;}
		if ($j('#newlife6').is(":checked")) {liferules[0][6]=true;}
		if ($j('#newlife7').is(":checked")) {liferules[0][7]=true;}
		if ($j('#newlife8').is(":checked")) {liferules[0][8]=true;}
		if ($j('#staylife0').is(":checked")) {liferules[1][0]=true;}
		if ($j('#staylife1').is(":checked")) {liferules[1][1]=true;}
		if ($j('#staylife2').is(":checked")) {liferules[1][2]=true;}
		if ($j('#staylife3').is(":checked")) {liferules[1][3]=true;}
		if ($j('#staylife4').is(":checked")) {liferules[1][4]=true;}
		if ($j('#staylife5').is(":checked")) {liferules[1][5]=true;}
		if ($j('#staylife6').is(":checked")) {liferules[1][6]=true;}
		if ($j('#staylife7').is(":checked")) {liferules[1][7]=true;}
		if ($j('#staylife8').is(":checked")) {liferules[1][8]=true;}
	}
	
	// Erase the canvas
	function clearspace() {
		var ctx = canvas.getContext('2d');
		ctx.fillStyle = "rgb(255, 255, 255)";
		ctx.fillRect(0, 0, canvas.width, canvas.height);
	}

	// Erase the graph
	function cleargraph() {
		var ctx = graphcanvas.getContext('2d');
		ctx.fillStyle = "rgb(255, 255, 255)";
		ctx.fillRect(0, 0, canvas.width, canvas.height);
	}

	// Put new pair of values in array
	function Celxy(x, y) {
		this.x = x;
		this.y = y; 
	}
	
	// Fill livecells with random cellxy's
	function fillrandom() {
		var count;
		for (count = 0; count < startnumberlivecells; count++) {
			livecells[count] = new Celxy(Math.floor(Math.random() * spacewidth), Math.floor(Math.random() * spaceheight));
		}
		history[0] = livecells.slice();
	}
	
	// Fade the old screen a bit to white
	function fadeall() {
		var ctx = canvas.getContext('2d');
		if ($j('.trails').is(":checked")) {
			ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
		} else { ctx.fillStyle = "rgb(255, 255, 255)";
		}
		ctx.fillRect(0, 0, canvas.width, canvas.height);
	}
	
	// Fade the old graph a bit to white
	function fadegraph() {
		var ctx = graphcanvas.getContext('2d');
		ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
		ctx.fillRect(0, 0, graphcanvas.width, graphcanvas.height);
	}
	
	// Draw the array with livecells
	function drawcells() {
		var ctx = canvas.getContext('2d');
		var count;
		ctx.fillStyle = "rgb(128, 128, 0)";
		for (count in livecells) {
			ctx.fillRect(livecells[count].x * cellsize, livecells[count].y * cellsize, cellsize, cellsize);
		}
		cellsalive = livecells.length;
	}
	
	// Fill livecells with your own mouse drawing
	$j('#thetoroid').click( function(event) {
		mouseX = Math.floor((event.offsetX?(event.offsetX):event.pageX-this.offsetLeft)/cellsize);
		mouseY = Math.floor((event.offsetY?(event.offsetY):event.pageY-this.offsetTop)/cellsize);
		livecells[livecells.length] = new Celxy(mouseX, mouseY);
		history[steps] = livecells.slice();
		drawcells();
		updatedata();
	});
	 
	// Draw the array with livecells
	function drawgraph() {
		var ctx = graphcanvas.getContext('2d');
		ctx.fillStyle = "rgb(128, 128, 0)";
		ctx.fillRect(steps%graphcanvas.width,graphcanvas.height-cellsalive*yscale,1,1);
	}
	
	// Update the counter
	function updatedata() {
		$j('#teller').text(steps);
		$j('#cellsalive').text(cellsalive);
	}
	
	// Set all neighbours to zero
	function zeroneighbours() {
		var count;
		for (count = 0; count < numbercells; count++) {
			neighbours[count] = 0;
		}
	}
		
	// Tell neighbours around livecells they have a neighbour
	function countneighbours() {
		var count, thisx, thisy, dx, dy;
		for (count in livecells) {
			thisx = livecells[count].x;
			thisy = livecells[count].y;
			for (dy = -1; dy < 2; dy++) {
				for (dx = -1; dx < 2; dx++) {
					neighbours[((thisy + dy) * spacewidth + thisx + dx + numbercells)%numbercells]++;
				}
			}
			neighbours[thisy * spacewidth + thisx] += 9;
		}
	}
	
	// Evaluate neighbourscounts for new livecells
	function evalneighbours() {
		var count, thisx, thisy, count2 = 0;
		
		function livecell() {
			thisy = Math.floor(count / spacewidth);
			thisx = count - (thisy * spacewidth);
			livecells[count2] = new Celxy(thisx, thisy);
			count2++;
		}
		
		livecells = [];
		for (count = 0; count < numbercells; count++) {
			switch (neighbours[count]) {
			case 0:
				if (liferules[0][0] === true) {livecell();}
				break;
			case 1:
				if (liferules[0][1] === true) {livecell();}
				break;
			case 2:
				if (liferules[0][2] === true) {livecell();}
				break;
			case 3:
				if (liferules[0][3] === true) {livecell();}
				break;
			case 4:
				if (liferules[0][4] === true) {livecell();}
				break;
			case 5:
				if (liferules[0][5] === true) {livecell();}
				break;
			case 6:
				if (liferules[0][6] === true) {livecell();}
				break;
			case 7:
				if (liferules[0][7] === true) {livecell();}
				break;
			case 8:
				if (liferules[0][8] === true) {livecell();}
				break;
				
			case 9:
				break;
	
			case 10:
				if (liferules[1][0] === true) {livecell();}
				break;
			case 11:
				if (liferules[1][1] === true) {livecell();}
				break;
			case 12:
				if (liferules[1][2] === true) {livecell();}
				break;
			case 13:
				if (liferules[1][3] === true) {livecell();}
				break;
			case 14:
				if (liferules[1][4] === true) {livecell();}
				break;
			case 15:
				if (liferules[1][5] === true) {livecell();}
				break;
			case 16:
				if (liferules[1][6] === true) {livecell();}
				break;
			case 17:
				if (liferules[1][7] === true) {livecell();}
				break;
			case 18:
				if (liferules[1][8] === true) {livecell();}
				break;
			}	
		}
		history[steps] = livecells.slice();
	}
	
	// Animation function
	function animateShape() {
		steps += 1;		
		zeroneighbours();
		countneighbours();
		evalneighbours();
		fadeall();
		drawcells();
		drawgraph();
		updatedata();
	}
	
	function firststep() {
		if (canvas.getContext) {
			setspace();
			yscale = 3*graphcanvas.height/numbercells;
			initarrays();
			initliferules();
			clearspace();
			fillrandom();
			drawcells();
			fadegraph();
		}	else {
			// canvas-unsupported code here
			document.write("If you see this, you&rsquo;d better install Firefox or Chrome or Opera or Safari or &hellip;");
		}
	}

	// Set space dimensions when user chooses other cellsize
	$j('form .cellsizer').change(function() {
		setspace();
		clearspace();
		drawcells();
	});

	// Do one life step
	function steplife(){
		animateShape();
	}
	$j('#stepbutton').click(function() {
		steplife();
	});
	shortcut.add("right",function() {
		steplife();
	});	

	// Start life animation
	function startlife(){
		$j('.trails').attr('checked', true);
		if (running === false) {gogogo=setInterval(animateShape, interval);}
		running = true;
	}
	$j('#startbutton').click(function() {
		startlife();
	});
	shortcut.add("up",function() {
		startlife();
	});	

	// Show start button again after user clicked stopbutton
	function stoplife(){
		clearInterval(gogogo);
		running = false;
	}
	$j('#stopbutton').click(function() {
		stoplife();
	});
	shortcut.add("down",function() {
		stoplife();
	});	
	
	// Restart everything when user click restart button
	function restartlife() {
		if (running === true) {clearInterval(gogogo);}
		running = false;
		steps = 0;
		firststep();
		$j('.trails').attr('checked', true);
		if (running === false) {gogogo=setInterval(animateShape, interval);}
		running = true;
	}
	$j('#randombutton').click(function() {
		restartlife();
	});
	shortcut.add("return",function() {
		restartlife();
	});	
	
	// Clear the canvas (in order to draw manually on it)
	function clearlife() {
		if (running === true) {clearInterval(gogogo);}
		running = false;
		steps = 0;
		setspace();
		initarrays();
		clearspace();
		drawspace();
		updatedata();
	}
	$j('#clearbutton').click(function() {
		clearlife();
	});
	shortcut.add("delete",function() {
		clearlife();
	});	
	
	// Back one life step
	function back1step(){
		if (steps > 0) {
			$j('.trails').attr('checked', false);
			steps -= 1;
			fadeall();
			livecells=history[steps].slice();
			drawcells();
			updatedata();
		}
	}
	$j('#prevbutton').click(function() {
		back1step();
	});
	shortcut.add("left",function() {
		back1step();
	});	
	
	// To first step
	function tofirststep(){
		if (steps > 0) {
			$j('.trails').attr('checked', false);
			steps = 0;
			fadeall();
			livecells=history[steps].slice();
			drawcells();
			updatedata();
		}
	}
	shortcut.add("home",function() {
		tofirststep();
	});	
		
	// Toggle trails on or off
	shortcut.add("insert",function() {
		if ($j('.trails').is(":checked")) {
			$j('.trails').attr('checked', false);
		} else {
			$j('.trails').attr('checked', true);
		}
	});	
	
	// Toggle graph on or off
	$j('#graphtoggler').click(function() {
		$j('#thegraph').toggle('slow');
	});
	
	// Toggle liferules checkboxes on or off
	$j('#rulestoggler').click(function() {
		$j('#liferules').toggle('slow');
	});
	
	// Toggle text on or off
	$j('#texttoggler').click(function() {
		$j('#story').toggle('slow');
	});
	
	$j('#liferules input').click(function() {
		initliferules();
	});
	
	firststep();
	if (running === false) {gogogo=setInterval(animateShape, interval);}
	running = true;
	
});	
