/* eslint-disable */
const baseLocation = `${window.location.origin}/chat-gpt`;
const baseUrl = `${baseLocation}/api`;
// 定义 markdown-it 的语法高亮函数 highlight
const md = window.markdownit({
  html: true,
  linkify: true,
  typographer: true,
  highlight: function (str, lang) {
    // 此处判断是否有添加代码语言
    if (lang && hljs.getLanguage(lang)) {
      try {
        // 得到经过highlight.js之后的html代码
        const preCode = hljs.highlight(lang, str, true).value
        // 以换行进行分割
        const lines = preCode.split(/\n/)
          .slice(0, -1)
        // 添加自定义行号
        let html = lines.map((item, index) => {
          return '<li><span class="line-num" data-line="' + (index + 1) + '"></span>' + item + '</li>'
        })
          .join('')
        html = '<ol>' + html + '</ol>'
        // 添加代码语言
        if (lines.length) {
          html += '<b class="name">' + lang + '</b>'
        }
        return '<pre class="hljs"><code>' +
          html +
          '</code></pre>'
      } catch (__) {
      }
    }
    // 未添加代码语言，此处与上面同理
    const preCode = md.utils.escapeHtml(str)
    const lines = preCode.split(/\n/)
      .slice(0, -1)
    let html = lines.map((item, index) => {
      return '<li><span class="line-num" data-line="' + (index + 1) + '"></span>' + item + '</li>'
    })
      .join('')
    html = '<ol>' + html + '</ol>'
    return '<pre class="hljs"><code>' +
      html +
      '</code></pre>';
  }
});

function isMobile() {
  const {userAgent} = navigator;
  const mobileKeywords = ['Android', 'iPhone', 'iPad', 'iPod', 'Windows Phone', 'Mobile'];

  for (let i = 0; i < mobileKeywords.length; i++) {
    if (userAgent.indexOf(mobileKeywords[i]) > -1) {
      return true;
    }
  }

  return false;
}

// 获取当前时间戳
function nanoid() {
  return new Date().getTime()
    .toString();
}

function getByClass(oParent, sClass) {
  if (document.getElementsByClassName) {
    return oParent.getElementsByClassName(sClass);
  } else {
    var aEle = oParent.getElementsByTagName('*');
    var arr = [];
    for (var i = 0; i < aEle.length; i++) {
      var tmp = aEle[i].className.split(' ');
      if (findInArr(tmp, sClass)) {
        arr.push(aEle[i]);
      }
    }
    return arr;
  }
}
function findInArr(arr, n) {
  for (var i = 0; i < arr.length; i++) {
    if (arr[i] === n) return true;
  }
  return false;
}

const token = () => window.sessionStorage.getItem('token');
