const { cylinder, sphere, line, cylinderElliptic, cuboid, circle } = require('@jscad/modeling').primitives
const { path2, geom2 } = require('@jscad/modeling').geometries
const { degToRad } = require('@jscad/modeling').utils
const { rotate, translate, rotateZ } = require('@jscad/modeling').transforms
const { extrudeLinear, extrudeRectangular, extrudeRotate } = require('@jscad/modeling').extrusions
const { subtract, intersect, union } = require('@jscad/modeling').booleans
const { colorize } = require('@jscad/modeling').colors
const { hullChain } = require('@jscad/modeling').hulls

let circleResolution = 64

function getObject({inner_hub_diameter,hub_thickness,axel_diameter,extra_top_thickness,tolerance}) {
    let inner_hub_height = 3
    axel_diameter = axel_diameter+tolerance
    inner_hub_diameter = inner_hub_diameter+tolerance
    let axel_radius = axel_diameter*0.5
    let inner_hub_radius = inner_hub_diameter*0.5
    let inner_hub = cylinder({center:[0,0,0], height: inner_hub_height, radius: inner_hub_radius})
    let outer_hub = cylinder({center:[0,0,(hub_thickness*0.5)+(extra_top_thickness*0.5)], height: inner_hub_height+hub_thickness+extra_top_thickness, radius: inner_hub_radius+hub_thickness})
    let hub = subtract(outer_hub,inner_hub)
    let axel_hole = cylinder({center:[0,0,inner_hub_height*0.5], height: inner_hub_height*20, radius: axel_radius})
    hub = subtract(hub,axel_hole)
    return hub
}

function getParameterDefinitions() {
    return [
        { name: 'inner_hub_diameter', type: 'float', initial: 22, caption: 'inner_hub_diameter' },
        { name: 'hub_thickness', type: 'float', initial: 1, caption: 'hub_thickness' },
        { name: 'axel_diameter', type: 'float', initial: 2.3, caption: 'axel_diameter' },
        { name: 'extra_top_thickness', type: 'float', initial: 1, caption: 'extra_top_thickness' },
        { name: 'tolerance', type: 'float', initial: 0.2, caption: 'tolerance' }
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