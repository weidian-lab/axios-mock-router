import AxiosMockRouter from './index'
import axios from 'axios'

jest.setTimeout(1000 * 60)
/* eslint-env jest */
describe('axios-mock-router', () => {
  let instance
  let router
  beforeEach(() => {
    instance = axios.create()
    router = new AxiosMockRouter(instance)
  })
  describe('basics', () => {
    it('correctly sets the adapter on the axios instance', () => {
      expect(instance.defaults).toHaveProperty('adapter')
    })
    it('supports all verbs', () => {
      ['get', 'put', 'head', 'delete', 'del', 'patch', 'options']
        .forEach(method => {
          expect(typeof router[method]).toBe('function')
        })
    })
    it('mocks requests', async () => {
      router
        .get('/foo', async (ctx) => {
          ctx.body = 'bar'
        })
        .get('https://www.baidu.com/foo', async (ctx) => {
          ctx.body = 'baidu'
        })
      let res = await instance.get('/foo')
      expect(res).toHaveProperty('data', 'bar')
      expect(res).toHaveProperty('status', 200)
      expect(
        instance.get('/bar')
      ).rejects.toHaveProperty('message', 'connect ECONNREFUSED 127.0.0.1:80')
      res = await instance.get('https://www.baidu.com/foo')
      expect(res).toHaveProperty('data', 'baidu')
      expect(res).toHaveProperty('status', 200)
      res = await instance.get('https://www.baidu.com')
      expect(res.data.includes('<html>')).toBe(true)
      expect(res).toHaveProperty('status', 200)
    })
  })
  describe('get', () => {
    beforeEach(() => {
      router
        .get('/get', async (ctx) => {
          ctx.body = { route: 'get', query: ctx.query }
        }).get('/get/:id', async (ctx) => {
          ctx.body = { route: 'get', query: ctx.query, params: ctx.params }
        })
    })
    it('no query', async () => {
      expect(await instance.get('/get')).toHaveProperty('data', {
        query: {}, route: 'get'
      })
    })
    it('query', async () => {
      expect(await instance.get('/get?limit=1')).toHaveProperty('data', {
        query: { limit: '1' }, route: 'get'
      })
      expect(await instance.get('/get', { params: { limit: 1 } })).toHaveProperty('data', {
        query: { limit: '1' }, route: 'get'
      })
    })
    it('with params', async () => {
      expect(await instance.get('/get/1?limit=1')).toHaveProperty('data', {
        params: { id: '1' }, query: { limit: '1' }, route: 'get'
      })
      expect(await instance.get('/get/1/?limit=1')).toHaveProperty('data', {
        params: { id: '1' }, query: { limit: '1' }, route: 'get'
      })
    })
  })
  describe('post', () => {
    beforeEach(() => {
      router.post('/post', async (ctx) => {
        ctx.body = { route: 'post', query: ctx.query, body: ctx.request.body }
      })
    })
    it('post empty', async () => {
      expect(await instance.post('/post')).toHaveProperty('data', {
        query: { }, route: 'post', body: undefined
      })
      expect(await instance.post('/post', { name: 'x' })).toHaveProperty('data', {
        query: { }, route: 'post', body: { name: 'x' }
      })
      expect(await instance.post('/post', { parent: { id: 1, name: 'p' } })).toHaveProperty('data', {
        query: { }, route: 'post', body: { parent: { id: 1, name: 'p' } }
      })
    })
  })
  describe('put', () => {
    beforeEach(() => {
      router
        .put('/put/:id', async (ctx) => {
          ctx.body = { route: 'put', query: ctx.query, params: ctx.params, body: ctx.request.body }
        })
    })
    it('errorPath', async () => {
      expect(instance.post('/put', { name: 'x' }))
        .rejects.toHaveProperty('message', 'connect ECONNREFUSED 127.0.0.1:80')
    })
    it('put empty data', async () => {
      expect(await instance.put('/put/1')).toHaveProperty('data', {
        params: { id: '1' }, query: {}, route: 'put', body: undefined
      })
    })
    it('put with body', async () => {
      expect(await instance.put('/put/1', { name: 'x' })).toHaveProperty('data', {
        params: { id: '1' }, query: {}, route: 'put', body: { name: 'x' }
      })
    })
  })
  describe('del', () => {
    beforeEach(() => {
      router
        .del('/del', async (ctx) => {
          ctx.body = { route: 'del', query: ctx.query }
        })
        .del('/del/:id', async (ctx) => {
          ctx.body = { route: 'del', query: ctx.query, params: ctx.params }
        })
    })
    it('del with query', async () => {
      expect(await instance.delete('/del', { params: { name: 'wwx' } })).toHaveProperty('data', {
        query: { name: 'wwx' }, route: 'del'
      })
      expect(await instance.delete('/del', { params: { names: ['wwx', 'lj'] } })).toHaveProperty('data', {
        query: { 'names[]': ['wwx', 'lj'] }, route: 'del'
      })
    })
    it('del by id', async () => {
      expect(await instance.delete('/del/1')).toHaveProperty('data', {
        params: { id: '1' }, query: {}, route: 'del'
      })
    })
  })
  it('error status', async () => {
    router.get('/500', (ctx) => {
      ctx.status = 500
    }).get('/403', (ctx) => {
      ctx.status = 403
    })
    expect(instance.get('/500')).rejects.toHaveProperty('response.status', 500)
    expect(instance.get('/404')).rejects.toHaveProperty('response.status', 403)
  })
  it('mock with port', async () => {
    router.get('http://test.com', (ctx) => {
      ctx.body = 'test'
    })
    let res = await instance.get('http://test.com')
    expect(res).toHaveProperty('data', 'test')
    expect(res).toHaveProperty('status', 200)
  })
})
