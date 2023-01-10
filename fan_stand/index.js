const jscad = require('@jscad/modeling')
const { union,subtract} = jscad.booleans
const { extrudeLinear } = jscad.extrusions
const { hullChain,hull } = jscad.hulls
const { circle, sphere,cylinder,cuboid} = jscad.primitives
const { vectorText } = jscad.text
const { translate,scale,rotate} = jscad.transforms
const { expand } = jscad.expansions

const getParameterDefinitions = () => {
    return [
        { name: 'fan_size_mm', initial: 140, type: 'int', caption: 'Fan Size (mm)' },
        { name: 'fan_thickness_mm', initial: 26, type: 'int', caption: 'Fan Thickness (mm)' },
        { name: 'stand_extra_width', initial: 40, type: 'int', caption: 'Stand Extra Width (mm)' },
        { name: 'stand_extra_length', initial: 20, type: 'int', caption: 'Stand Extra Length (mm)' },
        { name: 'stand_thickness', initial: 1, type: 'int', caption: 'Stand Thickness (mm)' },
        { name: 'mounting_screw_diameter', initial: 4, type: 'int', caption: 'mounting_screw_diameter (mm)' },
        { name: 'mounting_screw_edge_distance', initial: 7.5, type: 'float', caption: 'mounting_screw_edge_distance (mm)' },
        { name: 'mounting_screw_head_diameter', initial: 8, type: 'int', caption: 'mounting_screw_head_diameter (mm)' },
    ]
}


const main = ({fan_size_mm,fan_thickness_mm,stand_extra_width,stand_extra_length,stand_thickness,mounting_screw_diameter,mounting_screw_edge_distance,mounting_screw_head_diameter}) => {
    let bracket_width = 4
    let bracket_length = mounting_screw_head_diameter*1.5
    let h_bracket_width = bracket_width/2
    let h_stand_thickness = stand_thickness/2
    let h_fan_size_mm = fan_size_mm/2
    let distance_from_middle_to_screw_y = h_fan_size_mm-mounting_screw_edge_distance
    let h_fan_thickness_mm = fan_thickness_mm/2
    let mounting_screw_radius = mounting_screw_diameter/2
    let mounting_screw_head_radius = mounting_screw_head_diameter/2
    let asssembly;
    let degrees_90_to_radians = Math.PI/2

    let stand_length = fan_size_mm+stand_extra_length
    let stand_width = fan_thickness_mm+stand_extra_width
    const stand = cuboid({size:[stand_width,stand_length,stand_thickness],center:[0,0,h_stand_thickness]})
    let bracket_locations = [
        {y:-distance_from_middle_to_screw_y,x:-h_fan_thickness_mm-h_bracket_width,flipped:false},
        {y:distance_from_middle_to_screw_y,x:-h_fan_thickness_mm-h_bracket_width,flipped:false},
        {y:-distance_from_middle_to_screw_y,x:h_fan_thickness_mm+h_bracket_width,flipped:true},
        {y:distance_from_middle_to_screw_y,x:h_fan_thickness_mm+h_bracket_width,flipped:true}
    ]
    let brackets = []
    for(let location of bracket_locations){
        let bracket_height = mounting_screw_edge_distance*2
        let bracket_shadow_width = stand_width/2-(h_fan_thickness_mm+bracket_width/2)
        let bracket_shadow_thickness = 0.5
        let new_bracket = cuboid({size:[bracket_width,bracket_length,bracket_height],center:[location.x,location.y,stand_thickness+(bracket_height/2)]})
        let bracket_shadow_x_offset = bracket_shadow_width/2
        if(location.flipped){
            bracket_shadow_x_offset*=-1
        }
        let bracket_shadow = cuboid({size:[bracket_shadow_width,bracket_length,bracket_shadow_thickness],center:[location.x-bracket_shadow_x_offset,location.y,stand_thickness+(bracket_shadow_thickness/2)]})
        let screw_hole = cylinder({radius:mounting_screw_radius,height:stand_width,center:[0,0,0]})
        screw_hole = rotate([0,degrees_90_to_radians,0],screw_hole)
        screw_hole = translate([location.x,location.y,stand_thickness+mounting_screw_edge_distance],screw_hole)
        let screw_head_hole = cylinder({radius:mounting_screw_head_radius,height:stand_width,center:[0,0,0]})
        screw_head_hole = rotate([0,degrees_90_to_radians,0],screw_head_hole)
        let screw_head_hole_x_offset = stand_width/2
        if(location.flipped){
            screw_head_hole_x_offset*=-1
        }
        screw_head_hole = translate([location.x-screw_head_hole_x_offset,location.y,stand_thickness+mounting_screw_edge_distance],screw_head_hole)
        let complete_bracket = hull(new_bracket,bracket_shadow)
        complete_bracket = subtract(complete_bracket,screw_head_hole,screw_hole)
        brackets.push(complete_bracket)
    }
    asssembly = stand
    return [asssembly,...brackets]
}

module.exports = { main, getParameterDefinitions }