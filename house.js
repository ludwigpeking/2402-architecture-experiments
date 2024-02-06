class House {
    constructor(floorNumber, staircases, propertyLine, accessLine) {
        this.floorNumber = floorNumber;
        this.floors = [];
        this.floors.push(new Floor(propertyLine, 0));
        this.staircases = staircases;
        this.propertyLine = propertyLine;
        this.accessLine = accessLine;
        this.floors = [];
        this.staircases = [];
        this.#generateGroundFloor();
        for (let i = 1; i < floorNumber; i++) {
            this.floors.push(new Floor(propertyLine, i));
        }

        if (this.floorNumber > 1) {
            this.#generateStaircases();
        }
        this.#analyseEfficiency();
    }
    #analyseEfficiency() {
        //iterate 1000 times, generate 2 random points in the ground floor

        for (let i = 0; i < 1000; i++) {
            const point1 = createRandomPointInPolygon(
                this.groundFloor.vertices
            );
            const point2 = createRandomPointInPolygon(
                this.groundFloor.vertices
            );
        }
    }
    draw() {
        this.floors.forEach((floor) => {
            floor.draw();
        });
    }
    #generateGroundFloor() {
        this.groundFloor = new Floor(this.propertyLine, 0);
        this.floors.push(this.groundFloor);
    }
    #generateStaircases() {}
}

House.prototype.serialize = function () {
    // Serialize only the data, not methods
    const data = {
        floorNumber: this.floorNumber,
        // Assume other properties are serializable; otherwise, you need to handle them appropriately
        propertyLine: this.propertyLine.map((v) => ({ x: v.x, y: v.y })),
        accessLine: this.accessLine,
        // Include other properties as needed
    };
    return JSON.stringify(data);
};

function deserializeHouse(data) {
    const obj = JSON.parse(data);
    const house = new House(
        obj.floorNumber,
        {},
        obj.propertyLine.map((v) => createVector(v.x, v.y)),
        obj.accessLine
    );
    // Set any additional properties if necessary
    return house;
}

class Floor {
    constructor(validArea, level) {
        this.validArea = validArea;
        this.level = level;
        this.vertices = [];
        this.#generateRandomVertices();
        this.#areaCalculation();
    }

    #generateRandomVertices() {
        let attempts = 0;
        while (this.vertices.length < 8 && attempts < 1000) {
            const point = createRandomPointInPolygon(this.validArea);
            if (isPointInPolygon(point, this.validArea)) {
                this.vertices.push(point);
            }
            attempts++;
        }
        sortVertices(this.vertices); //sort vertices in clockwise order
    }
    #areaCalculation() {
        let area = 0;
        for (let i = 0; i < this.vertices.length; i++) {
            const vertex1 = this.vertices[i];
            const vertex2 = this.vertices[(i + 1) % this.vertices.length];
            area += (vertex2.x - vertex1.x) * (vertex2.y + vertex1.y);
        }
        this.area = Math.abs(area / 2);
    }

    draw() {
        fill(255, 255, 255, 100);
        stroke(0, 0, 0);
        drawPolygon(this.vertices, true);
    }
}
