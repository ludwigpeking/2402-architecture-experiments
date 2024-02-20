let houses = [];
const genePool = [];
const propertyLineNodeNumber = 6;
const windowSize = 300;
const windowNumber = [3, 3];
const headBarSize = 150;
// const propertyLineNodes = [
//     50, 100, 200, 50, 300, 100, 300, 200, 200, 200, 100, 300,
// ];
const propertyLineNodes = convert2DArrayTo1D(
    generateNonIntersectingPolygon(propertyLineNodeNumber)
); //normalized to 1

// const accessLine = [2, 3, 4]; //accessible segment index or indices in the property line
const accessLine = accessLineGeneration(3);
const propertyLine = createPropertyline(propertyLineNodes, windowSize);
const externalEntranceRate = 0.1;
const lineOpacity = 10;
const numberOfSegments = 12;
const recording = false;
let mutationMagnitude = 1;
// let efficiencySamples = 100;
const efficiencies = [];
let efficiencyProgress = 0;

function setup() {
    createCanvas(1050, 1150);
    // noLoop();
    //generate a random house within the bounds of the property line
    for (let i = 0; i < 9; i++) {
        const house = new House(
            createGenotype(propertyLine, numberOfSegments, 1),
            0
        );
        houses.push(house);
    }
    //sort the houses by efficiency
    houses.sort((a, b) => b.efficiency - a.efficiency);
    background(200);
    showTheGridOfHouses(3, 3);

    // Save button
    const btnSave = createButton("Save House");
    btnSave.position(10, height + 20);
    btnSave.mousePressed(() => {
        const serializedHouse = house.serialize();
        localStorage.setItem("savedHouse", serializedHouse);
        console.log("House saved");
    });

    // Load button
    const btnLoad = createButton("Load House");
    btnLoad.position(100, height + 20).style("width", "100px");
    btnLoad.mousePressed(() => {
        const savedHouseData = localStorage.getItem("savedHouse");
        if (savedHouseData) {
            house = deserializeHouse(savedHouseData);
            background(200); // Clear the canvas
            // drawPropertyLineAndAccessLine(propertyLine, accessLine);
            house.draw();
            console.log("House loaded");
        } else {
            console.log("No house saved in localStorage");
        }
    });
    //add a button to generate a new house
    const btnGenerate = createButton("Evolve Houses");
    btnGenerate.position(202, height + 20);
    btnGenerate.mousePressed(() => {
        //mutate each of the houses in the gene pool for 3 new houses
        let mutatedHouses = houses
            .slice(0, 100)
            .map((house) => duplicateAndMutate(house));
        houses = [...houses, ...mutatedHouses];

        houses.sort((a, b) => b.efficiency - a.efficiency);

        background(200);
        // drawPropertyLineAndAccessLine(propertyLine, accessLine);
        showTheGridOfHouses(3, 3);
    });
    //save the canvas as an image
    fill(0);
    noStroke();
    textSize(15);
    text("Frame: 0", 30, 30);
    if (recording) {
        let fileName = "frame" + nf(frameCount, 3) + ".png"; // nf() adds leading zeros
        saveCanvas(fileName, "png");
    }
}

function draw() {
    frameRate(10);
    if (frameCount > 1) {
        noLoop();
    }
    //print frame number
    console.log(frameCount);
    let mutatedHouses = houses
        .slice(0, 30)
        .map((house) => duplicateAndMutate(house));
    let crossOverHouses = [];
    for (let i = 0; i < 20; i++) {
        let crossParent1 = random(houses.slice(0, 20));
        let crossParent2 = random(houses.slice(0, 1000));
        let crossOverHouse = twoHousesCrossOver(crossParent1, crossParent2);
        crossOverHouses.push(crossOverHouse);
    }

    houses = [...houses, ...mutatedHouses, ...crossOverHouses];

    //recalculate the efficiency of each house

    houses.sort((a, b) => b.efficiency - a.efficiency);
    houses = houses.slice(0, 2000);

    //calculate the average efficiency of the top 100 houses
    let averageEfficiency = houses
        .slice(0, 100)
        .reduce((acc, house) => acc + house.efficiency, 0);
    averageEfficiency /= 100;

    efficiencies.push(averageEfficiency);
    // let testValue;
    if (efficiencies.length > 3) {
        efficiencyProgress =
            (efficiencies[efficiencies.length - 1] -
                efficiencies[efficiencies.length - 2]) /
            efficiencies[efficiencies.length - 2];

        mutationMagnitude = max(min(abs(efficiencyProgress * 100), 3), 0.1);
        // testValue = min(floor(abs(10 / efficiencyProgress)), 20000);
        // efficiencySamples = min(floor(abs(1 / efficiencyProgress)), 20000);
    }
    background(200);
    showTheGridOfHouses(3, 3);
    noFill();
    stroke(0);
    strokeWeight(0.5);
    drawDashLine(new p5.Vector(300, 150), new p5.Vector(width, 150), 3);
    drawDashLine(new p5.Vector(300, 100), new p5.Vector(width, 100), 3);
    drawDashLine(new p5.Vector(300, 50), new p5.Vector(width, 50), 3);
    // drawDashLine(new p5.Vector(200, 100), new p5.Vector(200, 50), 5);
    // line(200, 100, width, 100);
    // line(200, 50, width, 50);
    // line(200, 100, 200, 50);
    for (let i = houses.length - 1; i >= 0; i--) {
        if (houses[i]) {
            const lerpedValue = map(houses[i].efficiency, 1, 2, 150, 50);

            if (i < 9) {
                stroke(255, 0, 0);
            } else {
                stroke(0, 255, 255);
            }
            line(
                300 + houses[i].atFrame * 5,
                lerpedValue,
                300 + frameCount * 5,
                lerpedValue
            );
        }
    }

    fill(0);
    noStroke();
    textSize(15);
    text("Frame: " + frameCount, 20, 20);
    text("Average Efficiency: " + round(averageEfficiency, 3), 20, 40);
    text(
        "Efficiency Progress: " + round(efficiencyProgress * 100, 3) + "%",
        20,
        60
    );
    text("Mutation Magnitude: " + round(mutationMagnitude, 3), 20, 80);
    // text("Efficiency Samples: " + round(testValue, 3), 20, 100);
    //save the number 1,2,3,6,10,50,100 frames as images
    if (
        frameCount === 1 ||
        frameCount === 2 ||
        frameCount === 3 ||
        frameCount === 5 ||
        frameCount === 10 ||
        frameCount === 50 ||
        frameCount === 100
    ) {
        // saveCanvas("house", "png");
        //put the frameCount into the filename
        // saveCanvas("house" + frameCount, "png");
    }
    if (frameCount <= 100 && recording) {
        // For example, capture 360 frames
        let fileName = "frame" + nf(frameCount, 3) + ".png"; // nf() adds leading zeros
        saveCanvas(fileName, "png");
    }
}

function showTheGridOfHouses(u, v) {
    let tested = false;

    while (!tested) {
        tested = true;

        for (let i = 0; i < u * v; i++) {
            if (!houses[i].tested30000) {
                tested = false;
                houses[i].analyseEfficiency(30000, externalEntranceRate, false);
            }
        }
        if (!tested) {
            houses.sort((a, b) => b.efficiency - a.efficiency);
        }
    }

    for (let j = 0; j < v; j++) {
        for (let i = 0; i < u; i++) {
            if (houses[j * u + i]) {
                push();
                translate(i * 350, j * 350 + 100);
                drawPropertyLineAndAccessLine(propertyLine, accessLine);
                houses[j * u + i].draw();
                houses[j * v + i].analyseEfficiency(
                    300,
                    externalEntranceRate,
                    true
                );
                pop();
            }
        }
    }
}
