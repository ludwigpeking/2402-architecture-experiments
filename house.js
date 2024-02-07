//genotype structure:
// [v0, v1, v2, v3, v4, v5, v6, v7, v8-stairPosition, v9-stairVector,....vOmega-randomeCentralPoint]
// v0-v7 are the vertices of the ground floor, v10-v17 are the vertices of the first floor, and so on...
// the last vertex is the random central point within the ground floor

function createGenotype(propertyLine, segments = 8, numberOfFloors = 1) {
    const genotype = [];
    const groundfloorGenotype = [];
    for (let i = 0; i < segments; i++) {
        groundfloorGenotype.push(createRandomPointInPolygon(propertyLine));
    }
    sortVertices(groundfloorGenotype);
    if (numberOfFloors > 1) {
        groundfloorGenotype.push(
            createRandomPointInPolygon(groundfloorGenotype)
        );
        groundfloorGenotype.push(p5.Vector.random2D());
    } else {
        groundfloorGenotype.push(null);
        groundfloorGenotype.push(null);
    }
    genotype.push(groundfloorGenotype);

    for (let j = 1; j < numberOfFloors; j++) {
        const floorGenotype = [];
        for (let i = 0; i < segments; i++) {
            floorGenotype.push(
                createRandomPointInPolygon(genotype[j - 1].slice(0, segments))
            );
        }
        sortVertices(floorGenotype);
        if (numberOfFloors > j + 1) {
            floorGenotype.push(createRandomPointInPolygon(floorGenotype)); //staircase position
            floorGenotype.push(p5.Vector.random2D()); //staircase direction
        } else {
            floorGenotype.push(null);
            floorGenotype.push(null);
        }
        genotype.push(floorGenotype);
    }
    genotype.push(createRandomPointInPolygon(genotype[0].slice(0, segments)));
    console.log("genotype", genotype);

    return genotype;
}

class House {
    constructor(genotype, segments = 8) {
        this.genotype = genotype;
        this.floors = [];
        this.groundFloor = new Floor(genotype[0], 0, propertyLine);
        this.floors.push(this.groundFloor);
        for (let i = 1; i < genotype.length - 1; i++) {
            this.floors.push(
                new Floor(genotype[i], i, genotype[i - 1].slice(0, segments))
            );
        }
        this.randomCentralPoint = genotype[genotype.length - 1];

        this.#generateGroundFloor();
        // for (let i = 1; i < floorNumber; i++) {
        //     this.floors.push(new Floor(propertyLine, i));
        // }
        // if (this.floorNumber > 1) {
        //     this.#generateStaircases();
        // }
        // this.randomCentralPoint = {};
        // this.area = 0;
        // for (let i = 0; i < this.floors.length; i++) {
        //     this.area += this.floors[i].area;
        // }
        // console.log("Area", this.area);
        // this.#analyseEfficiency();
    }
    analyseEfficiency() {
        //iterate 1000 times, generate 2 random points in the ground floor
        let sumDistance = 0;
        for (let i = 0; i < 900; i++) {
            const point1 = createRandomPointInPolygon(
                this.groundFloor.vertices
            );
            //     noStroke();
            //     fill(255, 0, 0);
            //     circle(point1.x, point1.y, 5);
            const point2 = createRandomPointInPolygon(
                this.groundFloor.vertices
            );
            const distance = p5.Vector.sub(point1, point2).mag();
            sumDistance += distance;
        }

        for (let i = 0; i < 100; i++) {
            const point1 = createRandomPointInPolygon(
                this.groundFloor.vertices
            );
            const distance =
                p5.Vector.sub(point1, this.doorPosition).mag() +
                distanceToLine(
                    this.doorPosition,
                    propertyLine[accessLine[0]],
                    propertyLine[(accessLine[0] + 1) % propertyLine.length]
                );

            sumDistance += distance;
        }
        this.efficiency = 1 / (sumDistance / sqrt(this.area));

        console.log("Efficiency", this.efficiency);
    }

    draw() {
        this.floors.forEach((floor) => {
            floor.draw();
        });
        noStroke();
        fill(0, 0, 255);
        circle(this.randomCentralPoint.x, this.randomCentralPoint.y, 5);
        circle(this.doorPosition.x, this.doorPosition.y, 10);
    }
    #generateGroundFloor() {
        //generate a random point in the ground floor, then draw a perpendicular line to each of the access lines, which is closer to the point will count. then the shortest perpendicular line's intersection with ground floor edge will be defined as the door position
        const point = this.randomCentralPoint;
        circle(point.x, point.y, 5);
        let minDistance = Infinity;
        let chosenAccess = 0;
        for (let i = 0; i < accessLine.length; i++) {
            const distance = distanceToLine(
                point,
                propertyLine[accessLine[i]],
                propertyLine[(accessLine[i] + 1) % propertyLine.length]
            );
            console.log("distance", distance);
            if (distance < minDistance) {
                minDistance = distance;
                chosenAccess = i;
            }
        }
        const chosenAccessVector = p5.Vector.sub(
            propertyLine[accessLine[chosenAccess]],
            propertyLine[(accessLine[chosenAccess] + 1) % propertyLine.length]
        );

        this.doorPosition = findIntersection(
            point,
            point
                .copy()
                .add(chosenAccessVector.rotate(HALF_PI).normalize().mult(1000)),
            this.floors[0].vertices
        );

        //draw the door with blue point
        noStroke();
        fill(0, 0, 255);
        circle(this.doorPosition.x, this.doorPosition.y, 5);
    }
    #generateStaircases() {}
    mutate() {
        //a vector in the genotype will be replaced by a new random vector, test the validity of the new genotype, if valid, replace the old genotype with the new one
    }
}

function mutate(genotype) {
    let isValid = false; // Flag to track if the new genotype is valid
    let newGenotype;
    let attempts = 0; // To prevent infinite loop

    while (!isValid && attempts < 1000) {
        // Limit attempts to avoid infinite loop
        const levelNumber = genotype.length - 1;
        const segments = genotype[0].length - 2;
        // Flatten all the elements in the genotype array layers
        const flattenedGenotype = genotype.flat(2);

        const randomIndex = floor(random(0, flattenedGenotype.length));
        const randomPoint = createRandomPointInPolygon(propertyLine);
        flattenedGenotype[randomIndex] = randomPoint;

        newGenotype = [];
        for (let i = 0; i < levelNumber; i++) {
            newGenotype.push(
                flattenedGenotype.slice(
                    i * (segments + 2),
                    (i + 1) * (segments + 2)
                )
            );
        }
        newGenotype.push(flattenedGenotype.slice(-1)[0]); // Ensure the last element is included correctly

        // Check the validity of the new genotype
        isValid = true; // Assume valid until proven otherwise
        for (let i = 1; i < levelNumber && isValid; i++) {
            if (
                !isPointInPolygon(
                    newGenotype[i][segments],
                    newGenotype[i - 1].slice(0, segments)
                )
            ) {
                isValid = false;
            }
        }
        if (isValid) {
            if (
                !isPointInPolygon(newGenotype[0][segments], propertyLine) ||
                !isPointInPolygon(
                    flattenedGenotype[flattenedGenotype.length - 1],
                    propertyLine
                )
            ) {
                isValid = false;
            }
        }

        attempts++;
    }

    // Return the original genotype if a valid mutation wasn't found
    // Otherwise, return the valid new genotype
    return isValid ? newGenotype : genotype;
}

House.prototype.serialize = function () {
    // Serialize only the data, not methods
    const data = {
        floorNumber: this.floorNumber,
        // Assume other properties are serializable; otherwise, you need to handle them appropriately
        propertyLine: this.propertyLine.map((v) => ({ x: v.x, y: v.y })),
        accessLine: this.accessLine,
        floors: this.floors.map((floor) => ({
            validArea: floor.validArea.map((v) => ({ x: v.x, y: v.y })),
            level: floor.level,
            vertices: floor.vertices.map((v) => ({ x: v.x, y: v.y })),
            area: floor.area,
        })),
        staircases: this.staircases,
        // Include other properties as needed
    };
    console.log(data);
    return JSON.stringify(data);
};

function deserializeHouse(data) {
    const obj = JSON.parse(data);
    const house = new House(
        obj.floorNumber,
        obj.staircases,
        obj.propertyLine.map((v) => createVector(v.x, v.y)),
        obj.accessLine
    );
    house.floors = obj.floors.map((floor) => {
        const f = new Floor(floor.validArea, floor.level);
        f.vertices = floor.vertices.map((v) => createVector(v.x, v.y));
        f.area = floor.area;
        return f;
    });
    // Set any additional properties if necessary
    return house;
}

class Floor {
    constructor(floorGenotype, level, validArea) {
        this.validArea = validArea;
        this.level = level;
        this.vertices = floorGenotype.slice(0, floorGenotype.length - 2);
        this.area = areaCalculation(this.vertices);
        this.perimeter = calculatePerimeter(this.vertices);
    }

    draw() {
        fill(255 - this.level * 50);
        stroke(0, 0, 0);
        drawPolygon(this.vertices, true);
    }
}

function calculatePerimeter(vertices) {
    let perimeter = 0;
    for (let i = 0; i < vertices.length; i++) {
        const start = vertices[i];
        const end = vertices[(i + 1) % vertices.length];
        perimeter += p5.Vector.sub(start, end).mag();
    }
    return perimeter;
}

function distanceToLine(point, start, end) {
    const direction = p5.Vector.sub(end, start);
    const normal = createVector(-direction.y, direction.x);
    normal.normalize();
    const v = p5.Vector.sub(point, start);
    const distance = p5.Vector.dot(v, normal);
    return abs(distance);
}

function findIntersection(p1, p2, polygon) {
    for (let i = 0; i < polygon.length; i++) {
        const start = polygon[i];
        const end = polygon[(i + 1) % polygon.length];
        const intersection = lineIntersect(p1, p2, start, end);
        if (intersection) {
            return intersection;
        }
    }
    console.log("No intersection found");
    return null;
}
