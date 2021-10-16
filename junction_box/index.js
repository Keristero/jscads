const { roundedCuboid, cylinder, sphere, line, cylinderElliptic, cuboid, circle } = require('@jscad/modeling').primitives
const { path2, geom2 } = require('@jscad/modeling').geometries
const { degToRad } = require('@jscad/modeling').utils
const { expand, offset } = require('@jscad/modeling').expansions
const { rotate, translate, rotateZ ,rotateX,rotateY} = require('@jscad/modeling').transforms
const { extrudeLinear, extrudeRectangular, extrudeRotate } = require('@jscad/modeling').extrusions
const { subtract, intersect, union } = require('@jscad/modeling').booleans
const { colorize } = require('@jscad/modeling').colors
const { hullChain } = require('@jscad/modeling').hulls

let circleResolution = 64
let lip_and_groove_depth = 3
let lip_and_groove_tolerance = 0.3
let lid_and_lid_support_tolerance = 1
let screw_diameter_tolerance = 1

function getObject({ wall_thickness, outer_width, outer_length, outer_height,roundedness,holes_through_length,holes_through_width,hole_diameter,hole_membrane_thickness,mounting_screw_diameter,mounting_screw_rows,mounting_screw_row_gap,mounting_screw_extra_depth}) {
    mounting_screw_diameter = mounting_screw_diameter + screw_diameter_tolerance
    let double_wall_thickness = wall_thickness*2
    let half_wall_thickness = wall_thickness/2
    let rounding_resolution = 16
    let hole_radius = hole_diameter/2
    let inner_width = outer_width-double_wall_thickness
    let inner_length = outer_length-double_wall_thickness
    let inner_height = outer_height-double_wall_thickness

    let outside_box = roundedCuboid({
        center:[outer_width/2,outer_length/2,outer_height/2],
        size: [outer_width, outer_length, outer_height], 
        roundRadius: roundedness, 
        segments: rounding_resolution
    })
    let inside_box = roundedCuboid({
        center:[outer_width/2,outer_length/2,outer_height/2],
        size: [inner_width, inner_length, outer_height-double_wall_thickness],
        roundRadius: roundedness, 
        segments: rounding_resolution
    })
    let hollow_box = subtract(outside_box,inside_box)

    let holes = []
    for(let i = 0; i < holes_through_length; i++){
        let hole_punch = cylinder({
            center:[0,outer_height/2,-outer_length/2],
            height: outer_length-(hole_membrane_thickness*2), 
            radius: hole_radius
        })
        hole_punch = rotate([Math.PI / 2, 0, 0], hole_punch)
        let x = (outer_width/(holes_through_length+1))*(i+1)
        hole_punch = translate([x,0,0],hole_punch)
        holes.push(hole_punch)
    }
    for(let i = 0; i < holes_through_width; i++){
        let hole_punch = cylinder({
            center:[0,outer_height/2,outer_width/2],
            height: outer_width-(hole_membrane_thickness*2), 
            radius: hole_radius
        })
        hole_punch = rotate([Math.PI / 2, 0, Math.PI / 2], hole_punch)
        let x = (outer_length/(holes_through_width+1))*(i+1)
        hole_punch = translate([0,x,0],hole_punch)
        holes.push(hole_punch)
    }
    hollow_box = subtract(hollow_box,holes)

    let top_half = cuboid({
        center:[outer_width/2,outer_length/2,outer_height],
        size: [outer_width, outer_length, outer_height], 
        roundRadius: roundedness, 
        segments: rounding_resolution
    })
    top_half = intersect(top_half,hollow_box)

    let bottom_half = cuboid({
        center:[outer_width/2,outer_length/2,0],
        size: [outer_width, outer_length, outer_height], 
        roundRadius: roundedness, 
        segments: rounding_resolution
    })
    bottom_half = intersect(bottom_half,hollow_box)


    //CREATE LIP AND GROOVE
    let lip_mask = cuboid({
        center:[outer_width/2,outer_length/2,outer_height/2],
        size: [outer_width, outer_length, lip_and_groove_depth], 
        roundRadius: roundedness, 
        segments: rounding_resolution
    })
    let groove_mask = cuboid({
        center:[outer_width/2,outer_length/2,outer_height/2],
        size: [inner_width+wall_thickness, inner_length+wall_thickness, lip_and_groove_depth], 
        roundRadius: roundedness, 
        segments: rounding_resolution
    })
    lip_mask = subtract(lip_mask,groove_mask)

    //Remove lip from bottom half
    bottom_half = subtract(bottom_half,lip_mask)

    //Create an overhang mask
    let overhang_mask = subtract(lip_mask,bottom_half)
    let overhang = intersect(hollow_box,overhang_mask)

    //Add the lip mask to the top half
    top_half = union(top_half,overhang)

    //Add tolerance to overhang mask
    overhang_mask = expand({delta: lip_and_groove_tolerance, corners: 'round'}, overhang_mask)
    overhang_mask = translate([0,0,lip_and_groove_tolerance],overhang_mask)
    //remove expanded overhang mask from bottom half
    bottom_half = subtract(bottom_half,overhang_mask)

    //screw holes
    let screw_holes = []
    let screw_bases = []
    let sd = mounting_screw_row_gap
    let screw_hole_base_height = wall_thickness+mounting_screw_extra_depth
    let base_diameter = mounting_screw_diameter*3
    for(let row = 0; row < mounting_screw_rows; row++){
        let hole_locations = [
            [sd,sd],
            [outer_width-sd,sd],
            [sd,outer_length-sd],
            [outer_width-sd,outer_length-sd],
        ]
        for(let hole_location of hole_locations){
            let screw_hole = cylinder({
                center:[hole_location[0],hole_location[1],screw_hole_base_height/2],
                height: screw_hole_base_height, 
                radius: mounting_screw_diameter/2
            })
            let screw_hole_base = cylinder({
                center:[hole_location[0],hole_location[1],screw_hole_base_height/2],
                height: screw_hole_base_height, 
                radius: base_diameter/2
            })
            screw_bases.push(screw_hole_base)
            screw_holes.push(screw_hole)
        }
        sd+= mounting_screw_row_gap
    }

    //lid screws
    sd = (base_diameter/2)+wall_thickness+lid_and_lid_support_tolerance
    screw_hole_base_height = wall_thickness+inner_height
    let hole_locations = [
        [sd,sd],
        [outer_width-sd,sd],
        [sd,outer_length-sd],
        [outer_width-sd,outer_length-sd],
    ]
    for(let hole_location of hole_locations){
        let screw_hole = cylinder({
            center:[hole_location[0],hole_location[1],outer_height-screw_hole_base_height/2],
            height: screw_hole_base_height, 
            radius: mounting_screw_diameter/2
        })
        let screw_hole_base = cylinder({
            center:[hole_location[0],hole_location[1],screw_hole_base_height/2],
            height: screw_hole_base_height, 
            radius: base_diameter/2
        })
        let screw_hole_base_negative = cylinder({
            center:[hole_location[0],hole_location[1],screw_hole_base_height/2],
            height: screw_hole_base_height+lid_and_lid_support_tolerance, 
            radius: (base_diameter/2)+lid_and_lid_support_tolerance
        })
        top_half = subtract(top_half,screw_hole_base_negative)


        screw_bases.push(screw_hole_base)
        screw_holes.push(screw_hole)
    }

    let support_height = (outer_height/2)
    let support_width = (base_diameter*0.8)
    sd = (support_width/2)+wall_thickness
    let extra_support_locations = [
        [sd,sd],
        [outer_width-sd,sd],
        [sd,outer_length-sd],
        [outer_width-sd,outer_length-sd],
    ]
    for(let support_location of extra_support_locations){
        let lid_screw_support = cuboid({
            center:[support_location[0],support_location[1],support_height/2],
            size: [support_width, support_width, support_height]
        })
        screw_bases.push(lid_screw_support)
    }

    bottom_half = union(bottom_half,screw_bases)
    bottom_half = subtract(bottom_half,screw_holes)
    top_half = subtract(top_half,screw_holes)

    top_half = translate([outer_width+8,-outer_length,-outer_height],top_half)

    top_half = rotate([Math.PI, 0, 0], top_half)
       
    return [bottom_half,top_half]
}

function getParameterDefinitions() {
    return [
        { name: 'wall_thickness', type: 'float', initial: 2, caption: 'wall_thickness' },
        { name: 'outer_width', type: 'float', initial: 50, caption: 'outer_width' },
        { name: 'outer_length', type: 'float', initial: 70, caption: 'outer_length' },
        { name: 'outer_height', type: 'float', initial: 35, caption: 'outer_height' },
        { name: 'roundedness', type: 'float', initial: 1, caption: 'roundedness' },
        { name: 'hole_diameter', type: 'float', initial:20, caption: 'hole_diameter' },
        { name: 'holes_through_length', type: 'int', initial: 1, caption: 'holes_through_length' },
        { name: 'holes_through_width', type: 'int', initial: 0, caption: 'holes_through_width' },
        { name: 'hole_membrane_thickness', type: 'float', initial: 0, caption: 'hole_membrane_thickness' },
        { name: 'mounting_screw_diameter', type: 'float', initial: 2, caption: 'mounting_screw_diameter' },
        { name: 'mounting_screw_extra_depth', type: 'float', initial: 1, caption: 'mounting_screw_extra_depth' },
        { name: 'mounting_screw_rows', type: 'int', initial: 1, caption: 'mounting_screw_rows' },
        { name: 'mounting_screw_row_gap', type: 'float', initial: 15, caption: 'mounting_screw_row_gap' },
    ];
}

// Used during design and testing
const main = (params) => {
    console.log(params)
    if (params) {
        let options = {}
        for (let paramindex in params) {
            let parameter = params[paramindex]
            options[parameter.name] = parameter.initial
        }
        let output = getObject(params)

        return output
    }
}

module.exports = { main, getParameterDefinitions }

main()