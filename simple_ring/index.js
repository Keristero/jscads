const { cylinder, sphere, line, cylinderElliptic, cuboid, circle } = require('@jscad/modeling').primitives
const { path2, geom2 } = require('@jscad/modeling').geometries
const { degToRad } = require('@jscad/modeling').utils
const { rotate, translate, rotateZ } = require('@jscad/modeling').transforms
const { extrudeLinear, extrudeRectangular, extrudeRotate } = require('@jscad/modeling').extrusions
const { subtract, intersect, union } = require('@jscad/modeling').booleans
const { colorize } = require('@jscad/modeling').colors
const { hullChain } = require('@jscad/modeling').hulls

let circleResolution = 128

function make_tube_section({ height, startRadius, endRadius, wall_thickness, center }) {
    let inner_cylinder = cylinderElliptic({
        startRadius: [startRadius, startRadius],
        endRadius: [endRadius, endRadius],
        height,
        segments: circleResolution,
        center
    })
    let outer_cylinder = cylinderElliptic({
        startRadius: [startRadius + wall_thickness, startRadius + wall_thickness],
        endRadius: [endRadius + wall_thickness, endRadius + wall_thickness],
        height,
        segments: circleResolution,
        center
    })
    return subtract(outer_cylinder, inner_cylinder)
}

function subtract_mounting_zones({geometry,center_offset,height,zone_depth}){
    let n_cube = cuboid({size: [25, 20, zone_depth*2], center: [-center_offset, 0, height]})
    let s_cube = cuboid({size: [25, 20, zone_depth*2], center: [center_offset, 0, height]})
    let w_cube = cuboid({size: [20, 25, zone_depth*2], center: [0, -center_offset, height]})
    let e_cube = cuboid({size: [20, 25, zone_depth*2], center: [0, center_offset, height]})
    geometry = subtract(geometry,n_cube,s_cube,w_cube,e_cube)
    return geometry
}

function getObject({bottom_inner_diameter,height,wall_thickness}) {
    let y = 0
    let btm_options = {
        startRadius: bottom_inner_diameter/2,
        endRadius: bottom_inner_diameter/2,
        height: height,
        wall_thickness,
        center: [0, 0, y+height/2]
    }
    y += height
    let bottom_connector = make_tube_section(btm_options)
    bottom_connector = subtract_mounting_zones({
        geometry:bottom_connector,
        center_offset:bottom_inner_diameter,
        height:height,
        zone_depth:3
    })
    return bottom_connector
}

function getParameterDefinitions() {
    return [
        { name: 'bottom_inner_diameter', type: 'float', initial: 29, caption: 'Bottom Inner Diameter' }, 
        { name: 'wall_thickness', type: 'float', initial: 18, caption: 'Wall thickness' },
        { name: 'height', type: 'float', initial: 8, caption: 'height' },
    ];
}

// Used during design and testing
const main = (params) => {
    console.log(params)
    if(params){
        let options = {}
        for(let paramindex in params){
            let parameter = params[paramindex]
            options[parameter.name] = parameter.initial
        }
        let output = getObject(params)
    
        return output
    }
}

module.exports = { main ,getParameterDefinitions}

main()