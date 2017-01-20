"use strict";

const os = require('os');
const path = require('path');
const util = require('util');
const es = require('event-stream');
const rp = require('request-promise');
const stream      = require('stream');
const _ = require('underscore');
const Q = require('q');
const co = require('co');
const duniterKeypair = require('duniter-keypair');

module.exports = (duniterServer, startServices, stopServices) => {
  return new WebAdmin(duniterServer, startServices, stopServices);
};

function WebAdmin (duniterServer, startServices, stopServices) {

  const logger = duniterServer.logger;
  const keyring = duniterServer.lib.keyring;
  const Identity = duniterServer.lib.Identity;
  const Peer = duniterServer.lib.Peer;
  const rawer = duniterServer.lib.rawer;
  const http2raw = duniterServer.lib.http2raw;
  const dos2unix = duniterServer.lib.dos2unix;
  const contacter = duniterServer.lib.contacter;
  const network = duniterServer.lib.network;
  const constants = duniterServer.lib.constants;
  const ucp = duniterServer.lib.ucp;

  // Node instance: this is the object to be managed by the web admin
  const server = this.server = duniterServer;
  const that = this;

  server.pipe(es.mapSync(function(data) {
    if (data.pulling !== undefined || data.pow !== undefined) {
      that.push(data);
    }
  }));

  stream.Duplex.call(this, { objectMode: true });

  // Unused, but made mandatory by Duplex interface
  this._read = () => null;
  this._write = () => null;

  let startServicesP, stopServicesP;

  let pluggedConfP = Promise.resolve(); // Initially, the node is already plugged in

  let pluggedDALP = Promise.resolve(); // Initially, the node is already plugged in


    this.pushEntity = (req, rawer, type) => co(function *() {
        let rawDocument = rawer(req);
        rawDocument = dos2unix(rawDocument);
        const written = yield server.writeRaw(rawDocument, type);
        try {
            return written.json();
        } catch (e) {
            logger.error('Written:', written);
            logger.error(e);
            throw e;
        }
    });

  function replugDAL() {
    return co(function *() {
      yield pluggedConfP;
      return plugForDAL();
    });
  }

  this.summary = () => co(function *() {
    yield pluggedDALP;
    const peer = new Peer({
      endpoints: [
        network.getEndpoint(server.conf)
      ]
    });
    const host = peer.getURL();
    const current = yield server.dal.getCurrentBlockOrNull();
    const rootBlock = yield server.dal.getBlock(0);
    const lastUDBlock = yield server.dal.blockDAL.lastBlockWithDividend();
    const parameters = yield server.dal.getParameters();
    return {
      "version": server.version,
      "host": host,
      "current": current,
      "rootBlock": rootBlock,
      "pubkey": server.keyPair.publicKey,
      "seckey": server.keyPair.secretKey,
      "conf": {
        "cpu": server.conf.cpu
      },
      "parameters": parameters,
      "lastUDBlock": lastUDBlock
    };
  });

  this.powSummary = () => co(function *() {
    yield pluggedDALP;
    return {
      "total": yield server.getCountOfSelfMadePoW(),
      "mirror": !(yield server.isServerMember()),
      "waiting": true
    };
  });

  this.previewPubkey = (req) => co(function *() {
    const conf = http2raw.conf(req);
    const pair = yield duniterKeypair.duniter.methods.scrypt(conf.idty_entropy, conf.idty_password);
    return {
      "pubkey": pair.pub
    };
  });

  this.openUPnP = () => co(function *() {
    yield pluggedDALP;
    return server.upnp();
  });

  this.regularUPnP = () => co(function *() {
    yield pluggedDALP;
    if (server.upnpAPI) {
      server.upnpAPI.stopRegular();
    }
    if (server.conf.upnp) {
      try {
        yield server.upnp();
        server.upnpAPI.startRegular();
      } catch (e) {
        logger.error(e);
      }
    }
    return {};
  });

  this.previewNext = () => co(function *() {
    yield pluggedDALP;
    const block = yield server.doMakeNextBlock();
    block.raw = rawer.getBlock(block);
    return block;
  });

  this.sendConf = (req) => co(function *() {
    yield pluggedConfP;
    const conf = http2raw.conf(req);
    const pair = yield duniterKeypair.duniter.methods.scrypt(conf.idty_entropy, conf.idty_password);
    yield server.dal.saveConf(_.extend(server.conf, {
      routing: true,
      createNext: true,
      cpu: constants.DEFAULT_CPU,
      ipv4: conf.local_ipv4,
      ipv6: conf.local_ipv6,
      port: conf.lport,
      remoteipv4: conf.remote_ipv4,
      remoteipv6: conf.remote_ipv6,
      remoteport: conf.rport,
      upnp: conf.upnp,
      salt: conf.idty_entropy,
      passwd: conf.idty_password,
      pair: pair.json(),
      avgGenTime: conf.avgGenTime,
      blocksRot: conf.blocksRot,
      c: conf.c,
      currency: conf.currency,
      dt: conf.dt,
      dtDiffEval: conf.dtDiffEval,
      medianTimeBlocks: conf.medianTimeBlocks,
      msValidity: conf.msValidity,
      percentRot: conf.percentRot,
      sigDelay: conf.sigDelay,
      sigPeriod: conf.sigPeriod,
      sigQty: conf.sigQty,
      sigStock: conf.sigStock,
      sigValidity: conf.sigValidity,
      sigWindow: conf.sigWindow,
      stepMax: conf.stepMax,
      ud0: conf.ud0,
      xpercent: conf.xpercent,
      idtyWindow: conf.idtyWindow,
      msWindow: conf.msWindow
    }));
    pluggedConfP = co(function *() {
      // yield bmapi.closeConnections();
      // yield server.loadConf();
      // bmapi = yield bma(server, null, true);
    });
    yield pluggedConfP;
    const buid = '0-E3B0C44298FC1C149AFBF4C8996FB92427AE41E4649B934CA495991B7852B855';
    const entity = Identity.statics.fromJSON({
      buid: buid,
      uid: conf.idty_uid,
      issuer: pair.publicKey,
      currency: conf.currency
    });
    let found = yield server.dal.getIdentityByHashOrNull(entity.getTargetHash());
    if (!found) {
      let createIdentity = rawer.getOfficialIdentity(entity);
      createIdentity += pair.signSync(createIdentity) + '\n';
      found = yield that.pushEntity({ body: { identity: createIdentity }}, http2raw.identity, constants.ENTITY_IDENTITY);
    }
    yield server.dal.fillInMembershipsOfIdentity(Q(found));
    if (_.filter(found.memberships, { membership: 'IN'}).length == 0) {
      const block = ucp.format.buid(null);
      let join = rawer.getMembershipWithoutSignature({
        "version": constants.DOCUMENTS_VERSION,
        "currency": conf.currency,
        "issuer": pair.publicKey,
        "block": block,
        "membership": "IN",
        "userid": conf.idty_uid,
        "certts": block
      });
      join += pair.signSync(join) + '\n';
      yield that.pushEntity({ body: { membership: join }}, http2raw.membership, constants.ENTITY_MEMBERSHIP);
      yield server.recomputeSelfPeer();
    }
    //
    return found;
  });

  this.publishANewSelfPeer = (req) => co(function *() {
    yield pluggedConfP;
    yield server.recomputeSelfPeer();
    return {};
  });

  this.applyNetworkConf = (req) => co(function *() {
    yield pluggedConfP;
    const conf = http2raw.conf(req);
    yield server.dal.saveConf(_.extend(server.conf, {
      ipv4: conf.local_ipv4,
      ipv6: conf.local_ipv6,
      port: conf.lport,
      remoteipv4: conf.remote_ipv4,
      remoteipv6: conf.remote_ipv6,
      remoteport: conf.rport,
      remotehost: conf.dns,
      upnp: conf.upnp
    }));
    pluggedConfP = co(function *() {
      // yield bmapi.closeConnections();
      yield server.loadConf();
      yield stopServices();
      yield startServices();
      // bmapi = yield bma(server, null, true);
      // yield bmapi.openConnections();
      yield server.recomputeSelfPeer();
    });
    yield pluggedConfP;
    return {};
  });

  this.applyNewKeyConf = (req) => co(function *() {
    yield pluggedConfP;
    const conf = http2raw.conf(req);
    const keyPair = yield duniterKeypair.duniter.methods.scrypt(conf.idty_entropy, conf.idty_password);
    const publicKey = keyPair.pub;
    const secretKey = keyPair.sec;
    yield server.dal.saveConf(_.extend(server.conf, {
      salt: conf.idty_entropy,
      passwd: conf.idty_password,
      pair: {
        pub: publicKey,
        sec: secretKey
      }
    }));
    pluggedConfP = yield server.loadConf();
    yield pluggedConfP;
    return {};
  });

  this.applyCPUConf = (req) => co(function *() {
    yield pluggedConfP;
    server.conf.cpu = http2raw.cpu(req);
    yield server.dal.saveConf(server.conf);
    server.push({ cpu: server.conf.cpu });
    pluggedConfP = yield server.loadConf();
    yield pluggedConfP;
    return {};
  });

  this.listInterfaces = () => co(function *() {
    const upnp = {
      name: 'upnp',
      addresses: []
    };
    const manual = {
      name: 'conf',
      addresses: []
    };
    const lan = {
      name: 'lan',
      addresses: []
    };
    yield pluggedConfP;
    const conf = server.conf;
    if (conf.remoteipv4) {
      manual.addresses.push({ family: 'IPv4', address: conf.remoteipv4 });
    }
    if (conf && conf.remoteipv6) {
      manual.addresses.push({ family: 'IPv6', address: conf.remoteipv6 });
    }
    let upnpConf;
    try {
      upnpConf = yield network.upnpConf(null, logger);
      if (upnpConf.remoteipv4) {
        upnp.addresses.push({
          family: 'IPv4',
          address: upnpConf.remoteipv4
        });
      }
      if (upnpConf.remoteipv6) {
        upnp.addresses.push({
          family: 'IPv6',
          address: upnpConf.remoteipv6
        });
      }
    } catch (e) {
      logger.error(e.stack || e);
    }
    const lanIPv4 = getLANIPv4();
    lanIPv4.forEach(function(addr) {
      lan.addresses.push({
        family: 'IPv4',
        address: addr.value
      });
    });
    const lanIPv6 = getLANIPv6();
    lanIPv6.forEach(function(addr) {
      lan.addresses.push({
        family: 'IPv6',
        address: addr.value
      });
    });
    const randomPort = network.getRandomPort(conf);
    return {
      local: network.listInterfaces(),
      remote: [upnp, manual, lan],
      auto: {
        local: {
          ipv4: network.getBestLocalIPv4(),
          ipv6: network.getBestLocalIPv6(),
          port: randomPort
        },
        remote: {
          ipv4: upnpConf && upnpConf.remoteipv4,
          ipv6: upnpConf && upnpConf.remoteipv6,
          dns: '',
          port: randomPort,
          upnp: upnpConf ? true : false
        }
      },
      conf: {
        local: {
          ipv4: conf && conf.ipv4,
          ipv6: conf && conf.ipv6,
          port: conf && conf.port
        },
        remote: {
          ipv4: conf && conf.remoteipv4,
          ipv6: conf && conf.remoteipv6,
          dns:  conf && conf.remotehost,
          port: conf && conf.remoteport,
          upnp: conf && conf.upnp
        }
      }
    };
  });

  this.selfPeer = () => co(function*(){
    return server.PeeringService.peer();
  });

  this.peers = () => co(function*(){
    const peers = yield server.dal.listAllPeers();
    return { peers };
  });

  this.currencyParameters = () => co(function*(){
    return server.dal.getParameters();
  });

  this.startAllServices = () => co(function *() {
    // Allow services to be stopped
    stopServicesP = null;
    yield startServicesP || (startServicesP = startServices());
    that.push({ started: true });
    return {};
  });

  this.stopAllServices = () => co(function *() {
    // Allow services to be started
    startServicesP = null;
    yield (stopServicesP || (stopServicesP = stopServices()));
    that.push({ stopped: true });
    return {};
  });

  this.autoConfNetwork = () => co(function *() {
    // Reconfigure the network if it has not been initialized yet
    if (!server.conf.remoteipv4 && !server.conf.remoteipv6 && !server.conf.remotehost) {
      const bestLocal4 = network.getBestLocalIPv4();
      const bestLocal6 = network.getBestLocalIPv6();
      let upnpConf = {
        remoteipv4: bestLocal4,
        remoteipv6: bestLocal6,
        upnp: false
      };
      try {
        upnpConf = yield network.upnpConf();
        upnpConf.upnp = true;
      } catch (e) {
        logger.error(e.stack || e);
      }
      let randomPort = network.getRandomPort(server.conf);
      _.extend(server.conf, {
        ipv4: bestLocal4,
        ipv6: bestLocal6,
        port: randomPort,
        remoteipv4: upnpConf.remoteipv4,
        remoteipv6: upnpConf.remoteipv6,
        remoteport: randomPort,
        upnp: upnpConf.upnp
      });
      yield server.dal.saveConf(server.conf);
      pluggedConfP = co(function *() {
        // yield bmapi.closeConnections();
        yield server.loadConf();
        // bmapi = yield bma(server, null, true);
      });
    }
    return {};
  });

  this.startSync = (req) => co(function *() {
    const sync = require('duniter-crawler').duniter.methods.synchronize(server, req.body.host, parseInt(req.body.port), parseInt(req.body.to), parseInt(req.body.chunkLen));
    sync.flow.pipe(es.mapSync(function(data) {
      // Broadcast block
      that.push(data);
    }));
    yield sync.syncPromise;
    return {};
  });

  this.resetData = () => co(function *() {
    yield pluggedDALP;
    // We have to wait for a non-breaking window to process reset
    yield server.BlockchainService.pushFIFO(() => co(function *() {
      yield that.stopAllServices();
      yield server.unplugFileSystem();
      yield server.cleanDBData();
      yield pluggedDALP;
      pluggedConfP = plugForConf();
      pluggedDALP = replugDAL();
    }));
    return {};
  });

  this.exportData = () => co(function *() {
    yield pluggedDALP;
    return server.exportAllDataAsZIP();
  });

  this.importData = (req) => co(function *() {
    yield that.stopAllServices();
    yield server.unplugFileSystem();
    yield pluggedDALP;
    if (!req.files.importData) {
      throw "Wrong upload file name";
    }
    const importZipPath = path.join(server.home, 'import.zip');
    yield new Promise((resolve, reject) => {
      req.files.importData.mv(importZipPath, (err) => {
        err ? reject(err) : resolve();
      });
    });
    yield server.importAllDataFromZIP(importZipPath);
    pluggedConfP = plugForConf();
    pluggedDALP = replugDAL();
    return {};
  });

  this.isNodePubliclyReachable = (req) => co(function *() {
    const peer = yield server.PeeringService.peer();
    const p = Peer.statics.fromJSON(peer);
    let reachable;
    const node = contacter(p.getHostPreferDNS(), p.getPort());
    try {
      yield node.getPeer();
      reachable = true;
    } catch (e) {
      reachable = false;
    }
    return { success: reachable };
  });

  this.testPeer = (req) => co(function *() {
    return require('duniter-crawler').duniter.methods.testForSync(server, req.body.host, parseInt(req.body.port));
  });

  this.logsExport = (req) => co(function *() {
    yield pluggedDALP;
    const logs = yield server.getLastLogLines(req.params.quantity || 1500);
    const body = yield rp.post({
      url: 'https://hastebin.com/documents',
      body: typeof logs == 'object' ? logs.join('') : logs
    });
    const res = JSON.parse(body);
    return {
      link: 'http://hastebin.com/' + res.key
    };
  });

  this.blockchainBlocks = (req) => co(function *() {
    const start = parseInt(req.params.from);
    const end = parseInt(req.params.from) + parseInt(req.params.count) - 1;
    const blocks = yield server.dal.getBlocksBetween(start, end);
    return blocks;
  });

  this.blockchainAdd = (req) => co(function *() {
    try {
      let rawBlock = http2raw.block(req);
      rawBlock = dos2unix(rawBlock);
      const written = yield server.writeRaw(rawBlock, constants.ENTITY_BLOCK);
      return written.json();
    } catch (e) {
      logger.error(e);
      throw e;
    }
  });

  function plugForConf() {
      return co(function *() {
          yield server.plugFileSystem();
          yield server.loadConf();
          // bmapi = yield bma(server, null, true);
      });
  }

  function plugForDAL() {
      return co(function *() {
          yield pluggedConfP;
          return server.initDAL();
      });
  }

}

function getLANIPv4 () {
  return getLAN('IPv4');
}

function getLANIPv6 () {
  return getLAN('IPv6');
}

function getLAN(family) {
  let netInterfaces = os.networkInterfaces();
  let keys = _.keys(netInterfaces);
  let res = [];
  for (const name of keys) {
    let addresses = netInterfaces[name];
    for (const addr of addresses) {
      if ((addr.family == "IPv4" && family == "IPv4"
        && addr.address != "127.0.0.1" && addr.address != "lo" && addr.address != "localhost")
        || (addr.family == "IPv6" && family == "IPv6"
        && addr.address != "::1" && addr.address != "lo" && addr.address != "localhost"))
      {
        res.push({
          name: name,
          value: addr.address
        });
      }
    }
  }
  return res;
}

util.inherits(WebAdmin, stream.Duplex);
