const clc = require('cli-color')
const ascii = require('../ascii.json')
const packageJson = require('../../package.json')
const http = require('http')
const safeStringify = require('fast-safe-stringify')
const url = require('url')
const cookie = require('cookie')
const executeMiddlewareHandler = require('./middleware_handler')
const bodyParser = require('./body_parser')
const executeRouteHandlers = require('./route_handler')
const trieRouter = require('./trie')

function use(...args) {
    if (args.length === 1) {
        this.middlewares.push({
            url: null,
            handler: args[0],
        })
    } else if (typeof args[args.length - 1] === 'object') {
        for (let mid of args) {
            if (typeof mid === 'function') {
                this.middlewares.push({
                    url: null,
                    handler: mid,
                })
            }
        }
        for (let obj of args[args.length - 1].routes) {
            this.routes.push({
                url: `${args[0]}${obj.url}`,
                method: obj.method,
                handler: obj.handler,
                middlewares: obj.middlewares,
            })
        }
    } else
        this.middlewares.push({
            url: args[0] === '/' ? '' : args[0],
            handler: args[1],
        })
}

function initialLog() {
    console.log(clc.green(ascii.art[3]))
    console.log(clc.green(`Version: `), clc.yellow(packageJson.version))
    console.log(
        clc.green(`Please consider leaving a ⭐ at `),
        clc.yellow.underline(`https://github.com/Zulfiqar-Qureshi/routine-js`)
    )
    console.log(
        clc.green(`documentation can be found at `),
        clc.yellow.underline(`https://routinejs.juniordev.net\n`)
    )
}

function Router() {
    /**
     * @param {Array<Route>} routes - routes array where individual route objects are pushed upon code traversal
     * */
    let routes = []

    let middlewares = []
    //Method to push route data into the routes array,
    //since the behaviour is only different in case of methodString
    //i.e. GET, POST etc. we abstracted this push behaviour into a
    //separate method, hence called routePush
    /**
     * Method to push route data into the routes array
     * @param {'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS'} methodString - http method for the route
     * @param {string} url - Path of the route
     * @param {Array<Function>} handlers - Array of handler functions, from which the last one is
     * main route handler while other functions before it are treated as middleware functions
     * @returns {void}
     * */
    function routePush(methodString, url, ...handlers) {
        routes.push({
            url,
            method: methodString,
            handler: handlers.pop(),
            middlewares: [
                ...middlewares.map((obj) => obj.handler),
                ...handlers,
            ],
        })
    }

    return {
        get: (url, ...handlers) => {
            routePush('GET', url, ...handlers)
        },

        post: (url, ...handlers) => {
            routePush('POST', url, ...handlers)
        },

        put: (url, ...handlers) => {
            routePush('PUT', url, ...handlers)
        },

        patch: (url, ...handlers) => {
            routePush('PATCH', url, ...handlers)
        },

        delete: (url, ...handlers) => {
            routePush('DELETE', url, ...handlers)
        },

        options: (url, ...handlers) => {
            routePush('OPTIONS', url, ...handlers)
        },
        use,
        middlewares,
        routes,
    }
}

function listen(
    PORT = 8080,
    handler = (port) => console.log(`ROUTINE SERVER STARTED ON PORT: ${port}`)
) {
    let requestRef, responseRef
    let conf = this.conf
    let server = http.createServer(async (req, res) => {
        res.setHeader('X-Powered-By', 'routinejs')
        requestRef = req
        responseRef = res
        //Custom method allowing easy json transmission as ExpressJS does
        res.json = (json) => {
            res.setHeader('Content-Type', 'application/json')
            res.end(safeStringify(json))
        }
        res.status = (statusCode = 200) => {
            res.statusCode = statusCode
            return res
        }
        res.sendStatus = (statusCode = 200) => {
            res.statusCode = statusCode
            res.end()
        }
        res.setCookie = (name, value, options) => {
            setCookie(name, value, options, res)
        }

        res.send = (data) => {
            if (typeof data === 'object') {
                res.json(data)
            } else if (typeof data === 'string') {
                if (/<[a-z][\s\S]*>/i.test(data)) {
                    res.setHeader('Content-Type', 'text/html')
                } else {
                    res.setHeader('Content-Type', 'text/plain')
                }
                res.end(data)
            } else if (Buffer.isBuffer(data)) {
                res.setHeader('Content-Type', 'application/octet-stream')
                res.end(data)
            } else {
                res.status(500).end('Internal Server Error')
            }
        }

        if (conf?.enableCookieParsing) {
            req.cookies = cookie.parse(req.headers.cookie || '')
        }
        //Parsing request url and the 'true' is for allowing the parser to also parse
        // any query strings if present
        let parsedUrl = url.parse(req.url, true)

        await executeMiddlewareHandler(req, res, this.middlewares, parsedUrl)
        //attaching incoming query strings to request.query object
        req.query = parsedUrl.query

        //If pathname is just "/" then we do not want to remove that slash, because that
        //means that the request is coming from the main domain
        //but if the pathname is something like '/xyz/' then we would remove that trailing
        //slash, and that would give us '/xyz'
        req.path =
            parsedUrl.pathname === '/'
                ? parsedUrl.pathname
                : parsedUrl.pathname.replace(/\/[%]?$/g, '')

        //Finding a match within radix trie
        let route = trieRouter.find(req.method, req.path)

        //If match is found (means the above route let is not undefined),
        //then we proceed with the request, otherwise we sent a 404 Not found
        //message in the else block
        if (!!route) {
            if (conf.enableBodyParsing) {
                req.body = await bodyParser(req)
            }

            await executeRouteHandlers(route, req, res)
            //This else block means if request is of type GET where body
            //should not be present or should not be parsed
        } else {
            res.json(404, {
                message: 'Route not found',
            })
        }
    })
    server.listen(typeof PORT === 'number' ? PORT : parseInt(PORT))

    //running route registration code after listen method is called,
    //such that we don't register same route twice
    this.registerRoutes()

    if (!this.conf.suppressInitialLog) {
        initialLog()
    }

    //Callback handler for our custom listen function so that user could log
    //something or run something once this router server is started on provided
    //port
    handler(PORT)

    return server
}

function setCookie(name, value, options = null, res) {
    let cookies
    if (typeof options === 'object') {
        cookies = cookie.serialize(name, String(value), options)
    } else {
        cookies = cookie.serialize(name, String(value))
    }
    res.setHeader('Set-Cookie', cookies)
}

exports.use = use
exports.initialLog = initialLog
exports.Router = Router
exports.listen = listen
