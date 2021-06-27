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
    let cap_diameter = 20
    let cap_height = 5
    let plug_height = 6
    let plug_diameter = 14
    let full_height = plug_height+cap_height
    let plug = cylinder({radius: (plug_diameter/2),height:plug_height,segments:48,center:[0,0,plug_height/2]})
    let plug_cap = cylinder({radius: (cap_diameter/2),height:cap_height,segments:48,center:[0,0,plug_height+(cap_height/2)]})
    let plug_cap_negative = cylinder({radius: (cap_diameter/2)-2,height:cap_height-1,segments:48,center:[0,0,plug_height+((cap_height/2))]})
    let plug_cap_hollow = subtract(plug_cap,plug_cap_negative)
    let plug_hollow_center = cylinder({radius: (plug_diameter/2)-2,height:full_height-2,segments:48,center:[0,0,(full_height/2)-1]})
    let full_plug = union(plug,plug_cap_hollow)
    let full_plug_hollow = subtract(full_plug,plug_hollow_center)

    return [full_plug_hollow]
}

module.exports = { main }

main()