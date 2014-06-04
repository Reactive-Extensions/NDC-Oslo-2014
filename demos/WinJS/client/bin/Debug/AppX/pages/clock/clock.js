/// <reference path="/rxjs/rx.js" />
/// <reference path="/rxjs/rx.time.js" />
/// <reference path="/rxjs/reactivewinjs.js" />
(function () {
    "use strict";

    var timeConverter = WinJS.Binding.converter(function(date) {
        var currentDate = new Date(date),
            hours = currentDate.getHours(),
            minutes = currentDate.getMinutes(),
            seconds = currentDate.getSeconds();
        
        if (hours < 10) hours = '0' + hours;
        if (minutes < 10) minutes = '0' + minutes;
        if (seconds < 10) seconds = '0' + seconds;

        return hours + ':' + minutes + ':' + seconds;
    });

    WinJS.Namespace.define('WinJSClock.Converters', {
       timeConverter: timeConverter 
    });

    // Canvas
    var canvas, context;
    var backgroundCanvas, backgroundContext;
    
    // Defaults
    var displayRadius = 85;
    var renderRadius = 100;
    var scale = displayRadius / renderRadius;
    
    // Settings
    var outerborder = { lineWidth: 4, radius: 97, color: "red", alpha: 1 };
    var smallTick = { lineWidth: 4, startAt: 89, endAt: 93, color: "red", alpha: 1 };
    var largeTick = { lineWidth: 8, startAt: 80, endAt: 93, color: "red", alpha: 1 };
    var hourHand = { lineWidth: 12, startAt: -15, endAt: 60, color: "red", alpha: 1 };
    var minuteHand = { lineWidth: 10, startAt: -15, endAt: 85, color: "red", alpha: 1 };
    var secondHand = { lineWidth: 4, startAt: -20, endAt: 85, color: "white", alpha: 1 };
    
    function render() {
        Rx.Observable.interval(100).timestamp().subscribe(function (x) {
            
            context.clearRect(0, 0, renderRadius * 2, renderRadius * 2);
            context.drawImage(backgroundCanvas, 0, 0);

            var date = new Date(x.timestamp);
            var hour = date.getHours(), min = date.getMinutes(), sec = date.getSeconds();
            var hourA = (hour % 12) * 5 + min / 12.0,
		        minA = min + sec / 60.0,
		        secA = sec;

            renderRadialLineAtAngle(context, tickAngle(hourA), hourHand);
            renderRadialLineAtAngle(context, tickAngle(minA), minuteHand);
            renderRadialLineAtAngle(context, tickAngle(secA), secondHand);
        });
    }
    
    function renderRadialLineAtAngle(ctx, angleFraction, options) {
        ctx.save();
        ctx.translate(renderRadius, renderRadius);
        ctx.rotate(Math.PI * (2.0 * angleFraction - 0.5));
        ctx.globalAlpha = options.alpha;
        ctx.strokeStyle = options.color;
        ctx.lineWidth = options.lineWidth;
        ctx.lineWidth = context.lineWidth * scale;
        
        if (options.radius) {
            renderCircle(ctx, options.startAt, 0, options);
        }  else {
            ctx.beginPath();
            ctx.moveTo(options.startAt, 0);
            ctx.lineTo(options.endAt, 0);
            ctx.stroke();
        }
        ctx.restore();
        
    }
    
    function tickAngle(second) {
        return second / 60.0;
    }
    
    function renderCircle(ctx, x, y, options) {
        ctx.save();
        ctx.globalAlpha = options.alpha;
        ctx.lineWidth = options.lineWidth;

        ctx.beginPath();
        ctx.lineWidth = context.lineWidth * scale;
        ctx.arc(x, y, options.radius, 0, 2 * Math.PI, false);
        ctx.arc(x, y, options.radius, -0.1, 0.1, false);
        
        if (options.fillColor) {
            ctx.fillStyle = options.fillColor;
            ctx.fill();
        } else {
            ctx.strokeStyle = options.color;
            ctx.stroke();
        }
    }
    
    function renderBackground() {
        // Initial canvas
        renderCircle(backgroundContext, renderRadius, renderRadius, outerborder);

        // Draw the tick marks. Every 5th one is a big one
        for (var i = 0; i < 60; i++) {
            if (i % 5) {
                renderRadialLineAtAngle(backgroundContext, tickAngle(i), smallTick);
            } else {
                renderRadialLineAtAngle(backgroundContext, tickAngle(i), largeTick);
            }
        }
    }

    function initialize() {
        // Get canvas
        canvas = document.querySelector('#clock');
        context = canvas.getContext('2d');

        // Set canvas attributes
        canvas.setAttribute("width", 300);   
        canvas.setAttribute("height", 300);
        canvas.style.width = 300 + "px";
        canvas.style.height = 300 + "px";

        backgroundCanvas = document.createElement('canvas');
        backgroundContext = backgroundCanvas.getContext('2d');

        // Set canvas attributes        
        backgroundCanvas.setAttribute("width", 300);
        backgroundCanvas.setAttribute("height", 300);
        backgroundCanvas.style.width = 300 + "px";
        backgroundCanvas.style.height = 300 + "px";

        renderBackground();
        render();
    }

    var subscription;

    WinJS.UI.Pages.define("/pages/clock/clock.html", {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {

            initialize();

            var clock = WinJS.Binding.as({
                currentTime: new Date().getTime()  
            });
            
            WinJS.Binding.processAll(null, clock);

            subscription = Rx.Observable.interval(100).timestamp().subscribe(function(ts) {
                clock.currentTime = ts.timestamp;
                f.currentTime = ts.timestamp;
            });
        },

        updateLayout: function (element, viewState, lastViewState) {
            /// <param name="element" domElement="true" />
            /// <param name="viewState" value="Windows.UI.ViewManagement.ApplicationViewState" />
            /// <param name="lastViewState" value="Windows.UI.ViewManagement.ApplicationViewState" />

        },

        unload: function () {
            subscription.dispose();
        }
    });
})();
