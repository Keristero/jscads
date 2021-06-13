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
    let cylinder_height = 80
    let cylinder_width = 40
    let shape = cylinder({height:cylinder_height, radius: cylinder_width/2,segments:128})
    let negative = cuboid({
        center:[cylinder_width/4,0,0],
        size:[cylinder_width/2, cylinder_width, cylinder_height]
    })
    let half_cylinder = subtract(shape,negative)
    let led_cutout = sphere({radius: (cylinder_width/2)-5,segments:128})
    let hot_water_cylinder = subtract(half_cylinder,led_cutout)

    return [hot_water_cylinder]
}

module.exports = { main }

main()