// JavaScript Document
$(function () {
    var canvas = document.getElementById('thetoroid'), // The canvas where life is drawn
        graphcanvas = document.getElementById('thegraph'), // The canvas where the graph is drawn
        $teller = $('#teller'),
        $cellsAlive = $('#cellsalive'),
        cellsize = parseInt($('input[name=cellsizer]:checked').val(), 10), // Width and heigth of a cell in pixels
        gridsize = function () { return parseInt($('input.grid').val(), 10); },
        spacewidth = (canvas.width / cellsize),
        spaceheight = (canvas.height / cellsize),
        numbercells = spacewidth * spaceheight, // Number of available cells
        gridon = function () { return ($('input.grid:checked').length > 0); },
        livecells, // Array with x,y coordinates of living cells
        fillratio = $('.fillratio').val(), // Percentage of available cells that will be set alive initially
        startnumberlivecells = numbercells * fillratio / 100,
        yscale = 3 * graphcanvas.height / numbercells, //Ratio to apply values on y-axis
        cellsalive, // Number of cells alive
        neighbours, // Array with neighbours count
        steps = 0, // Number of iterations / steps done
        interval = 0, // Milliseconds between iterations
        keepHistory = false,
        history, // Array of arrays with livecells
        running = false,
        liferules = [];

    // Set some variables
    function setspace() {
        cellsize = parseInt($('input[name=cellsizer]:checked').val(), 10); //Must be even or 1
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
        for (count = 0; count < 19; count++) {
            liferules[count] = false;
        }
        if ($('#newlife0').is(":checked")) { liferules[0] = true; }
        if ($('#newlife1').is(":checked")) { liferules[1] = true; }
        if ($('#newlife2').is(":checked")) { liferules[2] = true; }
        if ($('#newlife3').is(":checked")) { liferules[3] = true; }
        if ($('#newlife4').is(":checked")) { liferules[4] = true; }
        if ($('#newlife5').is(":checked")) { liferules[5] = true; }
        if ($('#newlife6').is(":checked")) { liferules[6] = true; }
        if ($('#newlife7').is(":checked")) { liferules[7] = true; }
        if ($('#newlife8').is(":checked")) { liferules[8] = true; }
        if ($('#staylife0').is(":checked")) { liferules[10] = true; }
        if ($('#staylife1').is(":checked")) { liferules[11] = true; }
        if ($('#staylife2').is(":checked")) { liferules[12] = true; }
        if ($('#staylife3').is(":checked")) { liferules[13] = true; }
        if ($('#staylife4').is(":checked")) { liferules[14] = true; }
        if ($('#staylife5').is(":checked")) { liferules[15] = true; }
        if ($('#staylife6').is(":checked")) { liferules[16] = true; }
        if ($('#staylife7').is(":checked")) { liferules[17] = true; }
        if ($('#staylife8').is(":checked")) { liferules[18] = true; }
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
        history = [];
        for (count = 0; count < startnumberlivecells; count++) {
            livecells[count] = new Celxy(Math.floor(Math.random() * spacewidth), Math.floor(Math.random() * spaceheight));
        }
        if (keepHistory) history.push(livecells);
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
        for (var y = cellsize; y < canvas.height; y += cellsize * size) {
            ctx.beginPath();
            ctx.moveTo(0, y - 0.5);
            ctx.lineTo(canvas.width, y - 0.5);
            ctx.strokeStyle = "#c2c2c2";
            ctx.stroke();
            ctx.closePath();
        }
        for (var x = cellsize; x < canvas.width; x += cellsize * size) {
            ctx.beginPath();
            ctx.moveTo(x - 0.5, 0);
            ctx.lineTo(x - 0.5, canvas.height);
            ctx.strokeStyle = "#c2c2c2";
            ctx.stroke();
            ctx.closePath();
        }
    }
    $('.grid').on('focus blur', drawgrid);

    // Fade the old screen a bit to white
    function fadeall() {
        var ctx = canvas.getContext('2d');
        if ($('.trails').is(":checked")) {
            ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
        } else {
            ctx.fillStyle = "rgb(255, 255, 255)";
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
    $('#thetoroid').click(function (event) {
        mouseX = Math.floor((event.offsetX ? (event.offsetX) : event.pageX - this.offsetLeft) / cellsize);
        mouseY = Math.floor((event.offsetY ? (event.offsetY) : event.pageY - this.offsetTop) / cellsize);
        livecells[livecells.length] = new Celxy(mouseX, mouseY);
        if (keepHistory) history.push(livecells);
        drawcells();
        updatedata();
    });

    // Draw the array with livecells
    function drawgraph() {
        var ctx = graphcanvas.getContext('2d');
        ctx.fillStyle = "rgb(128, 128, 0)";
        ctx.fillRect(steps % graphcanvas.width, graphcanvas.height - cellsalive * yscale, 1, 1);
    }

    // Update the counter
    function updatedata() {
        $teller.text(steps);
        $cellsAlive.text(cellsalive);
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
                    neighbours[((thisy + dy) * spacewidth + thisx + dx + numbercells) % numbercells]++;
                }
            }
            neighbours[thisy * spacewidth + thisx] += 9;
        }
    }

    // Evaluate neighbourscounts for new livecells
    function evalneighbours() {
        var count, thisx, thisy;

        function livecell() {
            thisy = Math.floor(count / spacewidth);
            thisx = count - (thisy * spacewidth);
            livecells.push(new Celxy(thisx, thisy));
        }

        livecells = [];
        for (count = 0; count < numbercells; count++) {
            if (liferules[neighbours[count]]) {
                livecell();
            }
        }
        if (keepHistory) history.push(livecells);
        if (history.length > 1000) {
            // console.log('livecells :' + livecells.length);
            history = history.slice(-900);
        }
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
            yscale = 3 * graphcanvas.height / numbercells;
            initarrays();
            initliferules();
            clearspace();
            fillrandom();
            drawcells();
            fadegraph();
        } else {
            // canvas-unsupported code here
            document.write("If you see this, you&rsquo;d better install Firefox or Chrome or Opera or Safari or &hellip;");
        }
    }

    // Set space dimensions when user chooses other cellsize
    $('form .cellsizer').change(function () {
        setspace();
        clearspace();
        drawcells();
    });

    // Do one life step
    function steplife() {
        animateShape();
    }
    $('#stepbutton').click(function () {
        steplife();
    });
    shortcut.add("right", function () {
        steplife();
    });

    // Start life animation
    function startlife() {
        $('.trails').attr('checked', true);
        if (running === false) { gogogo = setInterval(animateShape, interval); }
        running = true;
    }
    $('#startbutton').click(function () {
        startlife();
    });
    shortcut.add("up", function () {
        startlife();
    });

    // Show start button again after user clicked stopbutton
    function stoplife() {
        clearInterval(gogogo);
        running = false;
    }
    $('#stopbutton').click(function () {
        stoplife();
    });
    shortcut.add("down", function () {
        stoplife();
    });

    // Restart everything when user click restart button
    function restartlife() {
        if (running === true) { clearInterval(gogogo); }
        running = false;
        steps = 0;
        firststep();
        $('.trails').attr('checked', true);
        if (running === false) { gogogo = setInterval(animateShape, interval); }
        running = true;
    }
    $('#randombutton').click(function () {
        restartlife();
    });
    shortcut.add("return", function () {
        restartlife();
    });

    // Clear the canvas (in order to draw manually on it)
    function clearlife() {
        if (running === true) { clearInterval(gogogo); }
        running = false;
        steps = 0;
        setspace();
        initarrays();
        clearspace();
        //drawspace();
        updatedata();
    }
    $('#clearbutton').click(function () {
        clearlife();
    });
    shortcut.add("delete", function () {
        clearlife();
    });

    // Back one life step
    function back1step() {
        var generation;
        if (keepHistory && (history.length > 0)) {
            $('.trails').attr('checked', false);
            generation = history.length - 2;
            steps -= 1;
            fadeall();
            livecells = history[generation].slice();
            history = history.slice(0, generation);
            drawcells();
            updatedata();
        }
    }
    $('#prevbutton').click(function () {
        back1step();
    });
    shortcut.add("left", function () {
        back1step();
    });

    // To first step
    function tofirststep() {
        var generation;
        if (keepHistory && (history.length > 0)) {
            $('.trails').attr('checked', false);
            generation = 0;
            // steps = 0;
            fadeall();
            livecells = history[generation].slice();
            history = [history.slice(0, generation + 1)];
            drawcells();
            updatedata();
        }
    }
    shortcut.add("home", function () {
        tofirststep();
    });

    // Toggle trails on or off
    shortcut.add("insert", function () {
        if ($('.trails').is(":checked")) {
            $('.trails').attr('checked', false);
        } else {
            $('.trails').attr('checked', true);
        }
    });

    // Toggle history on or off
    $('.history').on('click', function () {
        keepHistory = !keepHistory;
        $('#prevbutton, #stepbutton').toggleClass('hidden');
    });

    // Toggle graph on or off
    $('#graphtoggler').click(function () {
        $('#thegraph').toggle('slow');
    });

    // Toggle liferules checkboxes on or off
    $('#rulestoggler').click(function () {
        $('#liferules').toggle('slow');
    });

    // Toggle text on or off
    $('#texttoggler').click(function () {
        $('#story').toggle('slow');
    });

    $('#liferules input').click(function () {
        initliferules();
    });

    firststep();
    if (running === false) { gogogo = setInterval(animateShape, interval); }
    running = true;

});	
