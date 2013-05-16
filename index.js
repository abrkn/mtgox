var debug = require('debug')('mtgox')
, crypto = require('crypto')
, request = require('request')
, qs = require('querystring')
, util = require('util')
, num = require('num')
, MtGox = module.exports = function(options) {
    this.options = options || {}
    this.options.url || (this.options.url = 'https://data.mtgox.com/api')
    this.nonce = require('nonce')()
}

MtGox.prototype.query = function(path, payload, cb) {
    if (!cb) {
        cb = payload
        payload = {}
    }

    payload.nonce = this.nonce()

    var post = qs.stringify(payload)

    var hmac = crypto.createHmac('sha512', new Buffer(this.options.secret, 'base64'))
    hmac.update(post)

    var r = {
        url: this.options.url + path,
        method: 'POST',
        json: true,
        body: post,
        headers: {
            'Rest-Key': this.options.key,
            'Rest-Sign': hmac.digest('base64'),
            'User-Agent': 'Mozilla/4.0 (compatible MtGox node.js client)',
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    }

    debug(util.inspect(r))

    request(r, function(err, res, body) {
        if (err) return cb(err)
        if (!body) return cb(new Error('failed to parse body'))
        if (body.error) return cb(new Error(body.error))
        if (res.statusCode < 200 || res.statusCode >= 300) return cb(new Error('status code ' + res.statusCode))

        cb(null, body['return'])
    })
}

MtGox.prototype.orders = function(cb) {
    this.query('/1/generic/private/orders', function(err, res) {
        if (err) return cb(err)

        cb(null, res.map(function(o) {
            debug(util.inspect(o))
            return {
                id: o.oid,
                side: o.type,
                market: o.item + o.currency,
                volume: (+num(o.amount.value)).toString(),
                price: (+num(o.price.value)).toString()
            }
        }))
    })
}

MtGox.prototype.depth = function(market, cb) {
    request({
        url: this.options.url + '/1/' + market + '/depth',
        json: true,
        headers: {
            'User-Agent': 'hello'
        }
    }, function(err, res, data) {
        if (err) return cb(err)
        if (data.result != 'success') {
            return cb(new Error('error from api: ' + data.error))
        }

        var m = function(depth) {
            return {
                price: depth.price + '',
                volume: depth.amount + ''
            }
        }

        cb(null, {
            bids: data['return'].bids.map(m),
            asks: data['return'].asks.map(m).reverse()
        })
    })
}

MtGox.prototype.market = function(market, cb) {
    var that = this
    request({
        url: this.options.url + '/1/' + market + '/ticker',
        json: true,
        headers: {
            'User-Agent': 'hello'
        }
    }, function(err, res, data) {
        err  = err || that.error(data)
        if (err) return cb(err)

        var result = data['return']

        cb(null, {
            bid: result.buy.value,
            ask: result.sell.value,
            last: result.last.value,
            high: result.high.value,
            low: result.high.value,
            volume: result.vol.value,
            average: result.avg.value,
            timestamp: +result.now
        })
    })
}

MtGox.prototype.error = function(result) {
    if (result.result == 'success') return
    return new Error('API error: ' + (result.error || 'Unspecified'))
}

MtGox.prototype.order = function(order, cb) {
    this.query('/1/' + order.market + '/private/order/add', {
        type: order.side,
        price_int: +num(order.price).mul(1e5),
        amount_int: +num(order.volume).mul(1e8)
    }, function(err, res) {
        if (err) return cb(err)
        cb(null, res)
    })
}

MtGox.prototype.cancel = function(id, cb) {
    this.query('/1/BTCUSD/private/order/cancel', {
        oid: id
    }, function(err, res) {
        if (err) return cb(err)
        cb(null, res)
    })
}
