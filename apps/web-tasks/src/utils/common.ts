/**
 * 检查给定的字符串是否为有效的Base58编码字符串。
 * Base58是一种常用于比特币地址和其他加密货币地址的编码方式，它不包含容易混淆的字符（如0、O、I、l）。
 *
 * @param {string} str - 需要检查的字符串。
 * @returns {boolean} 如果字符串是有效的Base58编码，则返回true，否则返回false。
 */
export function isValidBase58(str: string): boolean {
  const base58Regex = /^[1-9A-HJ-NP-Za-km-z]+$/;
  return base58Regex.test(str);
}
