(function () {

    'use strict';

    var GoldenAngle = 0.381966;

    function baseHueFor(key) {

        if (!this.baseHues[key]) {
            this.baseHues._count += 1;
            var index = this.baseHues._count;
            var angle = index * GoldenAngle;
            var hue = angle - Math.floor(angle);
            this.baseHues[key] = hue;
        }

        return this.baseHues[key];
    }

    function colorFor(key) {
        if (!this.colors[key]) {
            var s = 1.0;
            var l = 0.66;
            var h = this.baseHueFor(key);

            this.colors[key] = translateToCss(h, s, l);
        }

        return this.colors[key];
    }

    function translateToCss(hue, saturation, lightness) {
        return 'hsl(' + (hue * 360) + ',' + saturation * 100 + '%,' + lightness * 100 + '%)';
    }

    WinJS.Namespace.define('Sample', {
        colorProvider: WinJS.Class.define(function () {
            this.baseHues = { _count: 0 };
            this.colors = {};
        }, {
            baseHueFor: baseHueFor,
            forKey: colorFor
        })
    });

})();