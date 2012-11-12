var _ = require('underscore')
, debug = require('debug')('mtgox')
, crypto = require('crypto')
, request = require('request')
, qs = require('querystring')
, num = require('num')
, Mtgox = module.exports = function(options) {
    this.options = options || {};
    this.nonce = require('nonce')();
};

_.extend(Mtgox.prototype, {
    query: function(path, payload, cb) {
        if (arguments.length === 2) {
            cb = payload;
            payload = {};
        }

        payload.nonce = this.nonce();

        var post = qs.stringify(payload);

        var hmac = crypto.createHmac('sha512', new Buffer(this.options.secret, 'base64'));
        hmac.update(post);

        var r = {
            url: 'https://mtgox.com/api' + path,
            method: 'POST',
            json: true,
            body: post,
            headers: {
                'Rest-Key': this.options.key,
                'Rest-Sign': hmac.digest('base64'),
                'User-Agent': 'Mozilla/4.0 (compatible; MtGox node.js client)',
                'Content-type': 'application/x-www-form-urlencoded'
            }
        };

        console.log(r);

        request(r, function(err, res, body) {
            if (err) return cb(err);
            if (res.statusCode < 200 || res.statusCode >= 300) return cb(new Error('status code ' + res.statusCode + ': ' + body.error));
            if (body.result == 'error') return cb(new Error(body.error));
            cb(null, body['return']);
        });
    },

    orders: function(cb) {
        this.query('/1/generic/private/orders', function(err, res) {
            if (err) return cb(err);

            cb(null, _.map(res, function(o) {
                return {
                    id: o.oid,
                    pair: o.item + o.currency,
                    volume: num(o.amount.value).add(o.invalid_amount.value),
                    price: num(o.price.value)
                };
            }));
        });
    },

    depth: function(pair, cb) {
        if (pair != 'BTCUSD') return cb(new Error('unsupported pair'));

        request({ 
            url: 'https://mtgox.com/api/1/BTCUSD/depth', 
            json: true, 
            headers: {
                'User-Agent': 'hello'
            }  
        }, function(err, res, data) {
            if (err) return cb(err);
            if (data.result != 'success') { console.error(data); return cb(new Error('error from api: ' + data.error)); }

            var m = function(depth) {
                return {
                    price: num(depth.price),
                    volume: num(depth.amount)
                };
            };

            cb(null, {
                bids: _.map(data['return'].bids, m),
                asks: _.map(data['return'].asks, m).reverse()
            });
        });
    },

    redeem: function(code, cb) {
        if (!code) return cb(new Error('code missing'));
        this.query('/0/redeemCode.php', { code: code }, function(err, res) {
            if (err) return cb(err);
            console.log(res);
            cb(null, res);
        });
    }
});