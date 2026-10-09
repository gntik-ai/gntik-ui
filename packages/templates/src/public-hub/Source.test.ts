import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';

// Source is a public contract here: consumers must be able to re-theme every style.
const namedColours =
  'aliceblue antiquewhite aqua aquamarine azure beige bisque black blanchedalmond blue blueviolet brown burlywood cadetblue chartreuse chocolate coral cornflowerblue cornsilk crimson cyan darkblue darkcyan darkgoldenrod darkgray darkgreen darkgrey darkkhaki darkmagenta darkolivegreen darkorange darkorchid darkred darksalmon darkseagreen darkslateblue darkslategray darkslategrey darkturquoise darkviolet deeppink deepskyblue dimgray dimgrey dodgerblue firebrick floralwhite forestgreen fuchsia gainsboro ghostwhite gold goldenrod gray green greenyellow grey honeydew hotpink indianred indigo ivory khaki lavender lavenderblush lawngreen lemonchiffon lightblue lightcoral lightcyan lightgoldenrodyellow lightgray lightgreen lightgrey lightpink lightsalmon lightseagreen lightskyblue lightslategray lightslategrey lightsteelblue lightyellow lime limegreen linen magenta maroon mediumaquamarine mediumblue mediumorchid mediumpurple mediumseagreen mediumslateblue mediumspringgreen mediumturquoise mediumvioletred midnightblue mintcream mistyrose moccasin navajowhite navy oldlace olive olivedrab orange orangered orchid palegoldenrod palegreen paleturquoise palevioletred papayawhip peachpuff peru pink plum powderblue purple rebeccapurple red rosybrown royalblue saddlebrown salmon sandybrown seagreen seashell sienna silver skyblue slateblue slategray slategrey snow springgreen steelblue tan teal thistle tomato turquoise violet wheat white whitesmoke yellow yellowgreen'
    .split(' ')
    .join('|');
const forbidden = [
  /[\w:-]+-\[[^\]]+\]/, // Tailwind arbitrary values and variants
  /\bstyle\s*(?:=|:)/,
  /#[\da-f]{3,8}\b/i,
  /\b(?:rgba?|hsla?|hwb|oklch|oklab|lab|lch|color)\s*\(/i,
  /\b\d*\.?\d+(?:px|rem|em)\b/i,
  new RegExp(`(?:['"\x60]|:\\s*)(?:${namedColours})(?:['"\x60]|\\s*[;}])`, 'i'),
  new RegExp(`\\b(?:bg|text|border|ring|outline|fill|stroke|shadow|divide|decoration)-(?:${namedColours})(?:-\\d+)?\\b`, 'i'),
  /\bdark:|\bbg-(?:gradient|linear|radial|conic)-|\bglow\b/,
];

const violations = (source: string) => forbidden.filter((rule) => rule.test(source)).map(String);
const sources = (directory: string): string[] =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? sources(path) : /\.(?:tsx?|css)$/.test(path) && !/\.test\./.test(path) ? [path] : [];
  });

describe('public-hub token-only source contract', () => {
  it.each([
    'className="w-[42px]"',
    'style={{ color: "red" }}',
    // eslint-disable-next-line no-restricted-syntax -- Negative fixture verifies rejection of literal colours.
    'color: #abc;',
    'color: rgb(1 2 3);',
    'color: hsl(1 2% 3%);',
    'color: rebeccapurple;',
    // eslint-disable-next-line no-restricted-syntax -- Negative fixture verifies rejection of palette classes.
    'className="text-white"',
    'width: 2px;',
    'padding: 1rem;',
    'border-radius: .5em;',
  ])('rejects prohibited styling: %s', (source) => {
    expect(violations(source).length).toBeGreaterThan(0);
  });

  it('uses only kit classes and spacing scales across every template source and example', () => {
    const files = sources(join(process.cwd(), 'src/public-hub'));
    expect(files.length).toBeGreaterThan(3);
    for (const file of files) expect(violations(readFileSync(file, 'utf8')), file).toEqual([]);
  });
});
