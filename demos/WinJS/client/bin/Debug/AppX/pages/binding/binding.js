(function () {
    "use strict";

    var subscription;
    
    function getNewValue(e) {
        return e.newValue;
    }

    WinJS.UI.Pages.define("/pages/binding/binding.html", {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {

            // Initialize controls
            var bartTable = document.querySelector('#bartTable');
            var mattTable = document.querySelector('#mattTable');
            var sumTable = document.querySelector('#sumTable');
            var bartPlusButton = document.querySelector('#bartButtonPlus1');
            var mattPlusButton = document.querySelector('#mattButtonPlus1');
            var bartLiveButton = document.querySelector('#bartButtonLiving');
            var mattLiveButton = document.querySelector('#mattButtonLiving');
            
            // Set up some timers
            var bartTimer = Rx.Observable.interval(3650);
            var mattTimer = Rx.Observable.interval(3650);

            // Create observable objects and bind
            var bart = WinJS.Binding.as({ name: 'Bart', age: 1 });
            var matt = WinJS.Binding.as({ name: 'Matt', age: 1 });
            var combinedAge = WinJS.Binding.as({ age: matt.age + bart.age });

            WinJS.Binding.processAll(bartTable, bart);
            WinJS.Binding.processAll(mattTable, matt);
            WinJS.Binding.processAll(sumTable, combinedAge);

            var bartObs = bart.toObservable('age').select(getNewValue);
            var mattObs = matt.toObservable('age').select(getNewValue);

            // React to button clicks
            var mattPlus = Rx.Observable.fromEvent(bartPlusButton, 'click').subscribe(function () {
                bart.age++;
            });
            var bartPlus = Rx.Observable.fromEvent(mattPlusButton, 'click').subscribe(function () {
                matt.age++;
            });

            // React to Live Button Presses
            var bartLive = Rx.Observable.fromEvent(bartLiveButton, 'click').take(1).selectMany(function () {
                bartLiveButton.disabled = true;
                return bartTimer;
            }).subscribe(function () {
                bart.age++;
            });
            var mattLive = Rx.Observable.fromEvent(mattLiveButton, 'click').take(1).selectMany(function () {
                mattLiveButton.disabled = true;
                return mattTimer;
            }).subscribe(function () {
                matt.age++;
            });

            // Combine the latest of Matt and Bart's ages
            var updater = bartObs.combineLatest(mattObs, function (age1, age2) {
                return age1 + age2;
            })
            .subscribe(function (age) {
                combinedAge.age = age;
            });

            subscription = new Rx.CompositeDisposable(mattPlus, bartPlus, bartLive, mattLive, updater);
        },

        updateLayout: function (element, viewState, lastViewState) {
            /// <param name="element" domElement="true" />
            /// <param name="viewState" value="Windows.UI.ViewManagement.ApplicationViewState" />
            /// <param name="lastViewState" value="Windows.UI.ViewManagement.ApplicationViewState" />

            // TODO: Respond to changes in viewState.
        },

        unload: function () {
            subscription.dispose();
        }
    });
})();
