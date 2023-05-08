import jwt from 'jsonwebtoken';
import {serverCfg, sysCfg} from '../../config';

// 生成token
const generateToken = payload => `Bearer ${
  jwt.sign(payload, sysCfg.secretKey, {
    expiresIn: 60 * 60,
  })}`;

// 验证token
const verifyToken = (token) => {
  token = token.split(' ')[1];
  let content;
  jwt.verify(token, sysCfg.secretKey, (err, decoded) => {
    if (err) {
      serverCfg.log.error('verify error', err);
      content = null;
    }
    content = decoded;
  });
  return content;
};

export {
  generateToken,
  verifyToken,
};
