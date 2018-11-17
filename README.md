# axios-mock-router

mock axios like koa-router

[![Build Status](https://travis-ci.org/sqlwwx/axios-mock-router.svg?branch=master)](https://travis-ci.org/sqlwwx/axios-mock-router)
[![Coverage Status](https://coveralls.io/repos/github/sqlwwx/axios-mock-router/badge.svg?branch=master)](https://coveralls.io/github/sqlwwx/axios-mock-router?branch=master)
[![Greenkeeper badge](https://badges.greenkeeper.io/sqlwwx/axios-mock-router.svg)](https://greenkeeper.io/)
![npm](https://img.shields.io/npm/dt/axios-mock-router.svg)
[![codebeat badge](https://codebeat.co/badges/8cecad6a-6ff0-412e-8397-ee6227784697)](https://codebeat.co/projects/github-com-sqlwwx-axios-mock-router-master)


## example

```
import AxiosMockRouter from 'axios-mock-router'
import axios from 'axios'

const router = new AxiosMockRouter(axios);

router
  .get('https://github.com/', (ctx, next) => {
    ctx.body = 'github';
  })
  .get('/', (ctx, next) => {
    ctx.body = 'home';
  })
  .get('/users', (ctx, next) => {
    ctx.body = `get users ${JSON.stringify(ctx.query)}`;
  })
  .post('/users', (ctx, next) => {
    ctx.body = `post users ${ctx.request.body}`;
  })
  .get('/users/:id', (ctx, next) => {
    ctx.body = `get user [${ctx.params.id}] ${JSON.stringify(ctx.query)}`;
  })
  .put('/users/:id', (ctx, next) => {
    ctx.body = `put user [${ctx.params.id}] ${ctx.request.body}`;
  })
  .del('/users', (ctx, next) => {
    ctx.body = `del users ${JSON.stringify(ctx.query)}`;
  })
  .del('/users/:id', (ctx, next) => {
    ctx.body = `del user [${ctx.params.id}] ${JSON.stringify(ctx.query)}`;
  });

axios.get('https://github.com/')
  .then(res => console.log(res.data === 'github'))
axios.get('https://github.com/sqlwwx')
  .then(res => console.log(res.data !== 'github'))
axios.get('/')
  .then(res => console.log(res.data === 'home'))
axios.get('/users')
  .then(res => console.log(res.data === 'get users {}'))
axios.get('/users?limit=1')
  .then(res => console.log(res.data === 'get users {"limit":"1"}'))
axios.post('/users', { name: 'wwx' })
  .then(res => console.log(res.data === `post users {"name":"wwx"}`))
axios.put('/users/1', { name: 'wwx' })
  .then(res => console.log(res.data === 'put user [1] {"name":"wwx"}'))
axios.get('/users/1?includeStart=true')
  .then(res => console.log(res.data === 'get user [1] {"includeStart":"true"}'))
axios.delete('/users?idList=[1,2]')
  .then(res => console.log(res.data === 'del users {"idList":"[1,2]"}'))
axios.delete('/users/1')
  .then(res => console.log(res.data === 'del user [1] {}'))

```
