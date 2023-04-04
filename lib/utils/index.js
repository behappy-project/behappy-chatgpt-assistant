/**
 * 延时
 * @param delay
 */
Date.sleep = async delay => new Promise(resolve => setTimeout(resolve, delay));

/**
 * 判断是否为自然数
 * @param num
 * @returns {Boolean}
 */
Number.isNatural = num => !Number.isNaN(num) && num >= 0;

/**
 * 判断是否为正整数
 * @param num
 * @returns {Boolean}
 */
Number.isNplus = num => !Number.isNaN(num) && num > 0 && num % 1 === 0;

/**
 * ASCII码转字符
 * @returns {string}
 */
Number.prototype.itoa = function () {
  return String.fromCharCode(this)
};

/**
 * 字符转ASCII码
 * @returns {number}
 */
String.prototype.atoi = function () {
  return this.charCodeAt() || 0;
}

/**
 * 判断对象中对应Key的Value是否为空
 * @param obj
 * @param key
 * @returns {Boolean}
 */
Object.hasValue = (obj, key) => key in obj && !!obj[key];

/**
 * 判断对象是否为空
 * @param obj
 * @returns {Boolean}
 */
Object.isNonempty = obj => !!obj && Object.keys(obj).some(k => !!obj[k]);

/**
 * 判断数组是否为空
 * @param arr
 * @returns {Boolean}
 */
Array.isNonempty = arr => (arr instanceof Array) && arr.length > 0;

/**
 * 根据给定Key值将数组转为对象
 * @param key1 转换为对象后的Key
 * @param [key2] 提取对象数组中的字段Key
 * @returns {Object}
 */
Array.prototype.toObject = function (key1, key2) {
  const result = {};
  for (const v of this) {
    result[v[key1]] = key2 ? typeof key2 !== 'string' ? key2 : v[key2] : v;
  }
  return result;
};

/**
 * 根据给定Key值将数组转为对象(Key对应的Value为数组)
 * @param key1 转换为对象后的Key
 * @param [key2] 提取对象数组中的字段Key
 * @returns {Object}
 */
Array.prototype.toObjectArray = function (key1, key2) {
  const result = {};
  for (const v of this) {
    if (v[key1]) {
      if (!result[v[key1]]) result[v[key1]] = [];
      if (key2) {
        if (v[key2]) {
          result[v[key1]].push(...[v[key2]].flat());
        }
      } else {
        result[v[key1]].push(v);
      }
    }
  }
  return result;
};

/**
 * 唯一数组中的某个字段并转为以此字段的值为元素的数组
 * @param key 提取对象数组中的字段Key
 * @returns {string[]}
 */
Array.prototype.uniqTo = function (key) {
  const uniqObj = {};
  for (const v of this) {
    const val = v[key];
    if (typeof val === 'string') {
      uniqObj[val] = 1;
    } else if (Array.isArray(val)) {
      val.forEach(k => uniqObj[k] = 1);
    }
  }
  return Object.keys(uniqObj);
};

/**
 * 向数组添加元素时保证唯一性
 * @returns {Array}
 */
Array.prototype.uniqPush = function (...args) {
  for (const arg of args) {
    !this.includes(arg) && this.push(arg);
  }
  return this;
};

/**
 * 判断一个数在另外两个数之间
 * @param n 要判断的数
 * @param x 较小的数
 * @param y 较大的数
 * @returns {boolean}
 */
Math.between = function (n, x, y) {
  return Number(n) >= x && Number(n) <= y;
}

export function isEmptyObject(obj) {
  return Object.keys(obj).length === 0;
}
