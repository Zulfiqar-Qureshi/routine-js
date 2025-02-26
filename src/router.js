//ts-check
/**
 * @file router.js is the root file for this framework
 * @author Zulfiqar Ali Qureshi
 * @see <a href="https://author.juniordev.net">My Resume</a>
 */
const { use, Router, listen } = require('./helper/utils')
const trieRouter = require('./helper/trie')
const clc = require('cli-color')

/**
 * A main route object
 * @typedef {Object} Route
 * @property {string} url - path of the route, such as '/xyz' or '/xyz/abc'
 * @property {'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'} method - Http method of the route
 * @property {Function} handler - main handler function for the route
 * @property {Function | Undefined} middlewares - any possible middleware functions given prior to handler func
 * */

/**
 * Entry point to our framework, everything starts by creating an object of this class
 * */
class Routine {
    /**
     * @private array
     * */
    routes = []

    /**
     * @private array
     * */
    middlewares = []

    /**
     * @private object
     * */
    conf = {
        enableBodyParsing: true,
        suppressInitialLog: false,
        enableCookieParsing: true,
        suppressRouteLog: false,
    }

    /**
     * @constructor
     * @param conf
     * */
    constructor(conf) {
        if (
            conf?.suppressInitialLog != undefined &&
            typeof conf.suppressInitialLog === 'boolean'
        ) {
            this.conf.suppressInitialLog = conf?.suppressInitialLog
        }
        if (
            conf?.enableBodyParsing != undefined &&
            typeof conf.enableBodyParsing === 'boolean'
        ) {
            this.conf.enableBodyParsing = conf?.enableBodyParsing
        }
        if (
            conf?.enableCookieParsing != undefined &&
            typeof conf.enableCookieParsing === 'boolean'
        ) {
            this.conf.enableCookieParsing = conf?.enableCookieParsing
        }
        if (
            conf?.suppressRouteLog != undefined &&
            typeof conf.suppressRouteLog === 'boolean'
        ) {
            this.conf.suppressRouteLog = conf?.suppressRouteLog
        }
    }

    use = use

    //Method to push route data into the routes array,
    //since the behaviour is only different in case of methodString
    //i.e. GET, POST etc. we abstracted this push behaviour into a
    //separate method, hence called routePush
    /**
     * @private method
     * */
    routePush(methodString, url, ...handlers) {
        this.routes.push({
            url,
            method: methodString,
            handler: handlers.pop(),
            middlewares: handlers,
        })
    }

    get(url, ...handlers) {
        this.routePush('GET', url, ...handlers)
    }

    post(url, ...handlers) {
        this.routePush('POST', url, ...handlers)
    }

    put(url, ...handlers) {
        this.routePush('PUT', url, ...handlers)
    }

    patch(url, ...handlers) {
        this.routePush('PATCH', url, ...handlers)
    }

    delete(url, ...handlers) {
        this.routePush('DELETE', url, ...handlers)
    }

    options(url, ...handlers) {
        this.routePush('OPTIONS', url, ...handlers)
    }

    /**
     * @private method
     * */
    registerRoutes() {
        if (!this.conf.suppressRouteLog)
            console.log(clc.yellow(`COMPILED ROUTES:`))
        this.routes.forEach((obj, idx) => {
            if (!this.conf.suppressRouteLog) {
                let color = clc.white.bold
                switch (obj.method) {
                    case 'GET':
                        color = clc.cyan
                        break
                    case 'POST':
                        color = clc.blue
                        break
                    case 'PUT':
                        color = clc.magenta
                        break
                    case 'DELETE':
                        color = clc.red
                        break
                }
                console.log(
                    clc.green(`${idx + 1}`),
                    ` |>`,
                    color.bold(` [${obj.method}]`),
                    `|>`,
                    color.underline(`${obj.url}`)
                )
            }
            trieRouter.on(
                obj.method,
                obj.url,
                (req, res) => {
                    obj.handler(req, res)
                },
                obj
            )
        })
    }

    /*
     * @param PORT {number} Port to start listening on, default is 8080
     * @param handler {function} callback function to call once server is successfully started
     */
    listen = listen
}

module.exports = Routine
exports = module.exports
exports.Router = Router
