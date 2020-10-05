function setup() {
    createCanvas(innerWidth, innerHeight);
}


//generate a whole bunch of random points within
//a rectangle at the center of the screen 
let randPoints = [];
const pointCount = 50;

for (let i = 0; i < pointCount; i++) {
    randPoints[i] = [Math.random() * innerWidth / 1.5 + innerWidth / 6, Math.random() * innerHeight / 1.5 + innerHeight / 6]
}


//find the leftmost point, because it will
//always be in the hull.
let minIndex = 0;
for (let i = 0; i < pointCount; i++) {
    if (randPoints[i][0] < randPoints[minIndex][0]) minIndex = i;
}

//start the line pointing straight up.
//We know that all the points are to the right
//of the leftmost point, so a vertical line will
//be to the left of all points too, so we can sweep
//from left to right to find the next point, which is
//why we deincrement theta at the end of the loop
let theta = 3.14 / 2;

//init current point with the leftmost point
let currPoint = randPoints[minIndex]

//will keep track of all of the points in the hull.
let hull = [];

function cleanTheta(theta) {
    if (theta < 0) theta = 2 * 3.14 + theta;
    return theta % (2 * 3.14)
}

function thetaAreEqual(t1, t2) {
    return Math.abs(cleanTheta(t2) - cleanTheta(t1)) < 0.01;
}

function pointsAreEqual(p1, p2) {
    return p1[0] === p2[0] && p1[1] === p2[1];
}


let done = false;
function draw() {
    background(33);
    //draw all of the points
    for (let p of randPoints) {
        ellipse(...p, 15)
    }
    //for some reason p5 will run the simulation
    //before everything loads so it will seem sometimes
    //like it started with some points in the hull already
    if (frameCount < 30) return; 

    //draw a special dot for the current point
    push()
    fill(255, 0, 0)
    ellipse(...currPoint, 15);
    pop();

    //main loop for finding the hull
    if (!done) {
        //draw the line
        push();
        stroke(255)
        let lVec = [Math.cos(theta), Math.sin(theta)];
        line(...currPoint, currPoint[0] + 2000 * lVec[0], currPoint[1] - 2000 * lVec[1]);
        pop();

        //atan is bounded by +/- 2pi but we let theta go as low as it wants,
        //so we need to wrap theta around
        let cleanTheta = theta % (2 * 3.14);

        for (let p of randPoints) {
            //if the angle between the current point and the point we are checking
            //is the same angle as the line we are drawing
            //then the line intersects the point
            if (thetaAreEqual(atan2(-p[1] + currPoint[1], p[0] - currPoint[0]), cleanTheta)) {
                console.log("hit", p)
                //draw the hit as a green dot
                fill(0, 255, 0)
                ellipse(...p, 25)
                fill(255)

                //so long as we haven't hit the current point
                //(potentially unnecessary)
                if (p[0] !== currPoint[0] && p[1] != currPoint[1]) {
                    //add the point we hit to the hull
                    hull.push(currPoint);
                    //move the current point to the point we just hit
                    currPoint = p;

                    //if we hit the point we started at
                    //then the hull is closed and we are done.
                    if (pointsAreEqual(currPoint, hull[0])) {
                        done = true;
                    }

                    //break on the first point we hit. 
                    //no need to keep checking points if we
                    //already found one that has been hit.
                    break;
                }
            }
        }
    }


    //draw the hull that we've built so far
    push()
    noFill()
    beginShape()
    stroke(0, 255, 0);
    strokeWeight(3)
    for (let hullPoint of hull) {
        vertex(...hullPoint);
    }
    vertex(...currPoint)
    endShape();
    pop();


    //de-increment theta. We start on the far left
    //so we want to move the line to the right.
    theta -= 0.01;
}