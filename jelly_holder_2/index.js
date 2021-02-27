const { cylinder,sphere,line,cylinderElliptic, cuboid} = require('@jscad/modeling').primitives
const { path2,geom2} = require('@jscad/modeling').geometries
const { degToRad} = require('@jscad/modeling').utils
const { rotate,translate} = require('@jscad/modeling').transforms
const { extrudeLinear, extrudeRectangular, extrudeRotate  } = require('@jscad/modeling').extrusions
const { subtract ,intersect, union} = require('@jscad/modeling').booleans
const { colorize } = require('@jscad/modeling').colors
const { hullChain } = require('@jscad/modeling').hulls

//IMPORTANT
//paths have to be made counter clockwise or else they will end up inside out!!!

function stackableStand() {
    let holeColumns = 3
    let holeRows = 2
    let holeDiameter = 4
    let extraSpaceBetweenHoles = 1.0
    let matarialThickness = 0.25
    let legClearance = 7
    let legHeight = legClearance+(matarialThickness*2)
    let legCount = 4
    let legAttachmentHoleClearance = 0.055
    
    let halfMatarialThickness = matarialThickness/2
    let holeRadius = holeDiameter/2
    let holeSupportDiameter = holeDiameter+(matarialThickness*2)
    let holeSupportRadius = holeSupportDiameter/2
    let rowSupportLength = holeSupportDiameter+(extraSpaceBetweenHoles)
    let columnSupportLength = holeSupportDiameter+(extraSpaceBetweenHoles)

    //Create holder tray
    let supports = []
    let cylinders = []
    let holes = []

    for(let row = 0; row < holeRows; row++){
        for(let column = 0; column < holeColumns; column++){

            let xCenter = (column*holeSupportDiameter)+(column*extraSpaceBetweenHoles)
            let yCenter = (row*holeSupportDiameter)+(row*extraSpaceBetweenHoles)
            
            if(column > 0 && column < holeColumns){
                var support = cuboid({center: [xCenter-(holeSupportRadius+(extraSpaceBetweenHoles/2)),yCenter,halfMatarialThickness], size: [columnSupportLength, matarialThickness, matarialThickness]})
                supports.push(support)
            }

            if(row > 0){
                var support = cuboid({center: [xCenter,yCenter-(holeSupportRadius+(extraSpaceBetweenHoles/2)),halfMatarialThickness], size: [matarialThickness, rowSupportLength, matarialThickness]})
                supports.push(support)
            }

            if(column == 0 || column == holeColumns-1){
                var support = cuboid({center: [xCenter,yCenter,halfMatarialThickness], size: [matarialThickness, rowSupportLength, matarialThickness]})
                supports.push(support)
            }

            c = cylinderElliptic({
                height: matarialThickness, 
                center: [xCenter,yCenter,halfMatarialThickness],
                startRadius: [holeSupportRadius, holeSupportRadius], 
                endRadius: [holeSupportRadius, holeSupportRadius],
                segments: 64
            })
            cylinders.push(c)

            hole = cylinderElliptic({
                height: matarialThickness, 
                center: [xCenter,yCenter,halfMatarialThickness],
                startRadius: [holeRadius-0.1, holeRadius-0.1], 
                endRadius: [holeRadius, holeRadius],
                segments: 32
            })
            holes.push(hole)
        }
    }

    //combine supports with cylinders
    let output = union(cylinders,supports)
    //Make holes in cylinders
    output = subtract(output,holes)
    
    //generate some legs
    let legs = []
    let legHoles = []
    for(let leg = 0; leg < legCount; leg++){
        let yOffset = (holeRows*holeSupportDiameter)+((holeRows-1)*extraSpaceBetweenHoles)+(leg*matarialThickness*4)
        
        var l = cuboid({center: [legClearance/2, yOffset, matarialThickness], size: [legHeight, matarialThickness*2, matarialThickness*2]})
        var legTop = cuboid({center: [legClearance, yOffset, matarialThickness], size: [matarialThickness*3, matarialThickness*3, matarialThickness*2]})
        l = union(legTop,l)
        let legHoleScale = (matarialThickness+legAttachmentHoleClearance)//+(leg*0.01)
        var hole = cuboid({center: [legClearance, yOffset, matarialThickness], size: [legHoleScale, legHoleScale, matarialThickness*2]})
        l = subtract(l,hole)
        legs.push(l)
        //legHoles.push(hole)
    }

    //Test code
    /*
    let legs = []
    let legHoles = []
    for(let leg = 0; leg < legCount; leg++){
        let yOffset = (holeRows*holeSupportDiameter)+(leg*matarialThickness*4)
        
        //var l = cuboid({center: [legClearance/2, yOffset, matarialThickness], size: [legHeight, matarialThickness*2, matarialThickness*2]})
        var legTop = cuboid({center: [legClearance, yOffset, matarialThickness], size: [matarialThickness*2, matarialThickness*2, matarialThickness*0.5]})
        l = legTop//union(legTop,l)
        let legHoleScale = (matarialThickness+legAttachmentHoleClearance)//+(leg*0.01)
        var hole = cuboid({center: [legClearance, yOffset, matarialThickness], size: [legHoleScale, legHoleScale, matarialThickness*2]})
        l = subtract(l,hole)
        legs.push(l)
        //legHoles.push(hole)
    }

    */
    //return [footLeft,footRight,topLeft,topRight]
    return [output,legs]
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