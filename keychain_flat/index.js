/**
 * Basic Text Creation
 * @category Creating Shapes
 * @skillLevel 10
 * @description Demonstrating methods of building 3D text
 * @tags text, font, characters
 * @authors Simon Clark
 * @licence MIT License
 */

const jscad = require('@jscad/modeling')
const { union,subtract} = jscad.booleans
const { extrudeLinear } = jscad.extrusions
const { hullChain,hull } = jscad.hulls
const { circle, sphere,cylinder } = jscad.primitives
const { vectorText } = jscad.text
const { translate,scale} = jscad.transforms
const { expand } = jscad.expansions
const { colorize } = jscad.colors

const getParameterDefinitions = () => {
    return [
        { name: 'flat_string', initial: 'Text', type: 'text', caption: 'Flat Text', size: 30 },
        { name: 'height', initial: 4, type: 'int', caption: 'Height' },
        { name: 'text_radius', initial: 2, type: 'int', caption: 'Text Radius' },
        { name: 'letter_spacing', initial: 0.85, type: 'float', caption: 'Letter Spacing' },
        { name: 'loop_center_x', initial: 6, type: 'float', caption: 'Loop Center X' },
        { name: 'loop_center_y', initial: -15, type: 'float', caption: 'Loop Center Y' }
    ]
}

const main = ({flat_string,height,text_radius,letter_spacing,loop_center_x,loop_center_y}) => {
    let flatText = translate([0,0,1],buildFlatText(flat_string, height-2, text_radius,letter_spacing))
    const keychain_body = hull(buildFlatText(flat_string, height, text_radius+10,letter_spacing))
    let full_height_base = scale([1,1,height],keychain_body)
    let base = translate([0,0,0],keychain_body)
    let keychain_loop = cylinder({center:[loop_center_x,loop_center_y,height/2],height: height, radius: 10,segments:32})
    let base_combined = hull(base,keychain_loop)
    let keychain_loop_negative = cylinder({center:[loop_center_x,loop_center_y,height/2],height: height, radius: 8})
    base_combined = subtract(base_combined,keychain_loop_negative)
    base_combined = subtract(base_combined,flatText)
    base_combined = colorize([0.2,0.2,0.1,0.5], base_combined)
    return [base_combined]
}

// Build text by creating the font strokes (2D), then extruding up (3D).
const buildFlatText = (message, extrusionHeight, characterLineWidth,letter_spacing) => {
    if (message === undefined || message.length === 0) return []

    const lineRadius = characterLineWidth / 2
    const lineCorner = circle({ radius: lineRadius})

    const lineSegmentPointArrays = vectorText({align:'center', x: 0, y: 0, letterSpacing:letter_spacing,lineSpacing:letter_spacing*2.1, input: message }) // line segments for each character
    const lineSegments = []
    lineSegmentPointArrays.forEach((segmentPoints) => { // process the line segment
        const corners = segmentPoints.map((point) => translate(point, lineCorner))
        lineSegments.push(hullChain(corners))
    })
    const message2D = lineSegments
    const message3D = extrudeLinear({ height: extrusionHeight }, message2D)
    return translate([0, 0, 0], message3D)
}

module.exports = { main, getParameterDefinitions }