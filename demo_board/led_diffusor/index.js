const { cylinder,sphere,line,cylinderElliptic, cuboid,square} = require('@jscad/modeling').primitives
const { path2,geom2} = require('@jscad/modeling').geometries
const { expand, offset } = require('@jscad/modeling').expansions
const { degToRad} = require('@jscad/modeling').utils
const { rotate,translate, rotateZ} = require('@jscad/modeling').transforms
const { extrudeLinear, extrudeRectangular, extrudeRotate  } = require('@jscad/modeling').extrusions
const { subtract ,intersect, union} = require('@jscad/modeling').booleans
const { colorize } = require('@jscad/modeling').colors
const { hullChain } = require('@jscad/modeling').hulls


// Used during design and testing
const main = () => {
    let sphere_width = 40
    let cover = sphere({radius: (sphere_width/2),segments:64})
    let led_cutout = sphere({radius: (sphere_width/2)-4,segments:64})
    let hollow_cover = subtract(cover,led_cutout)
    let negative = cuboid({
        center:[sphere_width/4,0,0],
        size:[sphere_width/2, sphere_width, sphere_width]
    })
    let diffusor = subtract(hollow_cover,negative)

    return [diffusor]
}

module.exports = { main }

main()