const headerBtnContainer = document.querySelector(".header--btn-container");
const addSessionBtn = document.querySelector(".btn--add-session");
// const startSessionBtn = document.querySelector(".btn--start-session");
const startStopwatchBtn = document.querySelector(".btn-start-stopwatch");
const getTotalBtn = document.querySelector(".btn-total");
const clearBtn = document.querySelector(".btn-clear");
const addingSession = document.querySelector(".adding-session");
const addingSessionForm = document.querySelector(".adding-session-form");
const trackerTable = document.querySelector(".tracker-table");
const optionStopwatch = document.querySelector(".option-stopwatch");
const descriptionFillIn = document.querySelector(".description--fill-in");
const descriptionClickStopwatch = document.querySelector(
  ".description--click-stopwatch"
);
const stopwatchSection = document.querySelector(".stopwatch-section");
const getChartBtn = document.querySelector(".btn-get-chart");
const chartContainer = document.querySelector(".chart-container");

headerBtnContainer.addEventListener("click", function (e) {
  const btn = e.target;

  if (!btn.classList.contains("btn")) return;

  if (btn.classList.contains("btn--add-session")) {
    optionStopwatch.classList.remove("hidden");
    btn.classList.add("hidden");
    // btn.nextElementSibling.classList.add("hidden");
    addingSession.classList.remove("hidden");
  }
});

let activities = [];
let getTotal = false;
let tags = [];

// ***** CHART **********
export { activities, tags };
// import { chart } from "/chart.js";
import Chart from "chart.js/auto";
import ChartDataLabels from "chartjs-plugin-datalabels";
Chart.register(ChartDataLabels);

const formData = function () {
  return Array.from(addingSessionForm.querySelectorAll("input")).reduce(
    (acc, input) => ({
      ...acc,
      [input.id]: input.value,
      [input.tag]: input.value,
      id: new Date().getTime(),
    }),
    {}
  );
};

const chartData = function () {
  tags = activities.map((activity) => activity.tag);
  tags = [...new Set(tags)];
  // console.log(tags);

  const time = tags.map((tag) => {
    return activities
      .filter((activity) => activity.tag === tag)
      .reduce(
        (acc, activity) =>
          acc + Number(activity.hrs) * 60 + Number(activity.mins),
        0
      );
  });

  return {
    data: time,
    labels: tags,
  };
};

const getChart = function () {
  chartContainer.classList.remove("hidden");

  const ctx = document.querySelector("#chart").getContext("2d");

  let chartStatus = Chart.getChart("chart");
  if (chartStatus != undefined) {
    chartStatus.destroy();
  }

  chart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: chartData().labels,
      datasets: [
        {
          label: "min",
          data: chartData().data,
          backgroundColor: [
            "#fff",
            "#f8f9fa",
            "#f1f3f5",
            "#e9ecef",
            "#dee2e6",
            "#ced4da",
            "#adb5bd",
            "#868e96",
            "#495057",
          ],
          borderColor: ["transparent"],
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: false,
      plugins: {
        legend: {
          display: true,
          position: "bottom",
          labels: {
            fontColor: "#333",
            fontSize: 16,
          },
        },
        datalabels: {
          color: "#777",
          formatter: (value) =>
            (value % 60 !== 0 ? (value / 60).toPrecision(2) : value / 60) + "h",
        },
      },
    },
  });
};

getChartBtn.addEventListener("click", function () {
  // descriptionClickStopwatch.classList.add("hidden");

  getChart();
});

addingSessionForm.addEventListener("submit", function (e) {
  e.preventDefault();

  descriptionFillIn.classList.add("hidden");

  if (activities.length > 0) {
    getTotalBtn.classList.remove("hidden");
    getChartBtn.classList.remove("hidden");
    clearBtn.textContent = "Clear All";
  }

  formData();

  activities.push(formData());

  renderActivities();

  Array.from(addingSessionForm.querySelectorAll("input")).forEach(
    (input) => (input.value = "")
  );
  clearBtn.classList.remove("hidden");
});

// ***** GET TOTAL TIME **********
getTotalBtn.addEventListener("click", function () {
  getTotal = true;
  renderActivities();
});

// ***** Clear activities **********
const clearActivities = function () {
  activities = [];
  trackerTable.innerHTML = "";
  clearBtn.classList.add("hidden");
  getTotalBtn.classList.add("hidden");
  getChartBtn.classList.add("hidden");
};

clearBtn.addEventListener("click", clearActivities);

// ***** RENDERING ACTIVITIES **********

const renderActivities = function () {
  trackerTable.innerHTML = "";

  let markup =
    `<tr>
       <th>Activity</th>  
       <th>Duration</th>
    </tr>` +
    activities
      .map(
        (activity) => `
            <tr>
               <td>${activity.activity !== "" ? activity.activity : "n/a"}</td>
                <td>${activity.hrs > 0 ? activity.hrs + "h" : ""}${
          activity.mins > 0 ? activity.mins + "m" : ""
        }</td>
            </tr>`
      )
      .join("");

  // **Get total time
  if (getTotal) {
    const totalTimeDecimals = activities.reduce(
      (acc, activity) =>
        acc + Number(activity.hrs) * 60 + Number(activity.mins),
      0
    );

    const totalTimeHrs = Math.trunc(totalTimeDecimals / 60);
    const totalTimeMins = totalTimeDecimals % 60;

    markup += `
    </tr>
      <td>Total Time:</td>
      <td>${(totalTimeDecimals / 60).toFixed(
        2
      )} / ${totalTimeHrs}h${totalTimeMins}m</td>
    </tr>
    `;
    getTotal = false;
  }
  // console.log(markup);

  trackerTable.insertAdjacentHTML("beforeend", markup);
};

// ***** STARTING STOPWATCH **********

const runStopwatchBtn = document.getElementById("run-stopwatch");
const stopStopwatchBtn = document.getElementById("stop-stopwatch");
const resetStopwatchBtn = document.getElementById("reset-stopwatch");

let hour = 0;
let minute = 0;
let second = 0;

const hr = document.getElementById("hr");
const min = document.getElementById("min");
const sec = document.getElementById("sec");

/**
 * Self-adjusting interval to account for drifting
 *
 * @param {function} workFunc  Callback containing the work to be done
 *                             for each interval
 * @param {int}      interval  Interval speed (in milliseconds)
 * @param {function} errorFunc (Optional) Callback to run if the drift
 *                             exceeds interval
 */
function AdjustingInterval(workFunc, interval, errorFunc) {
  var that = this;
  var expected, timeout;
  this.interval = interval;

  this.start = function () {
    if (timeout) return;
    expected = Date.now() + this.interval;
    timeout = setTimeout(step, this.interval);
  };

  this.stop = function () {
    clearTimeout(timeout);
    timeout = false;
  };

  function step() {
    var drift = Date.now() - expected;
    if (drift > that.interval) {
      // You could have some default stuff here too...
      if (errorFunc) errorFunc();
    }
    workFunc();
    expected += that.interval;
    timeout = setTimeout(step, Math.max(0, that.interval - drift));
  }
}

// Define the work to be done
var doWork = function () {
  ++second;

  if (second == 60) {
    ++minute;
    second = 0;
  }

  if (minute == 60) {
    ++hour;
    minute = 0;
    second = 0;
  }

  let hrString = hour;
  let minString = minute;
  let secString = second;

  if (hour < 10) {
    hrString = "0" + hrString;
  }
  if (minute < 10) {
    minString = "0" + minString;
  }
  if (second < 10) {
    secString = "0" + secString;
  }
  hr.textContent = hrString;
  min.textContent = minString;
  sec.textContent = secString;
};

// Define what to do if something goes wrong
var doError = function () {
  console.warn("The drift exceeded the interval.");
};

// (The third argument is optional)
var ticker = new AdjustingInterval(doWork, 1000, doError);

runStopwatchBtn.addEventListener("click", function () {
  ticker.start();
});
stopStopwatchBtn.addEventListener("click", function () {
  ticker.stop();
});
resetStopwatchBtn.addEventListener("click", function () {
  ticker.stop();
  hour = 0;
  minute = 0;
  second = 0;
  millisecond = 0;
  hr.innerHTML = "00";
  min.innerHTML = "00";
  sec.innerHTML = "00";
});

// startSessionBtn.addEventListener("click", function () {
//   stopwatchSection.classList.remove("hidden");
// });
startStopwatchBtn.addEventListener("click", function () {
  stopwatchSection.classList.remove("hidden");
});
