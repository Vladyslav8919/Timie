const headerBtnContainer = document.querySelector(".header--btn-container");
const addSessionBtn = document.querySelector(".btn--add-session");
const startSessionBtn = document.querySelector(".btn--start-session");
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

headerBtnContainer.addEventListener("click", function (e) {
  const btn = e.target;

  if (!btn.classList.contains("btn")) return;

  if (btn.classList.contains("btn--add-session")) {
    optionStopwatch.classList.remove("hidden");
    btn.classList.add("hidden");
    btn.nextElementSibling.classList.add("hidden");
    addingSession.classList.remove("hidden");
  }
});

let activities = [];
let getTotal = false;
let tags = [];

export { activities, tags };
import { chart } from "/chart.js";
import Chart from "chart.js/auto";
import ChartDataLabels from "chartjs-plugin-datalabels";
Chart.register(ChartDataLabels);

addingSessionForm.addEventListener("submit", function (e) {
  e.preventDefault();

  descriptionFillIn.classList.add("hidden");

  if (activities.length > 0) {
    getTotalBtn.classList.remove("hidden");
    getChartBtn.classList.remove("hidden");
    clearBtn.textContent = "Clear all";
  }

  const formData = Array.from(
    addingSessionForm.querySelectorAll("input")
  ).reduce(
    (acc, input) => ({
      ...acc,
      [input.id]: input.value,
      [input.tag]: input.value,
      id: new Date().getTime(),
    }),
    {}
  );
  console.log(formData);
  activities.push(formData);
  console.log(activities);

  renderActivities();

  // ***** CHART **********
  const chartData = function () {
    tags = activities.map((activity) => activity.tag);
    tags = [...new Set(tags)];
    console.log(tags);

    const time = tags.map((tag) => {
      return activities
        .filter((activity) => activity.tag === tag)
        .reduce(
          (acc, activity) =>
            acc + Number(activity.hrs) * 60 + Number(activity.mins),
          0
        );
    });

    // return tags.map((tag, i) => ({ [tag]: (time[i] / 60).toFixed(2) }));
    return {
      data: time,
      labels: tags,
    };
  };
  console.log(chartData());

  const getChart = function () {
    const ctx = document.querySelector(".chart");
    new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: chartData().labels,
        datasets: [
          {
            label: "# of Tomatoes",
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
              // "#ffa94d",
              // "#a9e34b",
              // "#4dabf7",
              // "#ffd43b",
              // "#ff8787",
              // "#748ffc",
              // "#da77f2",
              // "#69db7c",
              // "#f783ac",
              // "#9775fa",
              // "#38d9a9",
              // "#3bc9db",
            ],
            borderColor: [
              "transparent",
              // "rgba(255,99,132,1)",
              // "rgba(54, 162, 235, 1)",
              // "rgba(255, 206, 86, 1)",
              // "rgba(75, 192, 192, 1)",
            ],
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: false,
        // title: {
        //   display: true,
        //   position: "top",
        //   text: "Doughnut Chart",
        //   fontSize: 18,
        //   fontColor: "#111",
        // },
        // legend: {
        //   display: true,
        //   position: "bottom",
        //   labels: {
        //     fontColor: "#333",
        //     fontSize: 16,
        //   },
        // },
        plugins: {
          legend: {
            display: true,
            position: "bottom",
            labels: {
              fontColor: "#333",
              fontSize: 16,
            },
          },
          // datalabels: {
          //   anchor: "end",
          //   align: "top",
          //   formatter: Math.round,
          //   font: {
          //     weight: "bold",
          //   },
          // },
          datalabels: {
            color: "#777",
          },
        },
      },
    });
  };

  getChartBtn.addEventListener("click", function () {
    descriptionClickStopwatch.classList.add("hidden");
    getChart();
  });

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
          activity.mins > 0 ? activity.mins + "m" : "n/a"
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
  console.log(markup);

  trackerTable.insertAdjacentHTML("beforeend", markup);
};

// ***** STARTING STOPWATCH **********

const stopwatchFace = document.querySelector(".stopwatch-face");
const runStopwatchBtn = document.getElementById("run-stopwatch");
const stopStopwatchBtn = document.getElementById("stop-stopwatch");
const resetStopwatchBtn = document.getElementById("reset-stopwatch");

let hour = 0;
let minute = 0;
let second = 0;
let count = 0;
let timer = false;

runStopwatchBtn.addEventListener("click", function () {
  if (timer) return;
  timer = true;
  stopwatch();
});

stopStopwatchBtn.addEventListener("click", function () {
  timer = false;
});

const hr = document.getElementById("hr");
const min = document.getElementById("min");
const sec = document.getElementById("sec");

resetStopwatchBtn.addEventListener("click", function () {
  timer = false;
  hour = 0;
  minute = 0;
  second = 0;
  count = 0;
  hr.innerHTML = "00";
  min.innerHTML = "00";
  sec.innerHTML = "00";
});

const stopwatch = function () {
  if (timer) {
    count++;

    if (count === 100) {
      second++;
      count = 0;
    }
    if (second === 60) {
      minute++;
      second = 0;
    }
    if (minute === 60) {
      hour++;
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
    setTimeout(stopwatch, 10);
  }
};

const startStopwatch = function () {
  stopwatchSection.classList.remove("hidden");
  // stopwatchFace.textContext = '...'
};

startSessionBtn.addEventListener("click", startStopwatch);
startStopwatchBtn.addEventListener("click", startStopwatch);
