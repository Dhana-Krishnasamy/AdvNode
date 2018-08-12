const mongoose = require("mongoose");
const redis = require("redis");
const redisUrl = "redis://127.0.0.1:6379";
const client = redis.createClient(redisUrl);
const util = require("util");

client.hget = util.promisify(client.hget);
const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.cache = function(options = {}) {
  this.useCache = true;
  this.hashKey = JSON.stringify(options.key || "");
  return this;
};

mongoose.Query.prototype.exec = async function() {
  if (!this.useCache) {
    return exec.apply(this, arguments);
  }

  const key = toKey(this.getQuery(), this.mongooseCollection.name);

  const cacheValue = await client.hget(this.hashKey, key);
  if (cacheValue) {
    console.log("HIT");
    const doc = JSON.parse(cacheValue);
    return Array.isArray(doc)
      ? doc.map(d => new this.model(d))
      : new this.model(doc);
  } else console.log("MISS");

  const queryResult = await exec.apply(this, arguments);
  client.hset(this.hashKey, key, JSON.stringify(queryResult), "EX", 10);
  return queryResult;
};

const toKey = (query, collectionName) => {
  return JSON.stringify(
    Object.assign({}, query, {
      collection: collectionName
    })
  );
};

module.exports = {
  clearHash(hashKey) {
    client.del(JSON.stringify(hashKey || ""));
  }
};
