const { cylinder, sphere, line, cylinderElliptic, cuboid, circle } = require('@jscad/modeling').primitives
const { path2, geom2 } = require('@jscad/modeling').geometries
const { degToRad } = require('@jscad/modeling').utils
const { rotate, translate, rotateZ } = require('@jscad/modeling').transforms
const { extrudeLinear, extrudeRectangular, extrudeRotate } = require('@jscad/modeling').extrusions
const { subtract, intersect, union } = require('@jscad/modeling').booleans
const { colorize } = require('@jscad/modeling').colors
const { hullChain } = require('@jscad/modeling').hulls

let circleResolution = 128

function getObject({attachment_cylinder_diameter}) {
    let attachment_radius = attachment_cylinder_diameter/2
    let inner_cylinder = cylinderElliptic({
        startRadius: [attachment_radius, attachment_radius],
        endRadius: [attachment_radius, attachment_radius],
        height:10,
        segments: circleResolution,
        center:[0,0,0]
    })
    return inner_cylinder
}

function getParameterDefinitions() {
    return [
        { name: 'attachment_cylinder_diameter', type: 'float', initial: 2.5, caption: 'Blind Attachment Diameter' },
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