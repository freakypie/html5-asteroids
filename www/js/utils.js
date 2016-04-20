
window.requestAnimationFrame = window.requestAnimationFrame 
	|| window.webkitRequestAnimationFrame 
	|| window.mozRequestAnimationFrame    
	|| function (callback) {
		window.setTimeout(callback, 1000 / 60);
    };

/** uses a native alert if on phonegap or will fallback to js alert */
function showAlert(message, opts) {
    if (! opts) {
        opts = {};
    }
    if (navigator.notification) {
        navigator.notification.alert(message, opts.callback || function() {
        }, opts.title || "Parade of Homes", opts.button || "OK");
    } else {
        alert(message);
    }
}

/** uses a native confirm dialog or fallback to js confirm */
function showConfirm(message, opts) {
    if (! opts) {
        opts = {};
    }
    if (navigator.notification) {
        navigator.notification.confirm(message, opts.confirmed, opts.title, opts.buttons);
    } else {
        if (confirm(message)) {
            opts.confirmed(1);
        } else {
            opts.confirmed(2);
        }
    }
}

/** forces the layout to redraw with a css hack */
function refreshLayout() {
    $(".sections").css({webkitTransform: 'scale(1)'});
    $("body").scrollTop($("body").scrollTop());
}

/** renders a nunjuck (django ish) template */
function render(element, context) {
    return nunjucks.renderString($(element).html(), context);   
}

function header(context) {

    if (/login.html$/.test(location.URL) || ! localStorage.token) {
        app.rotater.gotoPage("login.html");
    }
    
    context.id = "n" + Math.floor(Math.random() * 1000);
    $("#header").html(render("#header-template", context));
    
    $("#footer .logo").show();
}

/** get the device type */
_device_type = null;
function getDeviceType() {
    if (! _device_type) {
        if (navigator.userAgent.match(/iPad|iPhone/i)) {
            _device_type = "ios";
        } else if (navigator.userAgent.match(/Android/i)) {
            _device_type = "android";
        } else {        
            _device_type = "desktop";
        }
    }
    return _device_type;
}


function store(key, value) {
    console.log("saving", value, "to", key);
    localStorage[key] = JSON.stringify(value);
}

function fetch(key, default_value) {
    try {
        return JSON.parse(localStorage[key]) || default_value;
    } catch(ex) {
        console.error("error fetching", key, ex)
        return default_value;
    }
}

/** get a param from the url */
function getURLParameter(name) {
    return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.hash)||[,""])[1].replace(/\+/g, '%20')) || null;    
}