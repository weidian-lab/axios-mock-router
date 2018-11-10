"use strict";

var Router = require('koa-router');

var parse = require('parseurl');

var qs = require('querystring');

var methods = require('methods');

class RouterAdapter {
  constructor(axiosInstance) {
    this.router = new Router();
    this.axiosInstance = axiosInstance;
    this.originalAdapter = axiosInstance.defaults.adapter;
    this.axiosInstance.defaults.adapter = this.adapter.bind(this);
  }

  adapter(config) {
    return this.handleRequest(config).catch(() => this.originalAdapter(config));
  }

  handleRequest(config) {
    var body = config.data,
        method = config.method;
    this.routes = this.routes || this.router.routes();

    var _parse = parse({
      url: this.axiosInstance.getUri(config)
    }),
        hostname = _parse.hostname,
        protocol = _parse.protocol,
        pathname = _parse.pathname,
        query = _parse.query;

    var parsedBody;

    try {
      parsedBody = JSON.parse(body);
    } catch (e) {}

    var ctx = {
      path: hostname ? `${protocol}//${hostname}${pathname}` : pathname,
      request: {
        body: parsedBody || body
      },
      res: {},
      querystring: query,
      query: qs.parse(query),
      method: method.toUpperCase()
    };
    return this.routes(ctx, () => Promise.reject(new Error('404'))).then(() => Promise.resolve({
      status: ctx.status || 200,
      data: ctx.body,
      headers: [],
      config
    }));
  }

}

methods.forEach(method => {
  RouterAdapter.prototype[method] = function () {
    this.router[method](...arguments);
    this.routes = undefined;
    return this;
  };
});
RouterAdapter.prototype.del = RouterAdapter.prototype.delete;
module.exports = RouterAdapter;