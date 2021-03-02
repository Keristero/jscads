const { cylinder,sphere,line,cylinderElliptic, cuboid} = require('@jscad/modeling').primitives
const { path2,geom2} = require('@jscad/modeling').geometries
const { degToRad} = require('@jscad/modeling').utils
const { rotate,translate, rotateZ} = require('@jscad/modeling').transforms
const { extrudeLinear, extrudeRectangular, extrudeRotate  } = require('@jscad/modeling').extrusions
const { subtract ,intersect, union} = require('@jscad/modeling').booleans
const { colorize } = require('@jscad/modeling').colors
const { hullChain } = require('@jscad/modeling').hulls

let plugSealRadius = 30
let plugSealThickness = 0.8
let spacerRadius = 20
let spacerIndentRadius = 15
let spacerIndentDepth = 1
let spacerThickness = 5
let plugScrewRadius = 4

let circleResolution = 128

function plug(){
    let plugSeal = cylinder({radius: plugSealRadius, height: plugSealThickness, center:[0,0,plugSealThickness/2],segments:circleResolution})
    let plugSpacer = cylinder({radius: spacerRadius, height: spacerThickness, center:[0,0,plugSealThickness+(spacerThickness/2)],segments:circleResolution})
    //Indent for back plate of plug which screws in
    let plugSpacerIndent = cylinder({radius: spacerIndentRadius, height: spacerIndentDepth*2, center:[0,0,plugSealThickness+spacerThickness]})
    let plugSpacerWithIndent = subtract(plugSpacer,plugSpacerIndent)
    //Screw hole for connecting back plate to hold the seal in place
    let screwHoleCylinder = cylinder({radius: plugScrewRadius, height: plugSealThickness+spacerThickness, center:[0,0,(plugSealThickness+spacerThickness)/2]})
    let plug = union(plugSeal,plugSpacerWithIndent)
    let plugWithHole = subtract(plug,screwHoleCylinder)
    return plugWithHole
}

// Used during design and testing
const main = (params) => {
    let output = plug()

    return output
}

module.exports = { main }

main()