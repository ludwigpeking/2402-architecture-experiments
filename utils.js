function drawPropertyLineAndAccessLine(propertyLine, accessLine) {
    stroke(0);
    strokeWeight(1);
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

function isPointInPolygon(point, polygon, tolerance = 0.0000001) {
    let isInside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        // Check if point is approximately on the same height as the vertex, allowing for tolerance
        let onEdgeY =
            polygon[i].y > point.y - tolerance !=
            polygon[j].y > point.y + tolerance;
        // Calculate cross product with an added tolerance to effectively widen the edge detection
        let crossProduct =
            ((polygon[j].x - polygon[i].x) * (point.y - polygon[i].y)) /
                (polygon[j].y - polygon[i].y) +
            polygon[i].x -
            point.x;

        if (onEdgeY && crossProduct < tolerance) {
            isInside = !isInside;
        }
    }
    return isInside;
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
    let tryPoint = new p5.Vector(random(minX, maxX), random(minY, maxY));
    while (!isPointInPolygon(tryPoint, polygon)) {
        tryPoint = new p5.Vector(random(minX, maxX), random(minY, maxY));
    }
    return tryPoint;
}

function calculateCentroid(points) {
    let centroid = new p5.Vector(0, 0);
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

function areaCalculation(vertices) {
    let area = 0;
    for (let i = 0; i < vertices.length; i++) {
        const vertex1 = vertices[i];
        const vertex2 = vertices[(i + 1) % vertices.length];
        area += (vertex2.x - vertex1.x) * (vertex2.y + vertex1.y);
    }
    return Math.abs(area / 2);
}

//function to test if two edges interest each other
function lineIntersect(p1, p2, p3, p4) {
    const tolerance = 1e-10; // A small tolerance value
    const denominator =
        (p4.y - p3.y) * (p2.x - p1.x) - (p4.x - p3.x) * (p2.y - p1.y);

    if (Math.abs(denominator) < tolerance) {
        return null; // Lines are parallel or coincident
    }

    const ua =
        ((p4.x - p3.x) * (p1.y - p3.y) - (p4.y - p3.y) * (p1.x - p3.x)) /
        denominator;
    const ub =
        ((p2.x - p1.x) * (p1.y - p3.y) - (p2.y - p1.y) * (p1.x - p3.x)) /
        denominator;

    // Adjusting conditions to exclude exact endpoints with a tolerance
    if (
        ua <= tolerance ||
        ua >= 1 - tolerance ||
        ub <= tolerance ||
        ub >= 1 - tolerance
    ) {
        return null; // Intersection is too close to the endpoints or outside the line segments
    }

    return new p5.Vector(p1.x + ua * (p2.x - p1.x), p1.y + ua * (p2.y - p1.y));
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
    const normal = new p5.Vector(-direction.y, direction.x);
    normal.normalize();
    pointNew = new p5.Vector(point.x, point.y);
    const v = p5.Vector.sub(pointNew, start);
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

function drawPerpendicularDashLineFromPointToLine(
    point,
    start,
    end,
    dashLength
) {
    // Calculate direction vector of the line
    const lineDirection = p5.Vector.sub(end, start).normalize();

    // Calculate vector from start to point
    const toPoint = p5.Vector.sub(point, start);

    // Project toPoint onto the line direction to find the closest point on the line
    const projectionLength = toPoint.dot(lineDirection);
    const projection = lineDirection.copy().mult(projectionLength);
    const closestPoint = p5.Vector.add(start, projection);

    // Calculate the perpendicular direction from the closest point to the point
    const perpendicularDirection = p5.Vector.sub(point, closestPoint);

    // Calculate the number of dashes based on the perpendicular distance
    const distance = perpendicularDirection.mag();
    const dashSpace = dashLength * 2; // Considering both dash and space have the same length
    const numberOfDashes = Math.floor(distance / dashSpace);

    // Draw dashes
    for (let i = 0; i < numberOfDashes; i++) {
        const dashStart = p5.Vector.add(
            closestPoint,
            perpendicularDirection.copy().setMag(i * dashSpace)
        );
        const dashEnd = p5.Vector.add(
            dashStart,
            perpendicularDirection.copy().setMag(dashLength)
        );

        line(dashStart.x, dashStart.y, dashEnd.x, dashEnd.y);
    }
}

//text if a line is inside a polygon, iterate through all the edges of the polygon and check if the line intersects with any of them
function isLineInsidePolygon(start, end, polygon) {
    for (let i = 0; i < polygon.length; i++) {
        const startEdge = polygon[i];
        const endEdge = polygon[(i + 1) % polygon.length];
        if (lineIntersect(start, end, startEdge, endEdge)) {
            return false;
        }
    }
    //check the middle point of the line is inside the polygon
    const middle = p5.Vector.lerp(start, end, 0.5);
    if (!isPointInPolygon(middle, polygon)) {
        return false;
    }
    return true;
}

function simplifiedAStar(start, goal, polygon) {
    // console.log("start", start, "goal", goal, "polygon", polygon);
    const openSet = [start]; // Include all nodes initially
    const nodes = [start, goal, ...polygon]; // Include all nodes initially
    //reset the g, f, h scores and cameFrom of all nodes
    for (let i = 0; i < nodes.length; i++) {
        nodes[i].g = Infinity;
        nodes[i].f = Infinity;
        nodes[i].h = heuristic(nodes[i], goal);
        nodes[i].cameFrom = null;
    }
    let current = start;
    start.g = 0;
    start.f = start.h;
    const path = [];

    // console.log("nodes", nodes);

    while (openSet.length > 0) {
        // Sort nodes in openSet by fScore and select the one with the lowest fScore
        openSet.sort((a, b) => a.f - b.f);
        let current = openSet.shift(); // Remove and get the first element

        // If the current node is the goal, reconstruct and return the path
        if (current === goal) {
            // console.log("Path found", " path length", calculatePathDistance(reconstructPath( start, goal)), "direct length", p5.Vector.dist(start, goal));
            noFill();
            stroke(0, 255, 0);
            // line(start.x, start.y, goal.x, goal.y);
            return reconstructPath(start, goal);
        }

        // Attempt to move to every other node, checking if the path is inside the polygon
        nodes.forEach((neighbor) => {
            if (
                neighbor === current ||
                !isLineInsidePolygon(current, neighbor, polygon)
            ) {
                return;
            } else {
                let tentativeGScore = current.g + heuristic(current, neighbor);
                if (tentativeGScore < neighbor.g) {
                    neighbor.cameFrom = current;
                    neighbor.g = tentativeGScore;
                    neighbor.f = neighbor.g + heuristic(neighbor, goal);
                    if (!openSet.includes(neighbor)) {
                        openSet.push(neighbor);
                    }
                }
            }
        });
    }

    // If no path is found, return an empty array
    return path;
}

function reconstructPath(start, goal) {
    let current = goal;
    const path = [current];
    while (current !== start) {
        current = current.cameFrom;
        path.push(current);
    }
    // console.log("path", path);
    //draw the path with dash line
    noFill();
    stroke(0, 255, 0, lineOpacity * 10);
    for (let i = 0; i < path.length - 1; i++) {
        // drawDashLine(path[i], path[i + 1], 5);
        line(path[i].x, path[i].y, path[i + 1].x, path[i + 1].y);
    }

    return path.reverse();
}

// calculate the reconstructedPath distance
function calculatePathDistance(path) {
    let distance = 0;
    for (let i = 1; i < path.length; i++) {
        distance += p5.Vector.dist(path[i - 1], path[i]);
    }
    return distance;
}

// Example heuristic function (Euclidean distance)
function heuristic(nodeA, nodeB) {
    return Math.sqrt((nodeA.x - nodeB.x) ** 2 + (nodeA.y - nodeB.y) ** 2);
}
