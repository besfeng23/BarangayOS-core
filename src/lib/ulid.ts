
// ULID generation logic, credit to the ulid project
// https://github.com/ulid/javascript
// This is a minimal implementation to avoid a dependency.

const ENCODING = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
const ENCODING_LEN = ENCODING.length;
const TIME_MAX = Math.pow(2, 48) - 1;
const TIME_LEN = 10;
const RANDOM_LEN = 16;

function randomChar(): string {
  const rand = Math.floor(Math.random() * ENCODING_LEN);
  return ENCODING.charAt(rand);
}

function encodeTime(now: number, len: number): string {
  if (now > TIME_MAX) {
    throw new Error("Cannot encode time greater than " + TIME_MAX);
  }
  let mod: number;
  let str = "";
  for (; len > 0; len--) {
    mod = now % ENCODING_LEN;
    str = ENCODING.charAt(mod) + str;
    now = (now - mod) / ENCODING_LEN;
  }
  return str;
}

function encodeRandom(len: number): string {
  let str = "";
  for (; len > 0; len--) {
    str = randomChar() + str;
  }
  return str;
}

export function ulid(seedTime: number = Date.now()): string {
  return encodeTime(seedTime, TIME_LEN) + encodeRandom(RANDOM_LEN);
}
