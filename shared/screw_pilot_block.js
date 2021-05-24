const { cylinder, sphere, line, cylinderElliptic, cuboid, square,roundedRectangle} = require('@jscad/modeling').primitives
const { path2, geom2 } = require('@jscad/modeling').geometries
const { expand, offset } = require('@jscad/modeling').expansions
const { degToRad } = require('@jscad/modeling').utils
const { rotate, translate, rotateZ } = require('@jscad/modeling').transforms
const { extrudeLinear, extrudeRectangular, extrudeRotate } = require('@jscad/modeling').extrusions
const { subtract, intersect, union } = require('@jscad/modeling').booleans
const { colorize } = require('@jscad/modeling').colors
const { hullChain } = require('@jscad/modeling').hulls

const screw_pilot_hole = function(parameters){
    let defaults = {
        segments: 32,
        screw_thread_height: 16,
        screw_thread_radius: 2,
        screw_head_height: 2,
        screw_thread_radius_base: 3.5,
        screw_thread_radius_top: 5
    }
    let s = Object.assign(parameters, defaults)

    let screw_height = s.screw_head_height + s.screw_thread_height
    let r1 = s.screw_thread_radius_base
    let r2 = s.screw_thread_radius_top

    let screw_thread = cylinder({
        height: s.screw_thread_height,
        radius: s.screw_thread_radius,
        center: [0, 0, s.screw_thread_height / 2]
    })
    let screw_head = cylinderElliptic({
        height: s.screw_head_height,
        startRadius: [r1, r1],
        endRadius: [r2, r2],
        center: [0, 0, s.screw_thread_height+(s.screw_head_height/2)]
    })
    let screw_assembled = union(screw_thread, screw_head)
    return {screw_assembled,screw_height}
}

// Used during design and testing
const main = (parameters) => {
    let defaults = {
        spacing:20,//Space between screws
        screwsX:1,//Columns
        screwsY:2,//Rows
        padding:2,//Extra matarial around the rows and columns of screw
        offsetX:-3,//Offset screws in the block to a side of it
        offsetY:0,
        depth:5,
    }
    let s = Object.assign(parameters, defaults)

    let screw_space_x = s.screwsX*s.spacing
    let screw_space_y = s.screwsY*s.spacing
    let total_width = screw_space_x+(s.padding*2)
    let total_height = screw_space_y+(s.padding*2)
    console.log(total_width,total_height)
    let base_rectangle = roundedRectangle({size: [total_width, total_height],center:[total_width/2,total_height/2], roundRadius: 2})
    let extruded_rectangle = extrudeLinear({height:s.depth},base_rectangle)
    let screw_pilot_holes = []
    for(let x = 0; x < s.screwsX;x++){
        for(let y = 0; y < s.screwsY;y++){
            let xOffset = (x*s.spacing)+(s.spacing/2)+s.padding+s.offsetX
            let yOffset = (y*s.spacing)+(s.spacing/2)+s.padding+s.offsetY
            let {screw_assembled,screw_height} = screw_pilot_hole({})
            screw_assembled = translate([xOffset,yOffset,s.depth-screw_height],screw_assembled)
            screw_pilot_holes.push(screw_assembled)
        }
    }
    let rectangle_with_holes = subtract(extruded_rectangle,screw_pilot_holes)
    return [rectangle_with_holes]
}

module.exports = { main }

main({})