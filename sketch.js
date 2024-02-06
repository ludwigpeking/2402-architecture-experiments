function setup() {
    const propertyLine = [
        createVector(50, 100),
        createVector(200, 50),
        createVector(300, 100),
        createVector(300, 300),
        createVector(100, 300),
    ];
    const accessLine = [3, 4]; //accessible segment index or indices in the property line
    const genePool = [];

    createCanvas(400, 400);
    background(200);
    noLoop();

    //   textStair = new Staircase(createVector(100, 100), 0.2, 50, 10);
    //   textStair.draw();

    drawPropertyLineAndAccessLine(propertyLine, accessLine);
    //generate a random house within the bounds of the property line
    let house = new House(1, {}, propertyLine, accessLine);
    house.draw();

    // Save button
    const btnSave = createButton("Save House");
    btnSave.position(10, 420);
    btnSave.mousePressed(() => {
        const serializedHouse = house.serialize();
        localStorage.setItem("savedHouse", serializedHouse);
        console.log("House saved");
    });

    // Load button
    const btnLoad = createButton("Load House");
    btnLoad.position(100, 420);
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

function drawPropertyLineAndAccessLine(propertyLine, accessLine) {
    for (let i = 0; i < propertyLine.length; i++) {
        const start = propertyLine[i];
        const end = propertyLine[(i + 1) % propertyLine.length];
        drawDashLine(start, end, 3);
    }
    stroke(255, 0, 0);
    strokeWeight(1);
    for (let i = 0; i < accessLine.length; i++) {
        const start = propertyLine[accessLine[i]];
        const end = propertyLine[(accessLine[i] + 1) % propertyLine.length];
        drawDashLine(start, end, 3);
    }
}

function drawDashLine(start, end, dashLength) {
    const direction = p5.Vector.sub(end, start);
    const length = direction.mag();
    const unit = direction.copy().normalize().mult(dashLength);
    const steps = length / dashLength;
    for (let i = 0; i < steps; i += 2) {
        const start1 = p5.Vector.add(start, unit.copy().mult(i));
        const end1 = p5.Vector.add(start1, unit);
        line(start1.x, start1.y, end1.x, end1.y);
    }
}

function drawPolygon(points, closeLoop = false) {
    beginShape();
    for (let i = 0; i < points.length; i++) {
        vertex(points[i].x, points[i].y);
    }
    if (closeLoop) {
        endShape(CLOSE);
    } else {
        endShape();
    }
}

function isPointInPolygon(point, polygon) {
    let isInside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        if (
            polygon[i].y > point.y != polygon[j].y > point.y &&
            point.x <
                ((polygon[j].x - polygon[i].x) * (point.y - polygon[i].y)) /
                    (polygon[j].y - polygon[i].y) +
                    polygon[i].x
        ) {
            isInside = !isInside;
        }
    }
    return isInside;
}

function createRandomPoint() {
    return createVector(random(100, 300), random(100, 300)); // Adjust according to your bounding box
}

function createRandomPointInPolygon(polygon) {
    // Calculate bounding box
    let minX = Infinity,
        maxX = -Infinity,
        minY = Infinity,
        maxY = -Infinity;
    for (const vertex of polygon) {
        if (vertex.x < minX) minX = vertex.x;
        if (vertex.x > maxX) maxX = vertex.x;
        if (vertex.y < minY) minY = vertex.y;
        if (vertex.y > maxY) maxY = vertex.y;
    }

    return createVector(random(minX, maxX), random(minY, maxY));
}

function calculateCentroid(points) {
    let centroid = createVector(0, 0);
    points.forEach((point) => {
        centroid.add(point);
    });
    centroid.div(points.length);
    return centroid;
}

function sortVertices(vertices) {
    const centroid = calculateCentroid(vertices);
    vertices.sort((a, b) => {
        const angleA = atan2(a.y - centroid.y, a.x - centroid.x);
        const angleB = atan2(b.y - centroid.y, b.x - centroid.x);
        return angleA - angleB;
    });
}
