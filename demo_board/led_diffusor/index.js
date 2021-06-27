const { cylinder,sphere,line,cylinderElliptic, cuboid,square} = require('@jscad/modeling').primitives
const { path2,geom2} = require('@jscad/modeling').geometries
const { expand, offset } = require('@jscad/modeling').expansions
const { degToRad} = require('@jscad/modeling').utils
const { rotate,translate, rotateZ} = require('@jscad/modeling').transforms
const { extrudeLinear, extrudeRectangular, extrudeRotate  } = require('@jscad/modeling').extrusions
const { subtract ,intersect, union} = require('@jscad/modeling').booleans
const { colorize } = require('@jscad/modeling').colors
const { hullChain } = require('@jscad/modeling').hulls


function screw_slot(center,height,inner_diameter){
    let screw_block = cylinder({radius: (inner_diameter/2)+2.5,height:height,segments:16,center:[center[0],center[1],center[2]]})
    let guide_hole = cylinder({radius: inner_diameter/2,height:height,segments:16,center:[center[0],center[1],center[2]-4]})
    let screw_slot_with_hole = subtract(screw_block,guide_hole)
    return screw_slot_with_hole
}

// Used during design and testing
const main = () => {
    let sphere_width = 50
    let height = 13
    let cover = cylinder({radius: (sphere_width/2),height:height,segments:64,center:[0,0,height/2]})
    let led_cutout = cylinder({radius: (sphere_width/2)-0.5,height:height,segments:64,center:[0,0,(height/2)-0.5]})
    let hollow_cover = subtract(cover,led_cutout)
    let screw_block = screw_slot([-21.5,0,height/2],height,2)
    let screw_block_2 = screw_slot([21.5,0,height/2],height,2)

    return [hollow_cover,screw_block,screw_block_2]
}

module.exports = { main }

main()