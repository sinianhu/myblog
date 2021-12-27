
function $id(id) {
    return document.getElementById(id);
}
function $c(tagName) {
    return document.createElement(tagName);
}
function _isFn(fn){
	return typeof(fn)=='function';
}
window.onload = function() {
    imageLoad({
        url: function(v) {
            v = [];
			
            for (var i = 1; i <= 6; i++) {
                v[v.length] = 'img/' + i + '.jpg';
            }
			for (var i = 1001; i <= 1001; i++) {
                v[v.length] = 'img/' + i + '.jpg';
            }
			for (var i = 2001; i <= 2003; i++) {
                v[v.length] = 'img/' + i + '.jpg';
            }
			for (var i = 3001; i <= 3008; i++) {
                v[v.length] = 'img/' + i + '.jpg';
            }
            return v;
        },
        oncomplete: function(s) {
           
        },
        complete: function(imgs, s) {
            var $r = $c('div');
            $r.id = 'result';
            $r.innerHTML = '计划加载:' + s.total + ', 加载成功:' + s.load + '错误:' + s.error;
            document.body.appendChild($r);
            for (var i = 0,
            l = imgs.length,
            $m; i < l; i++) {
                $m = $c('div');
                $m.innerHTML = (imgs[i].loaded ? '加载成功:': '加载失败:') + imgs[i].src;
                document.body.appendChild($m);
            }
        }
    });
};


function imageLoad(s) {
    var urlset = [],
    undefined,
    toString = Object.prototype.toString;
    switch (toString.apply(s.url)) {
    case '[object String]':
        urlset[urlset.length] = s.url;
        break;
    case '[object Array]':
        if (!s.url.length) {
            return false;
        }
        urlset = s.url;
        break;
    case '[object Function]':
        s.url = s.url();
        return imageLoad(s);
    default:
        return false;
    }
    var imgset = [],
    r = {
        total: urlset.length,
        load: 0,
        error: 0,
        abort: 0,
        complete: 0,
        currentIndex: 0
    },
    timer,
    _defaults = {
        url: '',
        onload: 'function',
        onerror: 'function',
        oncomplete: 'function',
        ready: 'function',
        complete: 'function',
        timeout: 15
    };
    for (var v in _defaults) {
        s[v] = s[v] === undefined ? _defaults[v] : s[v];
    }
    s.timeout = parseInt(s.timeout) || _defaults.timeout;
    //timer = setTimeout(_callback, s.timeout * 1000);
    for (var i = 0, l = urlset.length,img; i < l; i++) {
        img = new Image();
        img.loaded = false;
        imgset[imgset.length] = img;
    }
    for (i = 0, l = imgset.length; i < l; i++) {
        imgset[i].onload = function() {
            _imageHandle.call(this, 'load', i);
        };
        imgset[i].onerror = function() {
            _imageHandle.call(this, 'error', i);
        };
        imgset[i].onabort = function() {
            _imageHandle.call(this, 'abort', i);
        };
        imgset[i].src = '' + urlset[i];
    }
    if (typeof(s.ready)=='function') {
        s.ready.call({},
        imgset, r);
    }
    function _imageHandle(handle, index) {
        r.currentIndex = index;
        switch (handle) {
        case 'load':
            this.onload = null;
            this.loaded = true;
            r.load++;
            if (_isFn(s.onload)) {
                s.onload.call(this, r);
            }
            break;
        case 'error':
            r.error++;
            if (_isFn(s.onerror)) {
                s.onerror.call(this, r);
            }
            break;
        case 'abort':
            r.abort++;
            break;
        }
        r.complete++; 
		// oncomplete 事件回调         
		if( _isFn(s.oncomplete) ){ s.oncomplete.call(this, r); }  
		
	}
}
