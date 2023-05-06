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

const token = () => window.sessionStorage.getItem('token');
