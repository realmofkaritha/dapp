export default function padHex(str) {
  return str.length % 2 === 0 ? str : "0" + str;
}
