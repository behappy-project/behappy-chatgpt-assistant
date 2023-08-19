/* eslint-disable */
const baseLocation = `${window.location.origin}/chat-gpt`;
const baseUrl = `${baseLocation}/api`;

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

function setCookie(cname, cvalue, exdays = 1) {
  const d = new Date();
  d.setTime(d.getTime()+(exdays*24*60*60*1000));
  const expires = "expires="+d.toGMTString();
  document.cookie = cname + "=" + cvalue + "; " + expires + "; path=/";
}

const token = () => window.sessionStorage.getItem('token');
