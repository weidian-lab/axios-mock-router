const Router = require('koa-router')
const parse = require('parseurl')
const qs = require('querystring')
const methods = require('methods')
const settle = require('axios/lib/core/settle')

class RouterAdapter {
  constructor (axiosInstance) {
    this.router = new Router()
    this.axiosInstance = axiosInstance
    this.originalAdapter = axiosInstance.defaults.adapter
    this.axiosInstance.defaults.adapter = this.adapter.bind(this)
  }

  get routes () {
    if (!this._routes) {
      this._routes = this.router.routes()
    }
    return this._routes
  }

  adapter (config) {
    return this.handleRequest(config)
      .catch((error) => {
        if (!error.response) {
          return this.originalAdapter(config)
        }
        return Promise.reject(error)
      })
  }

  createContext (config) {
    const { data: body, method } = config
    const {
      hostname, protocol, pathname, query
    } = parse({
      url: this.axiosInstance.getUri(config)
    })
    let parsedBody
    try {
      parsedBody = JSON.parse(body)
    } catch (e) {
    }
    return {
      path: hostname ? `${protocol}//${hostname}${pathname}` : pathname,
      request: { body: parsedBody || body },
      res: { },
      querystring: query,
      query: qs.parse(query),
      method: method.toUpperCase()
    }
  }

  handleRequest (config) {
    let ctx = this.createContext(config)
    return this.routes(
      ctx, (err) => {
        return Promise.reject(err || new Error('404'))
      })
      .then(() => {
        return new Promise((resolve, reject) => {
          settle(resolve, reject, {
            data: ctx.body,
            status: ctx.status || 200,
            statusText: '',
            headers: [],
            config,
            request: ctx.request
          })
        })
      })
  }
}

methods.forEach((method) => {
  RouterAdapter.prototype[method] = function (...args) {
    this.router[method](...args)
    this._routes = undefined
    return this
  }
})

RouterAdapter.prototype.del = RouterAdapter.prototype.delete

module.exports = RouterAdapter
