mtgox
=====

node.js implementation of the mtgox.com API

install
---


```
npm install mtgox
```

usage
---

```javascript
var MtGox = require('mtgox');
var gox = new MtGox();

// Get maket stats
gox.market('BTCUSD', function(err, market) {
    console.log(market);
});

/*
{ bid: '132.00002',
  ask: '132.28998',
  last: '132.28999',
  high: '146.50000',
  low: '146.50000',
  volume: '100345.49455633',
  average: '135.33110',
  timestamp: 1367411416140481 }
*/

// Get order depth
gox.depth('BTCUSD', function(err, depth) {
    console.log(depth);
});

/*
{ bids:
   [ { price: '117.3', volume: '1' },
     { price: '117.31297', volume: '10.2817' },
     ...
     { price: '130.32902', volume: '0.50387903' } ],
  asks:
   [ { price: '143.35609', volume: '0.01' },
     { price: '143.3458', volume: '250' },
     ...
     { price: '130.49998', volume: '0.72801433' } ] }
*/

// Key+secret is required to access the private API
gox = new MtGox({
    key: 'api key',
    secret: 'api secret'
});

// Place an order
gox.order({
    market: 'BTCUSD',
    side: 'bid', // or ask
    price: '0.1', // USD
    volume: '5' // BTC
}, function(err, id) {
    console.log('Order #%s', id);
});

// Get my orders
gox.orders(function(err, orders) {
    console.log(orders);
});

// Cancel an order
gox.cancel('orderid', function(err) {
    console.log('Order cancelled');
});

```

license
---

```
Copyright (c) Andreas Brekken (“Author”) and Contributors

All rights reserved.

The “Free as in Hugs” License

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.

Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.

Users of this software are permitted to offer to hug the Author or Contributors, free of charge or obligation.

THIS SOFTWARE AND ANY HUGS ARE PROVIDED BY THE AUTHOR AND CONTRIBUTORS “AS IS” AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL ANYONE BE HELD LIABLE FOR ACTUAL HUGS. IN NO EVENT SHALL THE AUTHOR OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; LONELINESS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. DON’T BE CREEPY.
```
