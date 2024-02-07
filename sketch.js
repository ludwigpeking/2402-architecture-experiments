let house;
const genePool = [];
const propertyLineNodes = [50, 100, 200, 50, 300, 100, 300, 300, 100, 300];
const accessLine = [3, 4]; //accessible segment index or indices in the property line
const propertyLine = createPropertyline(propertyLineNodes);

function setup() {
    createCanvas(400, 400);
    background(200);
    noLoop();
    const genotypeOriginal = createGenotype(propertyLine, 8, 1);

    //     const vertices = sortVertices(genotypeOriginal.splice(8, 1));

    //     console.log("vertices", vertices);
    //   textStair = new Staircase(createVector(100, 100), 0.2, 50, 10);
    //   textStair.draw();

    drawPropertyLineAndAccessLine(propertyLine, accessLine);
    //generate a random house within the bounds of the property line
    house = new House(genotypeOriginal);
    house.analyseEfficiency();
    house.draw();

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
    btnLoad.position(100, height + 20);
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
}

function draw() {
    frameRate(4);
    house = new House(mutate(house.genotype));
    drawPropertyLineAndAccessLine(house.propertyLine, house.accessLine);
}

function duplicateAndMutate(house) {
    const newHouse = new House(
        house.floors.length,
        house.randomCentralPoint,
        house.propertyLine,
        house.accessLine
    );
    newHouse.floors = house.floors.map((floor) => {
        return new Floor(floor.vertices, floor.floorNumber);
    });
    newHouse.mutate();
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
