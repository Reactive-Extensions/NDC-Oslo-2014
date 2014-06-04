(function () {
    'use strict';

    var navigate = WinJS.Navigation.navigate,
        animation = WinJS.UI.Animation;

    var menu = [
    {
        name: 'Drag and Drop',
        page: 'dragndrop'
    },
    {
        name: 'Image Crop',
        page: 'crop'
    },
    {
        name: 'AutoComplete',
        page: 'autocomplete'
    },
    {
        name: 'Stocks',
        page: 'stocks'
    },
    //{
    //    name: 'Binding',
    //    page: 'binding'
    //},
    {
        name: 'Alphabet Invasion',
        page: 'alphabetinvasion'
    },
    {
        name: 'Time Files Like An Arrow',
        page: 'timeflies'
    }
    //{
    //    name: 'Sensors',
    //    page: 'sensors'
    //}
    ];


    function gotoPage(args) {
        args.detail.itemPromise.then(function (item) {
            var id = item.data.page;
            navigate('/pages/' + id + '/' + id + '.html'); 
        });
    }

    WinJS.UI.Pages.define('/pages/hub/hub.html', {

        ready: function (element, options) {
            var listView = document.querySelector('[data-win-control="WinJS.UI.ListView"]').winControl;
            listView.itemDataSource = new WinJS.Binding.List(menu).dataSource;
            listView.addEventListener('iteminvoked', gotoPage);

            animation.enterPage(document.querySelectorAll('header,section'));
        },

        updateLayout: function (element, viewState, lastViewState) {
            /// <param name='element' domElement='true' />
            /// <param name='viewState' value='Windows.UI.ViewManagement.ApplicationViewState' />
            /// <param name='lastViewState' value='Windows.UI.ViewManagement.ApplicationViewState' />

            // TODO: Respond to changes in viewState.
        },

        unload: function () {
            // TODO: Respond to navigations away from this page.
        }
    });
})();
