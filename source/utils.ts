/**
 * Port of RS Hash from
 * https://gist.github.com/WebOptimusPrime/59893fe95716fdead48d196faeddb8ab
 */
export function hashRS(string: string) {
  const length = string.length;
  let h = 0, a = 63689, b = 378551;
  for (let i = 0; i < length; i++) {
    h = (Math.imul(h, a) + string.charCodeAt(i)) >>> 0;
    a = Math.imul(a, b) >>> 0;
  }
  return h;
}