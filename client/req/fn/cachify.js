const cacheObj = {};
const defaultId = '__this_is_a_default_id__';

function cachifyPlugin(R) {
  /**
   * @param {string} apiName 对应req的api
   * @param {boolean} force 是否强制发起请求，不走缓存
   * @param {string} id 作为辅助的标志，细分缓存的类型，比如分页
   */
  return (apiName, force, id = defaultId) => opt => new Promise((res, rej) => {
    const caches = cacheObj[apiName];
    const cache = caches ? caches[id] : undefined;
    const apiArr = apiName.split('.');
    apiArr.unshift(R);
    const api = apiArr.reduce((pV, cV) => pV[cV]);
    if (!cache || force) {
      api(opt)
        .then((r1) => {
          if (!caches) {
            cacheObj[apiName] = {};
          }
          cacheObj[apiName][id] = r1;
          res(r1);
        })
        .catch((err) => {
          rej(err);
        });
    } else {
      res(cache);
    }
  });
}

/**
 * 清除指定接口的缓存
 * @param {string} apiName 对应req的api
 * @param {string} id 作为辅助的标志，细分缓存的类型，比如分页
 */
function clear(apiName, id = defaultId) {
  cacheObj[apiName][id] = null;
}

/**
 * 清除全部缓存
 * @param {string} apiName 对应req的api，非必选，不填是默认清空所有缓存
 */
function clearAll(apiName) {
  if (apiName) {
    cacheObj[apiName] = null;
    return;
  }
  Object.keys(cacheObj).map((key) => {
    cacheObj[key] = null;
    return key;
  });
}

module.exports = {
  install(R) {
    R.cachify = cachifyPlugin(R);
    R.clearCache = clear;
    R.clearAllCache = clearAll;
  },
};
