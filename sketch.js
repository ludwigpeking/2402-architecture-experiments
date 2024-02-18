let houses = [];
const genePool = [];
const propertyLineNodes = [50, 100, 200, 50, 300, 100, 300, 300, 100, 300];
const accessLine = [4]; //accessible segment index or indices in the property line
const propertyLine = createPropertyline(propertyLineNodes);
const externalEntranceRate = 0.0;
const lineOpacity = 5;
const numberOfSegments = 7;

function setup() {
    createCanvas(1050, 1050);
    // noLoop();
    //generate a random house within the bounds of the property line
    for (let i = 0; i < 9; i++) {
        const house = new House(
            createGenotype(propertyLine, numberOfSegments, 1)
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
            drawPropertyLineAndAccessLine(propertyLine, accessLine);
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
        let mutatedHouses = houses.map((house) => duplicateAndMutate(house));
        houses = [...houses, ...mutatedHouses];

        houses.sort((a, b) => b.efficiency - a.efficiency);
        //keep the top 1000 houses, if there are more than 1000
        houses = houses.slice(0, 100);
        // console.log("houses number", houses.length);
        background(200);
        drawPropertyLineAndAccessLine(propertyLine, accessLine);
        showTheGridOfHouses(3, 3);
    });
    //save the canvas as an image
    fill(0);
    noStroke();
    textSize(20);
    text("Frame: 0", 30, 30);
    saveCanvas("house0", "png");
    saveCanvas("house", "png");
}

function draw() {
    frameRate(10);
    //print frame number
    console.log(frameCount);
    let mutatedHouses = houses.map((house) => duplicateAndMutate(house));
    houses = [...houses, ...mutatedHouses];
    //recalculate the efficiency of each house
    // houses.forEach((house) => house.analyseEfficiency(1000, externalEntranceRate));
    houses.sort((a, b) => b.efficiency - a.efficiency);
    //keep the top 1000 houses, if there are more than 1000
    houses = houses.slice(0, 100);
    background(200);
    drawPropertyLineAndAccessLine(propertyLine, accessLine);
    showTheGridOfHouses(3, 3);
    //save the number 1,2,3,6,10,50,100 frames as images
    if (
        frameCount === 1 ||
        frameCount === 2 ||
        frameCount === 3 ||
        frameCount === 6 ||
        frameCount === 10 ||
        frameCount === 50 ||
        frameCount === 100
    ) {
        // saveCanvas("house", "png");
        //put the frameCount into the filename
        fill(0);
        noStroke();
        textSize(20);
        text("Frame: " + frameCount, 30, 30);
        saveCanvas("house" + frameCount, "png");
    }
}

function duplicateAndMutate(house) {
    // console.log("mutating");
    const newGenotype = mutate(house.genotype);
    const newHouse = new House(newGenotype);

    return newHouse;
}

function createPropertyline(propertyLineNodes) {
    const propertyLine = [];
    for (let i = 0; i < propertyLineNodes.length; i += 2) {
        propertyLine.push(
            new p5.Vector(propertyLineNodes[i], propertyLineNodes[i + 1])
        );
    }
    return propertyLine;
}

function showTheGridOfHouses(u, v) {
    for (let j = 0; j < v; j++) {
        for (let i = 0; i < u; i++) {
            if (houses[j * u + i]) {
                push();
                translate(i * 350, j * 350);
                drawPropertyLineAndAccessLine(propertyLine, accessLine);
                houses[j * u + i].draw();
                houses[j * v + i].analyseEfficiency(
                    3000,
                    externalEntranceRate,
                    true
                );
                pop();
            }
        }
    }
}
