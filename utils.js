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
    let tryPoint = createVector(random(minX, maxX), random(minY, maxY));
    while (!isPointInPolygon(tryPoint, polygon)) {
        tryPoint = createVector(random(minX, maxX), random(minY, maxY));
    }
    return tryPoint;
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
    const denominator =
        (p4.y - p3.y) * (p2.x - p1.x) - (p4.x - p3.x) * (p2.y - p1.y);
    if (denominator === 0) {
        return null;
    }
    const ua =
        ((p4.x - p3.x) * (p1.y - p3.y) - (p4.y - p3.y) * (p1.x - p3.x)) /
        denominator;
    const ub =
        ((p2.x - p1.x) * (p1.y - p3.y) - (p2.y - p1.y) * (p1.x - p3.x)) /
        denominator;
    if (ua < 0 || ua > 1 || ub < 0 || ub > 1) {
        return null;
    }
    return createVector(p1.x + ua * (p2.x - p1.x), p1.y + ua * (p2.y - p1.y));
}
