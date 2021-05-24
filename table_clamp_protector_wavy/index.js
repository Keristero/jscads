const { cylinder,sphere,line,cylinderElliptic, cuboid} = require('@jscad/modeling').primitives
const { path2,geom2} = require('@jscad/modeling').geometries
const { degToRad} = require('@jscad/modeling').utils
const { rotate,translate, rotateZ} = require('@jscad/modeling').transforms
const { extrudeLinear, extrudeRectangular, extrudeRotate  } = require('@jscad/modeling').extrusions
const { subtract ,intersect, union} = require('@jscad/modeling').booleans
const { colorize } = require('@jscad/modeling').colors
const { hullChain } = require('@jscad/modeling').hulls

let tableThicknessMilimeters = 25 //internal thickness of table which it clamps around
let printThickness = 3 //matarial thickness for protecting table
let depth = 50 //distance it protrudes onto the desk
let width = 40
let gripWiggleFreqency = 1
let gripWiggleAmplitude = 1

function getDistance(xA, yA, xB, yB) { 
	var xDiff = xA - xB; 
	var yDiff = yA - yB;

	return Math.sqrt(xDiff * xDiff + yDiff * yDiff);
}

function rotateAround(cx, cy, x, y, radians) {
    let cos = Math.cos(radians)
    let sin = Math.sin(radians)
    let nx = (cos * (x - cx)) + (sin * (y - cy)) + cx
    let ny = (cos * (y - cy)) - (sin * (x - cx)) + cy
    return [nx, ny];
}

function zigZag(a1,a2){
    return generateZigZagPointsBetween({x:a1[0],y:a1[1]},{x:a2[0],y:a2[1]},gripWiggleFreqency,gripWiggleAmplitude)
}

function generateZigZagPointsBetween(p1,p2,freqency,amplitude){
    let points = []
    let direction = 1
    let angleRadians = Math.atan2(p2.y - p1.y, p2.x - p1.x);
    let distance = getDistance(p1.x,p1.y,p2.x,p2.y)
    let number = distance/freqency
    //Add first and second point
    for(let i = 0; i < number; i ++){
        let rotatedPoint = rotateAround(0,0,i*freqency,direction*amplitude,-angleRadians)
        //Translate it to the right starting point
        rotatedPoint[0]+=p1.x
        rotatedPoint[1]+=p1.y
        //Add it to the list
        points.push(rotatedPoint)
        //reverse the zig zag direction each iteration
        if(direction == 1){
            direction = -1
        }else{
            direction = 1
        }
    }
    return points
}

function table_clamp_protection(){
    let points = [[0,0]]
    points = points.concat(zigZag([-tableThicknessMilimeters,0],[-tableThicknessMilimeters,-depth]))
    points.push([-tableThicknessMilimeters,-depth])
    points.push([-(tableThicknessMilimeters+printThickness),-depth])
    points.push([-(tableThicknessMilimeters+printThickness),printThickness])
    points.push([printThickness,printThickness])
    points.push([printThickness,-depth])
    points.push([0,-depth])
    points = points.concat(zigZag([0,-depth],[0,0]))
    points = points.reverse()
    let pathLine = line(points)
    let closedPath = path2.close(pathLine)
    let obj2d = geom2.fromPoints(path2.toPoints(closedPath))
    let obj3d = extrudeLinear({height:width},obj2d)
    return [obj3d]
}

[0,0],
[-tableThicknessMilimeters,0],
[-tableThicknessMilimeters,-depth],
[-(tableThicknessMilimeters+printThickness),-depth],
[-(tableThicknessMilimeters+printThickness),printThickness],
[printThickness,printThickness],
[printThickness,-depth],
[0,-depth]


// Used during design and testing
const main = (params) => {
    let output = table_clamp_protection()

    return output
}

module.exports = { main }

main()