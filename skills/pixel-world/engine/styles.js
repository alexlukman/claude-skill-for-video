// ------------------------------------------------------------------------------------------------
// STYLES: the registry that lets one spec pick an art style with  "style": "alex"  (default) or  "growtopia".
// A style is { id, label, resolveCharacter, drawCharacter, drawSky, drawGround, drawProps, sprite, headY, outline }.
//   sprite: size of the scratch canvas one character is drawn on, and where the feet-middle sits in it { w, h, ox, oy }
//   headY : how many pixels above the feet the speech bubble tail points to
// "alex" is the original look ("Alex's Claude Pixel World"). It only wraps the functions in characters.js and world.js,
// so nothing about it changed. Add a new style by registering one more object here (see style-growtopia.js).
// ------------------------------------------------------------------------------------------------
const STYLES = {};
STYLES.alex = {
  id: 'alex', label: "Alex's Claude Pixel World",
  resolveCharacter, drawCharacter, drawSky, drawGround, drawProps,
  sprite: { w: 48, h: 48, ox: 24, oy: 40 }, headY: 31, outline: '#1c1830', defaultGround: .68,
};
