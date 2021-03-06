const { cylinder,sphere,line,cylinderElliptic} = require('@jscad/modeling').primitives
const { path2,geom2} = require('@jscad/modeling').geometries
const { degToRad} = require('@jscad/modeling').utils
const { rotate,translate} = require('@jscad/modeling').transforms
const { extrudeLinear, extrudeRectangular, extrudeRotate  } = require('@jscad/modeling').extrusions
const { subtract ,intersect} = require('@jscad/modeling').booleans
const { colorize } = require('@jscad/modeling').colors

//IMPORTANT
//paths have to be made counter clockwise or else they will end up inside out!!!

function stackableStand() {
    let holeColumns = 3
    let holeRows = 2
    let holeDiameter = 4
    let spaceBetweenHoles = 1.2
    let holeHeightClearance = 6
    let matarialThickness = 0.1
    let legOffset = 1.5
    let holeRadius = holeDiameter/2
    let middleWidth = ((holeDiameter+spaceBetweenHoles) * holeColumns)+(spaceBetweenHoles*2)
    let depth = (spaceBetweenHoles*2)+((holeDiameter+spaceBetweenHoles) * holeRows)
    let height = holeHeightClearance
    let cornerStrongerning = 1
    let highestPoint = (matarialThickness+height)

    //First draw the stand on its side
    let sidewaysOutlinePath = line([
        [0, 0], //bottom left (outside)
        [legOffset, highestPoint],//top left
        [middleWidth+legOffset,highestPoint],//top right
        [middleWidth+(legOffset*2), 0],//bottom right
        [middleWidth+(legOffset*2)-matarialThickness, 0],//bottom right (inside)
        [(middleWidth+legOffset-matarialThickness)-cornerStrongerning,highestPoint-matarialThickness],//top right
        [(legOffset+matarialThickness)+cornerStrongerning, highestPoint-matarialThickness],//top left
        [matarialThickness, 0] //bottom left
    ].reverse())//Make path inside out!
    let closedPath = path2.close(sidewaysOutlinePath)
    let stand2d = geom2.fromPoints(path2.toPoints(closedPath))

    //Now make the stand 3d!
    let stand3d = extrudeLinear({height:depth},stand2d)

    //Now stand it upright
    stand3d = rotate([degToRad(90),0,0],stand3d)

    //Make some cones
    let xOffset = legOffset+holeRadius+spaceBetweenHoles+(spaceBetweenHoles*0.5)
    let yOffset = depth - holeRadius - spaceBetweenHoles-(spaceBetweenHoles*0.5)
    let zOffset = height/2-matarialThickness
    let cylinders = []
    for(let row = 0; row < holeRows; row++){
        for(let column = 0; column < holeColumns; column++){
            c = cylinderElliptic({
                height: holeHeightClearance, 
                center: [(column*(holeDiameter+spaceBetweenHoles))+xOffset,(row*(holeDiameter+spaceBetweenHoles))-yOffset,height-zOffset],
                startRadius: [0.1, 0.1], 
                endRadius: [holeRadius, holeRadius],
                segments: 32
            })
            cylinders.push(c)
        }
    }

    //make holes by subtract the cones from the stand
    stand3d = subtract(stand3d,cylinders)

    return stand3d
}

function holder() {
    return stackableStand()
}

// Used during design and testing
const main = (params) => {
    let output = holder()

    return output
}

module.exports = { main }