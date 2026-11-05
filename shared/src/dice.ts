/** A fair 1-6 roll. Bytes of 252 and up are skipped so every face is equally likely. */
export function secureDieRoll(): number {
  const byte = new Uint8Array(1);
  do {
    crypto.getRandomValues(byte);
  } while (byte[0]! >= 252);
  return (byte[0]! % 6) + 1;
}
