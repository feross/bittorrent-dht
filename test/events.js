var common = require('./common')
var DHT = require('../')
var test = require('tape')
/* var log = require('why-is-node-running')

setInterval(function () {
  log() // logs out active handles that are keeping node running
}, 10000) */

common.wrapTest(test, '`node` event fires for each added node (100x)', function (t, ipv6) {
  var dht = new DHT({ bootstrap: false, ipv6: ipv6 })
  common.failOnWarningOrError(t, dht)

  var numNodes = 0
  dht.on('node', function () {
    numNodes += 1
    if (numNodes === 100) {
      dht.destroy()
      t.pass('100 nodes added, 100 `node` events emitted')
      t.end()
    }
  })

  common.addRandomNodes(dht, 100, ipv6)
})

common.wrapTest(test, '`node` event fires for each added node (10000x)', function (t, ipv6) {
  var dht = new DHT({ bootstrap: false, ipv6: ipv6 })
  common.failOnWarningOrError(t, dht)

  var numNodes = 0
  dht.on('node', function () {
    numNodes += 1
    if (numNodes === 10000) {
      dht.destroy()
      t.pass('10000 nodes added, 10000 `node` events emitted')
      t.end()
    }
  })

  common.addRandomNodes(dht, 10000, ipv6)
})

common.wrapTest(test, '`announce` event fires for each added peer (100x)', function (t, ipv6) {
  var dht = new DHT({ bootstrap: false, ipv6: ipv6 })
  common.failOnWarningOrError(t, dht)

  var numPeers = 0
  dht.on('announce', function () {
    numPeers += 1
    if (numPeers === 100) {
      dht.destroy()
      t.pass('100 peers added, 100 `announce` events emitted')
      t.end()
    }
  })

  common.addRandomPeers(dht, 100, ipv6)
})

common.wrapTest(test, '`announce` event fires for each added peer (10000x)', function (t, ipv6) {
  var dht = new DHT({ bootstrap: false, ipv6: ipv6 })
  common.failOnWarningOrError(t, dht)

  var numPeers = 0
  dht.on('announce', function () {
    numPeers += 1
    if (numPeers === 10000) {
      dht.destroy()
      t.pass('10000 peers added, 10000 `announce` events emitted')
      t.end()
    }
  })

  common.addRandomPeers(dht, 10000, ipv6)
})

common.wrapTest(test, '`listening` event fires', function (t, ipv6) {
  t.plan(2)
  var dht = new DHT({ bootstrap: false, ipv6: ipv6 })

  common.failOnWarningOrError(t, dht)

  dht.listen(function () {
    t.pass('listen() onlistening shorthand gets called')
  })
  dht.on('listening', function () {
    t.pass('`listening` event fires')
    dht.destroy()
  })
})

common.wrapTest(test, '`ready` event fires when bootstrap === false', function (t, ipv6) {
  t.plan(2)
  var dht = new DHT({ bootstrap: false, ipv6: ipv6 })

  common.failOnWarningOrError(t, dht)

  dht.on('ready', function () {
    t.pass('`ready` event fires')
    t.equal(dht.ready, true)
    dht.destroy()
  })
})

common.wrapTest(test, 'add node with opposite protocol address', function (t, ipv6) {
  t.plan(1)
  var dht = new DHT({ bootstrap: false, ipv6: ipv6 })
  t.throws(function () { common.addRandomNodes(dht, 1, !ipv6) }, /Address protocol mismatch!/, 'should throw an error')
  dht.destroy()
})

common.wrapTest(test, '`ready` event fires when there are K nodes', function (t, ipv6) {
  t.plan(6)

  // dht1 will simulate an existing node (with a populated routing table)
  var dht1 = new DHT({ bootstrap: false, ipv6: ipv6 })
  common.failOnWarningOrError(t, dht1)

  dht1.on('ready', function () {
    t.pass('dht1 `ready` event fires because { bootstrap: false }')
    t.equal(dht1.ready, true)

    common.addRandomNodes(dht1, 3, ipv6)
    t.equal(dht1.nodes.count(), 3, 'dht1 has 3 nodes')

    dht1.listen(function () {
      var port = dht1.address().port
      t.pass('dht1 listening on port ' + port)

      // dht2 will get all 3 nodes from dht1 and should also emit a `ready` event
      var dht2 = new DHT({ ipv6: ipv6, bootstrap: common.localHost(ipv6, false) + ':' + port })
      common.failOnWarningOrError(t, dht2)

      dht2.on('ready', function () {
        // 5 nodes because dht1 also optimistically captured dht2's addr and included it
        t.equal(dht1.nodes.count(), 4, 'dht2 gets 5 nodes from dht1 and fires `ready`')
        t.equal(dht2.ready, true)

        dht1.destroy()
        dht2.destroy()
      })
    })
  })
})

