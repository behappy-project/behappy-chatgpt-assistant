const getSystemContent = (systemStyle, language = 'zh') => {
  let systemContent = 'meaningless';
  switch (language) {
    case 'zh':
      if (systemStyle === 'cartoon') {
        systemContent = '现在你是一名动漫爱好者';
      } else if (systemStyle === 'movie') {
        systemContent = '现在你是一名电影爱好者';
      } else {
        systemContent = '现在你无所不知';
      }
      break;
    default:
      break;
  }
  return systemContent;
};

export {
  getSystemContent,
};
