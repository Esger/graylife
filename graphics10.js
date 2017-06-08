// JavaScript Document
$(function(){
	var canvas = document.getElementById('thetoroid'); // The canvas where life is drawn
	var graphcanvas = document.getElementById('thegraph'); // The canvas where the graph is drawn
	var cellsize= $('input[name=cellsizer]:checked').val(); // Width and heigth of a cell in pixels
	var spacewidth = (canvas.width / cellsize);
	var spaceheight = (canvas.height / cellsize);
	var numbercells = spacewidth * spaceheight; // Number of available cells
	var livecells; // Array with x,y coordinates of living cells
	var fillratio = $('.fillratio').val(); // Percentage of available cells that will be set alive initially
	var startnumberlivecells = numbercells * fillratio / 100;
	var yscale = 3*graphcanvas.height/numbercells; //Ratio to apply values on y-axis
	var cellsalive; // Number of cells alive
	var neighbours; // Array with neighbours count
	var steps = 0; // Number of iterations / steps done
	var interval = 0; // Milliseconds between iterations
	var history; // Array of arrays with livecells
	var running = false;
	
	// Set some variables
	function setspace() {
		cellsize = $('input[name=cellsizer]:checked').val(); //Must be even or 1
		spacewidth = (canvas.width / cellsize);
		spaceheight = (canvas.height / cellsize);
		numbercells = spacewidth * spaceheight;
		fillratio = $('.fillratio').val();
		startnumberlivecells = numbercells * fillratio / 100;
		cellsalive = startnumberlivecells;
	}
	
	// Empty the arrays to get ready for restart.
	function initarrays() {
		livecells = [];
		neighbours = [];
		history = [];
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
		if ($('.trails').is(":checked")) {
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
	$('#thetoroid').click( function(event) {
		mouseX = Math.floor((event.offsetX?(event.offsetX):event.pageX-this.offsetLeft)/cellsize);
		mouseY = Math.floor((event.offsetY?(event.offsetY):event.pageY-this.offsetTop)/cellsize);
		livecells[livecells.length] = new Celxy(mouseX, mouseY);
		history[steps] = livecells.slice();
		drawcells();
	});
	 
	// Draw the array with livecells
	function drawgraph() {
		var ctx = graphcanvas.getContext('2d');
		ctx.fillStyle = "rgb(128, 128, 0)";
		ctx.fillRect(steps%graphcanvas.width,graphcanvas.height-cellsalive*yscale,1,1);
	}
	
	// Update the counter
	function updatedata() {
		$('#teller').text(steps);
		$('#cellsalive').text(cellsalive);
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
			case 3:
				livecell();
				break;
			case 12:
				livecell();
				break;
			case 13:
				livecell();
				break;
			default:
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
	$('form .cellsizer').change(function() {
		setspace();
		clearspace();
		drawcells();
	});

	// Do one life step
	function steplife(){
		animateShape();
	}
	$('#stepbutton').click(function() {
		steplife();
	});
	shortcut.add("right",function() {
		steplife();
	});	

	// Start life animation
	function startlife(){
		$('.trails').attr('checked', true);
		if (running === false) {gogogo=setInterval(animateShape, interval);}
		running = true;
	}
	$('#startbutton').click(function() {
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
	$('#stopbutton').click(function() {
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
		$('.trails').attr('checked', true);
		if (running === false) {gogogo=setInterval(animateShape, interval);}
		running = true;
	}
	$('#randombutton').click(function() {
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
	$('#clearbutton').click(function() {
		clearlife();
	});
	shortcut.add("delete",function() {
		clearlife();
	});	
	
	// Back one life step
	function back1step(){
		if (steps > 0) {
			$('.trails').attr('checked', false);
			steps -= 1;
			fadeall();
			livecells=history[steps].slice();
			drawcells();
			updatedata();
		}
	}
	$('#prevbutton').click(function() {
		back1step();
	});
	shortcut.add("left",function() {
		back1step();
	});	
	
	// To first step
	function tofirststep(){
		if (steps > 0) {
			$('.trails').attr('checked', false);
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
		if ($('.trails').is(":checked")) {
			$('.trails').attr('checked', false);
		} else {
			$('.trails').attr('checked', true);
		}
	});	
	
	// Toggle graph on or off
	$('#graphtoggler').click(function() {
		$('#thegraph').toggle('slow');
	});
	
	// Toggle text on or off
	$('#texttoggler').click(function() {
		$('#story').toggle('slow');
	});
	
	firststep();
	if (running === false) {gogogo=setInterval(animateShape, interval);}
	running = true;
	
});	
