const Router = require('koa-router');
const parse = require('parseurl');
const qs = require('querystring');
const methods = require('methods');

class RouterAdapter {
  constructor(axiosInstance) {
    this.router = new Router();
    this.axiosInstance = axiosInstance;
    this.originalAdapter = axiosInstance.defaults.adapter;
    this.axiosInstance.defaults.adapter = this.adapter.bind(this);
  }

  adapter(config) {
    return this.handleRequest(config)
      .catch(() => this.originalAdapter(config));
  }

  handleRequest(config) {
    const { url, data: body, method } = config;
    this.routes = this.routes || this.router.routes();
    const {
      hostname, protocol, pathname, query,
    } = parse({
      url: this.axiosInstance.getUri(config)
    });
    const ctx = {
      path: hostname ? `${protocol}//${hostname}${pathname}` : pathname,
      request: { body },
      res: { },
      querystring: query,
      query: qs.parse(query),
      method: method.toUpperCase(),
    };
    return this.routes(ctx, () => Promise.reject(new Error('404')))
      .then(() => Promise.resolve({
        status: ctx.status || 200,
        data: ctx.body,
        headers: [],
        config,
      }));
  }
}

methods.forEach((method) => {
  RouterAdapter.prototype[method] = function (...args) {
    this.router[method](...args);
    this.routes = undefined;
    return this;
  };
});

RouterAdapter.prototype.del = RouterAdapter.prototype.delete;

module.exports = RouterAdapter;
