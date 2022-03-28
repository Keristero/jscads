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

function getObject({bottom_inner_diameter,top_inner_diameter,bottom_connector_length,snap_hook_width,top_connector_length,transition_length,wall_thickness,top_cut_width}) {
    let y = 0
    let btm_options = {
        startRadius: bottom_inner_diameter/2,
        endRadius: bottom_inner_diameter/2,
        height: bottom_connector_length,
        wall_thickness,
        center: [0, 0, y+bottom_connector_length/2]
    }
    y += bottom_connector_length
    let bottom_connector = make_tube_section(btm_options)
    let trans_options = {
        startRadius: bottom_inner_diameter/2,
        endRadius: top_inner_diameter/2,
        height: transition_length,
        wall_thickness,
        center: [0, 0, y+transition_length/2]
    }
    let transition = make_tube_section(trans_options)
    y += transition_length
    let top_options = {
        startRadius: top_inner_diameter/2,
        endRadius: top_inner_diameter/2,
        height: top_connector_length,
        wall_thickness,
        center: [0, 0, y+top_connector_length/2]
    }
    let top = make_tube_section(top_options)
    let final = union(bottom_connector, transition, top)
    if(top_cut_width > 0){
        let top_cut_negative = cuboid({size: [top_cut_width,top_inner_diameter*2, top_connector_length],center: [0, 0, y+(top_connector_length/1.2)]})
        final = subtract(final,top_cut_negative)
    }
    if(snap_hook_width > 0){
        let top_cut_negative = cuboid({size: [snap_hook_width,top_inner_diameter*2, 2],center: [0, 0, 4]})
        final = subtract(final,top_cut_negative)
    }
    return final
}

function getParameterDefinitions() {
    return [
        { name: 'top_inner_diameter', type: 'float', initial: 47, caption: 'Top Inner Diameter' },
        { name: 'bottom_inner_diameter', type: 'float', initial: 50, caption: 'Bottom Inner Diameter' }, 
        { name: 'wall_thickness', type: 'float', initial: 0.8, caption: 'Wall thickness' },
        { name: 'top_connector_length', type: 'float', initial: 15, caption: 'Top Connector Length' },
        { name: 'bottom_connector_length', type: 'float', initial: 77, caption: 'Bottom Connector Length' },
        { name: 'transition_length', type: 'float', initial: 2, caption: 'Transition Length' },
        { name: 'top_cut_width', type: 'float', initial: 1, caption: 'Top Cut Width' },
        { name: 'snap_hook_width', type: 'float', initial: 8, caption: 'Snap hook Width' },
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