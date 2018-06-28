// playing field
var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");
var days = 0;

// cels
var celRows = 25;
var celCols = 25;
var celPadding = 1;
var celWidth = 20;
var celHeight = 20;
var celOffsetLeft = (canvas.width - celRows * celWidth) / 2;
var celOffsetTop = (canvas.height - celCols * celHeight) / 2;

const states = { 
    ocean: "#3355FF", 
    fire: "#FF4400", 
    lake: "#7FDDFF", 
    rock: "#999999",
    soil: "#9B7858",
    grass: "#229922",
};

// initialize the island map
//
var cels = [];

for (var c = 0; c < celCols; c++) {
    cels[c] = [];
    for (var r = 0; r < celRows; r++) {
        cels[c][r] = {
            x: 0,
            y: 0,
            z: 0,
            state: states.ocean,
            update: false,
            age: 0,
            daysBurning: 0,
            moisture: 10
        };
    }
}

var cycles = 0;
const cyclesPerDay = 1;
var generatingMap = true;
var daysWithoutRain = 0;
var maxDaysWithoutRain = 0;
var avgDaysWithoutRain = 0;
var totalDaysWithoutRain = 0;

var daysWithRain = 0;
var maxDaysWithRain = 0;
var avgDaysWithRain = 0;
var totalDaysWithRain = 0;

function run() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawIsland();
    drawLegend();

    if (++cycles > cyclesPerDay) {
        ++days;

        while(generatingMap)
        {
            generatingMap = generateMap();
        }

        if (getRandomInt(33) % 2 == 0 ) {
            daysWithRain++;
            totalDaysWithRain++;
            avgDaysWithRain = (totalDaysWithRain / days).toFixed(2);
            if (daysWithRain > maxDaysWithRain) {
                maxDaysWithRain = daysWithRain;
            }

            // reset days without rain
            daysWithoutRain = 0;
        }
        else {
            daysWithoutRain++;
            totalDaysWithoutRain++;
            avgDaysWithoutRain = (totalDaysWithoutRain / days).toFixed(2);
            if (daysWithoutRain > maxDaysWithoutRain) {
                maxDaysWithoutRain = daysWithoutRain;
            }
            // reset days with rain
            daysWithRain = 0;
        }

        updateIsland();
        cycles = 0;
    }
    requestAnimationFrame(run);
}


function Animal() {
    this.age = 0;
}

function Rabbit() {
    this.age = 0;
    this.alive = true;
    this.health = 10;
}

// populates the island map with its initial geography
// 
function generateMap() {
    // leave outside border as ocean
    //
    var oceanBorder = 3;
    for (var c = oceanBorder; c < celCols - oceanBorder; c++) {
        for (var r = oceanBorder; r < celCols - oceanBorder; r++) {

            // default to grass for now to see if this works or not!
            var cel = cels[c][r].state = states.rock;
        }
    }

    return false;
}

function pauseSim() {
    var btnRun = document.getElementById("btnRun");
    var text = btnRun.textContent;
    btnRun.textContent = "Pause";
}

function resetSim() {
    run();
}

function updateIsland() {
    var factor = 30;
    
    for (var c = 0; c < celCols; c++) {
        for (var r = 0; r < celRows; r++) {

            var cel = cels[c][r];
            cel.age++;

            // ocean cels do not change
            // 
            if (cel.state == states.ocean) {
                continue;
            }

            cel.update = cel.age % getRandomInt(factor) == 0;

            if (cel.update) {
                var chance = cel.age % getRandomInt(factor) == 1;
                var seed = getRandomInt(factor * 8) == 0;
                var debris = getRandomInt(factor * 8) == 0;
                cel.moisture--;

                if (debris && cel.state == states.rock) {
                    cel.state = states.soil;
                }
                else if (seed && cel.state == states.soil) {
                    cel.state = states.grass;
                }
                else if (cel.state == states.grass && chance) { 
                    var burnIt = cel.age % getRandomInt(factor * 30) == 0;
                    var waterIt = cel.age % getRandomInt(factor * 30) == 0;

                    if (daysWithoutRain > 10 && burnIt) {
                        cel.state = states.fire;
                        cel.daysBurning++;
                    }

                    if (daysWithRain > 10 && waterIt) {
                        cel.state = states.lake;
                    }

                }
                else if (cel.state == states.lake && chance) {
                    var grassIt = cel.age % getRandomInt(factor/2) == 0;
                    if (grassIt) {
                        cel.state = states.grass;
                    }
                    
                }
                else if (cel.state == states.fire) {
                    if (cel.daysBurning > 2) {
                        cel.daysBurning = 0;
                        cel.state = states.rock;
                    }
                    else {
                        // why shouldn't my neighbours burn, too? :)
                        if (cel.age % getRandomInt(factor * 5) == 0) {
                            updateMyNeighbours(cel, c, r);
                        }
                        cel.daysBurning++;
                    }
                }
                else {
                    // leave the cel unchanged
                }
                cel.update = false;
            }
        }
    }
}

function updateMyNeighbours(cel, c, r) {

    var neighbours = [
        cels[c][r-1],
        cels[c-1][r],
        cels[c+1][r],
        cels[c][r+1],
    ];

    neighbours.forEach(function(neighbour) {
        if (neighbour.state == states.grass) {
            neighbour.state = states.fire;
        }
    });
}


// https://stackoverflow.com/questions/652106/finding-neighbours-in-a-two-dimensional-array
//
function neighbours(cel, c, r) {
    var neighbours = [];
    for (var cn = Math.max(0, c - 1); cn <= Math.min(c + 1, celCols - 1); cn++) {
        for (var rn = Math.max(0, r - 1); rn <= Math.min(r + 1, celRows - 1); rn++) {
            if (cn !== c || rn !== r) {
                neighbours.push(cels[cn][rn]);
            }
        }
    }
    return neighbours;
}


function drawIsland() {
    for (var c = 0; c < celCols; c++) {
        for (var r = 0; r < celRows; r++) {
            var cel = cels[c][r];

            cel.x = (c * (celWidth + celPadding)) + celOffsetLeft;
            cel.y = (r * (celHeight + celPadding)) + celOffsetTop;
            ctx.beginPath();
            ctx.rect(cel.x, cel.y, celWidth, celHeight);
            ctx.fillStyle = cel.state;
            ctx.fill();
            ctx.closePath();
            // ctx.font = "8pt Arial";
            // ctx.fillStyle = "black";
            // ctx.fillText("s:" + cel.state + " f:" + cel.factor,
            //     cel.x + 2, cel.y + 20);
            if (cel.daysBurning == 1) {
                ctx.beginPath();
                ctx.rect(cel.x + 2, cel.y + 2, celWidth - 4, celHeight - 4);
                ctx.fillStyle = "yellow";
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}

function drawLegend() {
    ctx.font = "12pt Consolas";
    ctx.fillStyle = "black";

    ctx.fillText("Days: " + days, 10, canvas.height - 70);

    ctx.fillText("                 avg   | max | total", 10, canvas.height - 50);


    var avgOffset = 140;
    var maxOffset = 200;
    var totalOffset = 250;
    var withRainHeight = canvas.height - 30;
    var withoutRainHeight = canvas.height - 10;

    ctx.fillText("With rain:", 10, canvas.height - 30);
    ctx.fillText(" | " + avgDaysWithRain, avgOffset, withRainHeight);
    ctx.fillText(" | " + maxDaysWithRain, maxOffset, withRainHeight);
    ctx.fillText(" | " + totalDaysWithRain, totalOffset, withRainHeight);
    
    ctx.fillText("Without rain:", 10, withoutRainHeight);
    ctx.fillText(" | " + avgDaysWithoutRain, avgOffset, withoutRainHeight);
    ctx.fillText(" | " + maxDaysWithoutRain, maxOffset, withoutRainHeight);
    ctx.fillText(" | " + totalDaysWithoutRain, totalOffset, withoutRainHeight);
}

// returns an integer between 0 and less than but not including max
// e.g. getRandomInt(3) -> 0, 1, or 2
//
// Source https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
//
function getRandomInt(max) {
    return getRandomIntMinMax(0, max);
}


// returns an integer between min and less than but not including max
// e.g. getRandomInt(0, 3) -> 0, 1, or 2
//      getRandomInt(3, 7) -> 3, 4, 5, or 6
function getRandomIntMinMax(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}


run();