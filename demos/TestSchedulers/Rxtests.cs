using Microsoft.Reactive.Testing;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System;
using System.Reactive.Linq;

namespace TestSchedulers
{
    [TestClass]
    public class RxTests : ReactiveTest
    {
        [TestMethod]
        public void Test_Select_Success()
        {
            var scheduler = new TestScheduler();

            // Create an observable, remember subscribe happens at 200
            var obs = scheduler.CreateHotObservable<string>(
                OnNext(150, "Erik"),
                OnNext(210, "Bart"),
                OnNext(220, "Matthew"),
                OnCompleted<string>(230)
            );

            // Start our virtual time scheduler
            var res = scheduler.Start(() =>
                {
                    return obs.Select(x => x.Length);
                });

            // Check the messages that came through at a specific time
            res.Messages.AssertEqual(
                OnNext(210, 4),
                OnNext(220, 7),
                OnCompleted<int>(230)
            );

            // Check for when subscribe and unsubscribe
            obs.Subscriptions.AssertEqual(
                Subscribe(200, 230)
            );
        }

        [TestMethod]
        public void Test_Window()
        {
            var scheduler = new TestScheduler();

            // Create an observable with lots of data, remember subscribe happens at 200
            var obs = scheduler.CreateHotObservable<int>(
                OnNext(150, 1),
                OnNext(210, 2),
                OnNext(215, 3),
                OnNext(220, 2),
                OnNext(235, 4),
                OnNext(247, 2),
                OnNext(255, 5),
                OnNext(263, 6),
                OnNext(276, 1),
                OnNext(288, 3),
                OnNext(291, 4),
                OnCompleted<int>(300)
            );

            // Let's create rolling windows at every 50 ticks skipping 10 ticks
            var res = scheduler.Start(() =>
            {
                return from w in obs.Window(TimeSpan.FromTicks(50), TimeSpan.FromTicks(10), scheduler)
                       from sum in w.Sum()
                       select sum;
            });

            // Assert that our rolling windows for sums works
            res.Messages.AssertEqual(
                OnNext(250, 13), 
                OnNext(260, 16), 
                OnNext(270, 17), 
                OnNext(280, 18), 
                OnNext(290, 17), 
                OnNext(300, 19), 
                OnNext(300, 14), 
                OnNext(300, 8), 
                OnNext(300, 7), 
                OnNext(300, 4), 
                OnCompleted<int>(300)
            );

            obs.Subscriptions.AssertEqual(
                Subscribe(200, 300)
            );
        }

        [TestMethod]
        public void Test_Where_Error()
        {
            var exception = new Exception();
            var scheduler = new TestScheduler();

            var obs = scheduler.CreateHotObservable<string>(
                OnNext(150, "Erik"),
                OnNext(210, "Bart"),
                OnNext(220, "Matthew"),
                OnError<string>(230, exception)
            );

            var res = scheduler.Start(() =>
            {
                return obs.Where(x => x.Length > 4);
            });

            res.Messages.AssertEqual(
                OnNext(220, "Matthew"),
                OnError<string>(230, exception)
            );

            obs.Subscriptions.AssertEqual(
                Subscribe(200, 230)
            );
        }
    }
}
