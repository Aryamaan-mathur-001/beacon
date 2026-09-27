const { customAlphabet } = require("nanoid");

// Unambiguous alphabet — no 0/O or 1/l/I mix-ups when read aloud or typed.
const ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

const generate = customAlphabet(ALPHABET, 7);

function generateShortCode() {
  return generate();
}

module.exports = { generateShortCode };
