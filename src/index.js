import './env'
import '@babel/polyfill'
import express from 'express'
import bodyParser from 'body-parser'

const app = express()

function checkEmptyPayload(req, res, next) {
  if (
    ['POST', 'PATCH', 'PUT'].includes(req.method) &&
    req.headers['content-length'] === '0'
  ) {
    res.status(400)
    res.set('Content-Type', 'application/json')
    res.json({
      message: 'Payload should not be empty',
    })
  }
  next()
}

function checkContentTypeIsSet(req, res, next) {
  if (
    ['POST', 'PATCH', 'PUT'].includes(req.method) &&
    req.headers['content-length'] &&
    req.headers['content-length'] !== '0' &&
    !req.headers['content-type']
  ) {
    res.status(400)
    res.set('Content-Type', 'application/json')
    res.json({
      message:
        'The "Content-Type" header must be set for requests with a non-empty payload',
    })
  }
  next()
}

function checkContentTypeIsJson(req, res, next) {
  if (
    ['POST', 'PATCH', 'PUT'].includes(req.method) &&
    !req.headers['content-type'].includes('application/json')
  ) {
    res.status(415)
    res.set('Content-Type', 'application/json')
    res.json({
      message: 'The "Content-Type" header must always be "application/json"',
    })
  }
  next()
}

function errorHandler(err, req, res, next) {
  if (
    err instanceof SyntaxError &&
    err.status === 400 &&
    'body' in err &&
    err.type === 'entity.parse.failed'
  ) {
    res.status(400)
    res.set('Content-Type', 'application/json')
    res.json({ message: 'Payload should be in JSON format' })
    return
  }
  next()
}

app.use(checkEmptyPayload)
app.use(checkContentTypeIsSet)
app.use(checkContentTypeIsJson)
app.use(bodyParser.json({ limit: 1e6 }))
app.use(errorHandler)

app.get('/', (req, res, next) => {
  res.send('<h1>Hello World!</h1>')
})
app.post('/users', (req, res, next) => {
  if (
    !Object.prototype.hasOwnProperty.call(req.body, 'email') ||
    !Object.prototype.hasOwnProperty.call(req.body, 'password')
  ) {
    res.status(400)
    res.set('Content-Type', 'application/json')
    res.json({
      message: 'Payload must contain at least the email and password fields',
    })
  }
  next()
})

app.listen(process.env.SERVER_PORT, () => {
  console.info(
    `Hobnob API server listening at ${process.env.SERVER_PROTOCOL}://${
      process.env.SERVER_HOSTNAME
    }:${process.env.SERVER_PORT}`
  )
})
