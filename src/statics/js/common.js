(function () {
  var gRouter = null
  var gConfig = null
  var gResource = null

  Vue.config.silent = true

  window.Utils = {}

  window.VStarter.beforeInit = function (transition) {
    gConfig = transition.config
    gRouter = transition.router
    gResource = getResource()
    Vue.$router = gRouter
    loadCss()
    loadJs(function () {
      transition.next()
    })
  }

  function getResource() {
    var resource = {
      'RESOURCE_VERSION': '0.0.1',
      'PUBLIC_CSS': [
        'https://cdn.bootcss.com/iview/2.11.0/styles/iview.css',
      ],
      'PUBLIC_BASE_JS': [
        'https://cdn.bootcss.com/iview/2.11.0/iview.min.js',
        'https://cdn.bootcss.com/fetch/2.0.3/fetch.min.js'
      ],
      'PUBLIC_NORMAL_JS': []
    }
    return resource
  }

  function loadCss() {
    var publicCss = getPublicCss()
    publicCss.forEach(function (item) {
      var link = document.createElement('link')
      link.type = 'text/css'
      link.rel = 'stylesheet'
      link.href = item
      document.head.insertBefore(link, document.head.firstChild)
    })
  }

  function loadJs(callback) {
    var publicNormalJs = getPublicNormalJs()
    var publicBaseJs = getPublicBaseJs()
    var baseDefs = [],
      normalDefs = [];
    publicBaseJs.forEach(function (item) {
      baseDefs.push(loadScript(item))
    })
    if (publicBaseJs) {
      Promise.all(baseDefs).then(function (res) {
        publicNormalJs.forEach(function (item) {
          normalDefs.push(loadScript(item))
        })
        if (publicNormalJs && publicNormalJs.length > 0) {
          Promise.all(normalDefs).then(function () {
            callback()
          })
        } else {
          callback()
        }
      })
    } else if (publicNormalJs && publicNormalJs.length > 0) {
      publicNormalJs.forEach(function (item) {
        normalDefs.push(loadScript(item))
      })
      Promise.all(normalDefs).then(function () {
        callback()
      })
    } else {
      callback()
    }
  }

  function getUserParams() {
    var params = {};
    var search = location.search && location.search.substr(1);
    if (search) {
      var paramsArr = search.split('&');
      paramsArr.forEach(function (item) {
        var kv = item.split('=');
        if (kv.length == 2) {
          params[kv[0]] = kv[1];
        }
      })
    }
    return params;
  }

  function getCdn() {
    return gConfig['RESOURCE_SERVER']
  }

  function getPublicCss() {
    var config = gConfig
    var cdn = getCdn()
    var publicCss = gResource['PUBLIC_CSS']
    var bhVersion = config['BH_VERSION']
    var version = bhVersion ? ('-' + bhVersion) : ''
    var theme = config['THEME'] || 'blue'
    var regEx = /fe_components|bower_components/
    var cssUrl = []
    for (var i = 0; i < publicCss.length; i++) {
      var url = addTimestamp(publicCss[i])
      if (regEx.test(publicCss[i])) {
        cssUrl.push(cdn + url.replace(/\{\{theme\}\}/, theme).replace(/\{\{version\}\}/, version))
      } else {
        cssUrl.push(url)
      }
    }
    return cssUrl
  }

  function getPublicNormalJs() {
    var cdn = getCdn()
    var publicNormalJs = gResource['PUBLIC_NORMAL_JS']
    var bhVersion = gConfig['BH_VERSION']
    var version = bhVersion ? ('-' + bhVersion) : ''
    var deps = []
    var regEx = /fe_components|bower_components/
    for (var i = 0; i < publicNormalJs.length; i++) {
      var url = addTimestamp(publicNormalJs[i])
      if (regEx.test(publicNormalJs[i])) {
        deps.push(cdn + url.replace(/\{\{version\}\}/, version))
      } else {
        deps.push(url)
      }
    }
    return deps
  }

  function getPublicBaseJs() {
    var cdn = getCdn()
    var publicBaseJs = gResource['PUBLIC_BASE_JS']
    var bhVersion = gConfig['BH_VERSION']
    var version = bhVersion ? ('-' + bhVersion) : ''
    var deps = []
    var regEx = /fe_components|bower_components/
    for (var i = 0; i < publicBaseJs.length; i++) {
      var url = addTimestamp(publicBaseJs[i])
      if (regEx.test(publicBaseJs[i])) {
        deps.push(cdn + url.replace(/\{\{version\}\}/, version))
      } else {
        deps.push(url)
      }
    }
    return deps
  }

  function addTimestamp(url) {
    var resourceVersion = gResource['RESOURCE_VERSION'] || (+new Date())
    return url + '?rv=' + resourceVersion
  }

  Utils.post = function (url, data) {
    return fetch(url, {
      credentials: 'include',
      method: "POST",
      body: data ? JSON.stringify(data) : '{}',
      headers: {
        "Accept": "application/json, text/plain, */*",
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest"
      },
    }).then(function (response) {
      return response.json()
    }).then(function (res) {
      if (res.code === '0' || res.code === 0) {
        return res
      } else {
        throw res
      }
    })
  }
  Utils.get = function (url, data) {
    return fetch(convertToGetParams(url, data), {
      credentials: 'include',
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest"
      },
    }).then(function (response) {
      return response.json()
    }).then(function (res) {
      if (res.code === '200' || res.code === 200) {
        return res
      } else {
        throw res
      }
    })
  }
  function convertToGetParams(url, data) {
    if (typeof(data) == 'undefined' || data == null || typeof(data) != 'object') {
      return url;
    }
    url += (url.indexOf("?") != -1) ? "" : "?";
    for (var k in data) {
      url += ((url.indexOf("=") != -1) ? "&" : "") + k + "=" + encodeURI(data[k]);
      console.log(url);
    }
    return url
  }

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var node = document.createElement("script");
      node.setAttribute('async', 'async');
      var timeID
      var supportLoad = "onload" in node
      var onEvent = supportLoad ? "onload" : "onreadystatechange"
      node[onEvent] = function onLoad() {
        if (!supportLoad && !timeID && /complete|loaded/.test(node.readyState)) {
          timeID = setTimeout(onLoad)
          return
        }
        if (supportLoad || timeID) {
          clearTimeout(timeID)
          resolve(null, node);
        }
      }
      document.head.insertBefore(node, document.head.firstChild);
      node.src = src;
      node.onerror = function (e) {
        reject(e);
      }
    })
  }
})()
