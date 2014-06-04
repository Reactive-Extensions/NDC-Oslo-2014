using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Reactive.Linq;
using System.Reactive.Subjects;
using System.Text;
using System.Threading.Tasks;

namespace Events
{
    class Program
    {
        static void Main(string[] args)
        {
            //RunWithEvents();
            RunWithRx();
        }

        private static void RunWithEvents()
        {
            var person = new EventPerson { Name = "Erik" };

            // Listen for property changes
            person.PropertyChanged += OnPropertyChanged;

            // Change the values
            person.Name = "Bart";
            person.Name = "Matthew";
            person.Name = "Matthew";
            person.Name = "Steve";

            person.PropertyChanged -= OnPropertyChanged;

            person.Name = "Bill";
        }

        private static void OnPropertyChanged(object sender, ChangedEventArgs e)
        {
            Console.WriteLine(e.NewValue);
        }

        private static void RunWithRx()
        {
            var person = new RxPerson { Name = "Erik" };

            // Subscribe to listen to changes
            var subscription = person.PropertyChanged
                .Where(x => x.NewValue.Length > 4)
                .Subscribe(e =>
            {
                Console.WriteLine(e.NewValue);
            });

            // Change the name
            person.Name = "Bart";
            person.Name = "Matthew";
            person.Name = "Matthew";
            person.Name = "Steve";

            subscription.Dispose();

            person.Name = "Bill";
        }
    }

    public class EventPerson
    {
        public event EventHandler<ChangedEventArgs> PropertyChanged;

        private string _name;
        public string Name
        {
            get { return _name; }
            set
            {
                var oldValue = _name;
                _name = value;
                if (PropertyChanged != null)
                    PropertyChanged(this, new ChangedEventArgs { 
                        PropertyName = "Name", 
                        NewValue = value, 
                        OldValue = oldValue 
                    });
            }
        }
    }

    public class ChangedEventArgs : EventArgs
    {
        public string PropertyName { get; set; }
        public string OldValue { get; set; }
        public string NewValue { get; set; }
    }

    public class RxPerson 
    {
        private readonly Subject<ChangedEventArgs> _subject = new Subject<ChangedEventArgs>();

        public IObservable<ChangedEventArgs> PropertyChanged
        {
            get { return _subject; }
        }

        private string _name;
        public string Name
        {
            get { return _name; }
            set 
            {
                var oldValue = _name;
                _name = value;
                _subject.OnNext(new ChangedEventArgs { PropertyName = "Name", NewValue = value, OldValue = oldValue });
            }
        }
    }


}
