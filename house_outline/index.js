const { cylinder,sphere,line,cylinderElliptic, cuboid,square} = require('@jscad/modeling').primitives
const { path2,geom2} = require('@jscad/modeling').geometries
const { expand, offset } = require('@jscad/modeling').expansions
const { degToRad} = require('@jscad/modeling').utils
const { rotate,translate, rotateZ} = require('@jscad/modeling').transforms
const { extrudeLinear, extrudeRectangular, extrudeRotate  } = require('@jscad/modeling').extrusions
const { subtract ,intersect, union} = require('@jscad/modeling').booleans
const { colorize } = require('@jscad/modeling').colors
const { hullChain } = require('@jscad/modeling').hulls

function houseShape({wall_height,building_width,eve_length,roof_height}){
    let points = [
        [0,0],
        [0,wall_height],
        [-eve_length,wall_height],
        [building_width/2,roof_height+wall_height],
        [building_width+eve_length,wall_height],
        [building_width,wall_height],
        [building_width,0],
        [0,0]
    ]
    let pathLine = line(points)
    return pathLine
}

// Used during design and testing
const main = (parameters) => {
    let scale = 2
    let defaults = {
        line_thickness:1*scale,
        wall_height:100*scale,
        building_width:150*scale,
        eve_length:20*scale,
        roof_height:80*scale,
        house_extrusion:10*scale
    }
    let settings = Object.assign(parameters,defaults)
    let {line_thickness,wall_height,building_width,eve_length,roof_height,house_extrusion} = settings


    let house_settings = {wall_height,building_width,eve_length,roof_height}
    let house_shape = houseShape(house_settings)
    let thick_walled_house = expand({delta: line_thickness, corners: 'round'}, house_shape)
    let extruded_house = extrudeLinear({height:house_extrusion},thick_walled_house)

    return [extruded_house]
}

module.exports = { main }

let test_options = {
    line_thickness:0.2
}
main(test_options)