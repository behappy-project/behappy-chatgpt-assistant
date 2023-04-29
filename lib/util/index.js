const getSystemContent = (systemStyle, language = 'zh') => {
  let systemContent = 'meaningless';
  switch (language) {
    case 'zh':
      if (systemStyle === 'cartoon') {
        systemContent = '现在你是一名动漫爱好者';
      } else if (systemStyle === 'movie') {
        systemContent = '现在你是一名电影爱好者';
      } else if (systemStyle === 'computer') {
        systemContent = '现在你是一名计算机专家';
      } else {
        systemContent = '现在你无所不知';
      }
      break;
    default:
      break;
  }
  return systemContent;
};

const validatePattern = (filename, pattern) => {
  const regExp = new RegExp(pattern, 'i');
  return regExp.test(filename);
};

export {
  getSystemContent,
  validatePattern,
};
