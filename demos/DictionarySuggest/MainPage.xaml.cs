using System;
using System.Linq;
using System.Net.Http;
using System.Reactive.Linq;
using System.Reactive.Threading.Tasks;
using System.Threading.Tasks;
using Windows.Data.Json;
using Windows.UI.Xaml.Controls;

// The Blank Page item template is documented at http://go.microsoft.com/fwlink/?LinkId=234238

namespace DictionarySuggest
{
    /// <summary>
    /// An empty page that can be used on its own or navigated to within a Frame.
    /// </summary>
    public sealed partial class MainPage : Page
    {
        public MainPage()
        {
            this.InitializeComponent(); 
        }

        protected override void OnNavigatedTo(Windows.UI.Xaml.Navigation.NavigationEventArgs e)
        {
            InitializeDictionarySuggest();
            base.OnNavigatedTo(e);
        }

        // Search wikipedia with a Task<T>
        private async Task<string[]> SearchWikipedia(string text)
        {
            var client = new HttpClient();
            var response = await client.GetStringAsync(
                string.Format(
                    "http://en.wikipedia.org/w/api.php?action=opensearch&format=json&search={0}", 
                    Uri.EscapeUriString(text)
                )
            );

            var parsedResponse = JsonArray.Parse(response);

            return (from value in parsedResponse[1].GetArray() select value.GetString()).ToArray();
        }

        private void InitializeDictionarySuggest()
        {
            // Let's get the search text only when greater than 2 characters
            var searchBoxEventsSuggestionsRequested =
                from e in Observable.FromEventPattern<SearchBoxSuggestionsRequestedEventArgs>(
                    SearchBoxSuggestions, "SuggestionsRequested")
                where e.EventArgs.QueryText.Length > 2
                select new { 
                    e.EventArgs.QueryText, 
                    Deferral = e.EventArgs.Request.GetDeferral(), 
                    e.EventArgs.Request.SearchSuggestionCollection 
                };
            
            // Let's throttle it and make sure the text is unique each time
            var throttled = searchBoxEventsSuggestionsRequested
                .Throttle(TimeSpan.FromSeconds(1))
                .DistinctUntilChanged(e => e.QueryText);

            // Combine tasks and observables
            var queried = (from req in throttled
                           select (from results in SearchWikipedia(req.QueryText).ToObservable() 
                                   select new { 
                                       Results = results, 
                                       req.SearchSuggestionCollection, 
                                       req.Deferral 
                                   }))
                        .Switch()
                        .ObserveOnDispatcher();

            queried.Subscribe(e =>
            {
                e.SearchSuggestionCollection.AppendQuerySuggestions(e.Results);
                e.Deferral.Complete();
            });

            //var eventResults = await queried;
            //eventResults.SearchSuggestionCollection.AppendQuerySuggestions(eventResults.Results);
            //eventResults.Deferral.Complete();

        }



        private void SearchBoxEventsQuerySubmitted(object sender, SearchBoxQuerySubmittedEventArgs e)
        {
            StatusBlock.Text = "Search Result: " + e.QueryText;
        }
    }


}
