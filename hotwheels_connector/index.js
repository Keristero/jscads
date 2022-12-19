const jscad = require('@jscad/modeling')
const { union,subtract,intersect} = jscad.booleans
const { extrudeLinear } = jscad.extrusions
const { hullChain,hull } = jscad.hulls
const { circle, sphere,cylinder,cuboid,roundedCuboid,roundedCylinder } = jscad.primitives
const { vectorText } = jscad.text
const { translate,scale,rotate,rotateY,rotateZ} = jscad.transforms
const { expand } = jscad.expansions

const getParameterDefinitions = () => {
}

const base_dimensions = {
    height:2.5,
    length:65,
    width:20.6
}

const bridge_dimensions = {
    height:base_dimensions.height,
    length:base_dimensions.length,
    width:base_dimensions.width
}

const slider_dimensions = {
    height:1.2,
    length:50,
    width:2.7
}

const button_dimensions = {
    diameter:13,
    height:1.8

}

const catch_dimensions = {
    diameter:4.5,
    height:1.6
}

const base_center = [0,0,(base_dimensions.height/2)]

const left_catch_center = [-15.8,0,base_dimensions.height+(catch_dimensions.height/2)]
const right_catch_center = [15.8,0,base_dimensions.height+(catch_dimensions.height/2)]

const top_slider_center = [0,-((base_dimensions.width/2)+(slider_dimensions.width/2)),(base_dimensions.height-slider_dimensions.height/2)]
const bottom_slider_center = [0,(base_dimensions.width/2)+(slider_dimensions.width/2),(base_dimensions.height-slider_dimensions.height/2)]

const left_hole_center = [-(base_dimensions.length/3.3),0,base_dimensions.height/2]
const right_hole_center = [(base_dimensions.length/3.3),0,base_dimensions.height/2]

const main = () => {
    const base = cuboid({size:[base_dimensions.length,base_dimensions.width,base_dimensions.height],center:base_center})
    const middle_bridge = cuboid({size:[bridge_dimensions.length,bridge_dimensions.width,bridge_dimensions.height],center:[0,0,(bridge_dimensions.height/2)]})
    const top_slider = cuboid({size:[base_dimensions.length,slider_dimensions.width,slider_dimensions.height],center:top_slider_center})
    const bottom_slider = cuboid({size:[base_dimensions.length,slider_dimensions.width,slider_dimensions.height],center:bottom_slider_center})

    const middle_button_top = roundedCylinder({center:[base_center[0],base_center[0],base_dimensions.height+(button_dimensions.height/2)],height: button_dimensions.height, radius: button_dimensions.diameter/2,segments:32,roundRadius:0.5})
    const left_catch_top = roundedCylinder({center:left_catch_center,height: catch_dimensions.height, radius: catch_dimensions.diameter/2,segments:32,roundRadius:0.3})
    const right_catch_top = roundedCylinder({center:right_catch_center,height: catch_dimensions.height, radius: catch_dimensions.diameter/2,segments:32,roundRadius:0.3})

    const middle_button_base = cylinder({center:[base_center[0],base_center[0],(base_dimensions.height+(button_dimensions.height/2))/2],height: base_dimensions.height+(button_dimensions.height/2), radius: button_dimensions.diameter/2,segments:32})
    const left_catch_base = cylinder({center:[-15.8,0,(base_dimensions.height/2)+(catch_dimensions.height/2)],height: (base_dimensions.height)+(catch_dimensions.height/2), radius: catch_dimensions.diameter/2,segments:32})
    const right_catch_base = cylinder({center:[15.8,0,(base_dimensions.height/2)+(catch_dimensions.height/2)],height: (base_dimensions.height)+(catch_dimensions.height/2), radius: catch_dimensions.diameter/2,segments:32})

    let middle_button = union(middle_button_base,middle_button_top)
    let radius = button_dimensions.diameter*2
    let middle_button_concave_cutter = sphere({center:[0,0,base_dimensions.height+radius+(button_dimensions.height/2)],radius:radius})
    middle_button = subtract(middle_button,middle_button_concave_cutter)

    let left_catch = union(left_catch_base,left_catch_top)

    let left_catch_cutter = cuboid({size:[5,5,5],center:[0,0,0],height: base_dimensions.height})
    left_catch_cutter = rotateY(1.2,left_catch_cutter)
    left_catch_cutter = translate([-16.8,0,3+(base_dimensions.height/2)+(catch_dimensions.height)],left_catch_cutter)
    left_catch = subtract(left_catch,left_catch_cutter)

    let right_catch = union(right_catch_base,right_catch_top)

    let right_catch_cutter = cuboid({size:[5,5,5],center:[0,0,0],height: base_dimensions.height})
    right_catch_cutter = rotateY(-1.2,right_catch_cutter)
    right_catch_cutter = translate([16.8,0,3+(base_dimensions.height/2)+(catch_dimensions.height)],right_catch_cutter)
    right_catch = subtract(right_catch,right_catch_cutter)

    const rounded_base = roundedCuboid({size:[base_dimensions.length,base_dimensions.width+(slider_dimensions.width*2),base_dimensions.height*20],center:base_center,roundRadius:12})

    let hole_left = cylinder({center:left_hole_center,height: base_dimensions.height, radius: 9,segments:32})
    let hole_right = cylinder({center:right_hole_center,height: base_dimensions.height, radius: 9,segments:32})
    let holes_combined = hull(hole_left,hole_right)
    let completed = subtract(base,holes_combined)
    completed = union(completed,top_slider,bottom_slider,middle_bridge)
    completed = intersect(completed,rounded_base)
    completed = union(completed,left_catch,right_catch,middle_button)
    return [completed]
}

module.exports = { main, getParameterDefinitions }