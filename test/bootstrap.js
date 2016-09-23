var common = require('./common')
var DHT = require('../')
var test = require('tape')

// https://github.com/feross/bittorrent-dht/pull/36
common.wrapTest(test, 'bootstrap and listen to custom port', function (t, ipv6) {
  t.plan(4)

  var dht = new DHT({ ipv6: ipv6, bootstrap: [ ipv6 ? '[::2]:1000' : '1.2.3.4:1000' ] })
  common.failOnWarningOrError(t, dht)

  var port = Math.floor(Math.random() * 60000) + 1024
  self = this

  t.ok(!dht.listening)
  dht.listen(port)
  t.ok(!dht.listening)

  // bootstrapping should wait until next tick, so user has a chance to
  // listen to a custom port
  dht.on('listening', function () {
    t.ok(dht.listening)
    t.equal(dht.address().port, port)
  })

  dht.on('ready', function () {
    dht.destroy()
  })
})
