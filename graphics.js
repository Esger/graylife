// JavaScript Document
$(function(){
	var canvas = document.getElementById('thetoroid'), // The canvas where life is drawn
			graphcanvas = document.getElementById('thegraph'), // The canvas where the graph is drawn
			cellsize = parseInt($('input[name=cellsizer]:checked').val(),10), // Width and heigth of a cell in pixels
			gridsize = function(){ return parseInt($('input.grid').val(),10);},
			spacewidth = (canvas.width / cellsize),
			spaceheight = (canvas.height / cellsize),
			numbercells = spacewidth * spaceheight, // Number of available cells
			gridon = function(){return($('input.grid:checked').length > 0);},
			livecells, // Array with x,y coordinates of living cells
			fillratio = $('.fillratio').val(), // Percentage of available cells that will be set alive initially
			startnumberlivecells = numbercells * fillratio / 100,
			yscale = 3*graphcanvas.height/numbercells, //Ratio to apply values on y-axis
			cellsalive, // Number of cells alive
			neighbours, // Array with neighbours count
			steps = 0, // Number of iterations / steps done
			interval = 0, // Milliseconds between iterations
			history, // Array of arrays with livecells
			running = false,
			liferules = [[],[]];
	
	// Set some variables
	function setspace() {
		cellsize = parseInt($('input[name=cellsizer]:checked').val(),10); //Must be even or 1
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
	
	function initliferules() {
		var count;
		for (count=0; count<9; count++) {
			liferules[0][count]=false;
			liferules[1][count]=false;
		}
		if ($('#newlife0').is(":checked")) {liferules[0][0]=true;}
		if ($('#newlife1').is(":checked")) {liferules[0][1]=true;}
		if ($('#newlife2').is(":checked")) {liferules[0][2]=true;}
		if ($('#newlife3').is(":checked")) {liferules[0][3]=true;}
		if ($('#newlife4').is(":checked")) {liferules[0][4]=true;}
		if ($('#newlife5').is(":checked")) {liferules[0][5]=true;}
		if ($('#newlife6').is(":checked")) {liferules[0][6]=true;}
		if ($('#newlife7').is(":checked")) {liferules[0][7]=true;}
		if ($('#newlife8').is(":checked")) {liferules[0][8]=true;}
		if ($('#staylife0').is(":checked")) {liferules[1][0]=true;}
		if ($('#staylife1').is(":checked")) {liferules[1][1]=true;}
		if ($('#staylife2').is(":checked")) {liferules[1][2]=true;}
		if ($('#staylife3').is(":checked")) {liferules[1][3]=true;}
		if ($('#staylife4').is(":checked")) {liferules[1][4]=true;}
		if ($('#staylife5').is(":checked")) {liferules[1][5]=true;}
		if ($('#staylife6').is(":checked")) {liferules[1][6]=true;}
		if ($('#staylife7').is(":checked")) {liferules[1][7]=true;}
		if ($('#staylife8').is(":checked")) {liferules[1][8]=true;}
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
	
	// Draw grid for easier composing
	function drawgrid() {
		var ctx = canvas.getContext('2d'),
				size = gridsize();
		if (gridsize === 0) {
			gridsize = 1;
		}
		clearspace();
		ctx.lineWidth = 1;
		for (var y=cellsize;y<canvas.height;y+=cellsize*size) {
			ctx.beginPath();
			ctx.moveTo(0,y-0.5);
			ctx.lineTo(canvas.width,y-0.5);
			ctx.strokeStyle = "#c2c2c2";
			ctx.stroke();
			ctx.closePath();
		}
		for (var x=cellsize;x<canvas.width;x+=cellsize*size) {
			ctx.beginPath();
			ctx.moveTo(x-0.5,0);
			ctx.lineTo(x-0.5,canvas.height);
			ctx.strokeStyle = "#c2c2c2";
			ctx.stroke();
			ctx.closePath();
		}
	}
	$('.grid').on('focus blur',drawgrid);
	
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
		//drawspace();
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
	
	// Toggle liferules checkboxes on or off
	$('#rulestoggler').click(function() {
		$('#liferules').toggle('slow');
	});
	
	// Toggle text on or off
	$('#texttoggler').click(function() {
		$('#story').toggle('slow');
	});
	
	$('#liferules input').click(function() {
		initliferules();
	});
	
	firststep();
	if (running === false) {gogogo=setInterval(animateShape, interval);}
	running = true;
	
});	
