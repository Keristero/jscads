const { cylinder, sphere, line, cylinderElliptic, cuboid, circle } = require('@jscad/modeling').primitives
const { path2, geom2 } = require('@jscad/modeling').geometries
const { degToRad } = require('@jscad/modeling').utils
const { rotate, translate, rotateZ } = require('@jscad/modeling').transforms
const { extrudeLinear, extrudeRectangular, extrudeRotate } = require('@jscad/modeling').extrusions
const { subtract, intersect, union } = require('@jscad/modeling').booleans
const { colorize } = require('@jscad/modeling').colors
const { hullChain } = require('@jscad/modeling').hulls

let circleResolution = 32


function getObject({vslot_length,vslot_width,vslot_depth,camera_mount_height,camera_mount_screw_slot_width}) {
    const mount_length = 20
    const slot_height = camera_mount_height-10
    const camera_plate_thickness = 2
    const camera_plate_offset = (vslot_width/2)-(camera_plate_thickness/2)
    let vslot_insert = cuboid({size: [vslot_length, vslot_width, vslot_depth],center:[0,0,vslot_depth/2]})
    let camera_mount_plate = cuboid({size: [mount_length, camera_plate_thickness, camera_mount_height],center:[0,camera_plate_offset,vslot_depth+(camera_mount_height/2)]})
    let camera_mount_slot_cutout = cuboid({size: [camera_mount_screw_slot_width, camera_plate_thickness, slot_height],center:[0,camera_plate_offset,vslot_depth+5+(slot_height/2)]})
    camera_mount_plate = subtract(camera_mount_plate,camera_mount_slot_cutout)

    return union(vslot_insert,camera_mount_plate)
}

function getParameterDefinitions() {
    return [
        { name: 'vslot_length', type: 'int', initial: 50, caption: 'vslot length' },
        { name: 'vslot_width', type: 'int', initial: 6, caption: 'vslot width' }, 
        { name: 'vslot_depth', type: 'int', initial: 5, caption: 'vslot depth' }, 
        { name: 'camera_mount_height', type: 'int', initial: 45, caption: 'mount height' }, 
        { name: 'camera_mount_screw_slot_width', type: 'int', initial: 5.5, caption: 'mount height' }, 
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