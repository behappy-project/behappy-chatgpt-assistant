const path = require('path');
const mime = require('mime');
const fs = require('fs');


module.exports = (url, dir) => async (ctx, next) => {
  const rpath = ctx.request.path;
  if (rpath.startsWith(url)) {
    const fp = path.join(dir, rpath.substring(url.length));
    if (fs.existsSync(fp)) {
      ctx.response.type = mime.getType(rpath);
      ctx.response.body = await fs.readFileSync(fp);
    } else {
      ctx.response.status = 404;
    }
  } else {
    await next();
  }
};
