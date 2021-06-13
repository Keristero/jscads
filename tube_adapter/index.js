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

function getObject({bottom_inner_diameter,top_inner_diameter,connector_length,transition_length,wall_thickness}) {
    let y = 0
    let btm_options = {
        startRadius: bottom_inner_diameter,
        endRadius: bottom_inner_diameter,
        height: connector_length,
        wall_thickness,
        center: [0, 0, y+connector_length/2]
    }
    y += connector_length
    let bottom_connector = make_tube_section(btm_options)
    let trans_options = {
        startRadius: bottom_inner_diameter,
        endRadius: top_inner_diameter,
        height: transition_length,
        wall_thickness,
        center: [0, 0, y+transition_length/2]
    }
    let transition = make_tube_section(trans_options)
    y += transition_length
    let top_options = {
        startRadius: top_inner_diameter,
        endRadius: top_inner_diameter,
        height: connector_length,
        wall_thickness,
        center: [0, 0, y+connector_length/2]
    }
    let top = make_tube_section(top_options)
    let final = union(bottom_connector, transition, top)
    return final
}

function getParameterDefinitions() {
    return [
        { name: 'bottom_inner_diameter', type: 'int', initial: 205, caption: 'Bottom Inner Diameter' }, 
        { name: 'top_inner_diameter', type: 'int', initial: 145, caption: 'Top Inner Diameter' },
        { name: 'connector_length', type: 'int', initial: 50, caption: 'Connector Length' },
        { name: 'transition_length', type: 'int', initial: 60, caption: 'Transition Length' },
        { name: 'wall_thickness', type: 'int', initial: 5, caption: 'Wall thickness' },
    ];
}

// Used during design and testing
const main = (params) => {
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