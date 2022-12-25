const headerBtnContainer = document.querySelector(".header--btn-container");
const addSessionBtn = document.querySelector(".btn--add-session");
const startStopwatchBtn = document.querySelector(".btn-start-stopwatch");
const getTotalBtn = document.querySelector(".btn-total");
const clearBtn = document.querySelector(".btn-clear");
const addingSession = document.querySelector(".adding-session");
const addingSessionForm = document.querySelector(".adding-session-form");
const trackerSection = document.querySelector(".tracker");
const trackerTable = document.querySelector(".tracker-table");
const optionStopwatch = document.querySelector(".option-stopwatch");
const descriptionFillIn = document.querySelector(".description--fill-in");
const stopwatchSection = document.querySelector(".stopwatch-section");
const getChartBtn = document.querySelector(".btn-get-chart");
const chartContainer = document.querySelector(".chart-container");
const editBtn = document.querySelector(".edit-btn");

//////////////////////////////////////////////

let activities = [];
let getTotal = false;
let edit = false;
let editID;
let tags = [];
let timieData;

const getLocalStorage = function () {
  timieData = JSON.parse(localStorage.getItem("timie"));
  if (timieData) activities = [...timieData];

  console.log(timieData);
};

addSessionBtn.addEventListener("click", function () {
  optionStopwatch.classList.remove("hidden");
  addSessionBtn.classList.add("hidden");
  addingSession.classList.remove("hidden");

  if (activities.length > 0) {
    clearBtn.classList.remove("hidden");
    trackerSection.classList.remove("hidden");
    descriptionFillIn.classList.add("hidden");
    getTotalBtn.classList.remove("hidden");
    getChartBtn.classList.remove("hidden");
    clearBtn.textContent = "Clear All";
  }
});

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
// ***** CHART **********

import { getChart } from "./chart";

const chartData = function (activities) {
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

  // timieData.push(tags, time);

  return {
    data: time,
    labels: tags,
  };
};

getChartBtn.addEventListener("click", function () {
  chartContainer.classList.remove("hidden");
  // getChart();
  getChart(chartData(activities).labels, chartData(activities).data);
});

addingSessionForm.addEventListener("submit", function (e) {
  e.preventDefault();

  if (edit) {
    activities = activities.filter((activity) => activity.id !== +editID);
  }

  if (getChart() != undefined) {
    getChart().destroy();
    chartContainer.classList.add("hidden");
  }

  trackerSection.classList.remove("hidden");
  descriptionFillIn.classList.add("hidden");

  if (activities.length > 0) {
    getTotalBtn.classList.remove("hidden");
    getChartBtn.classList.remove("hidden");
    clearBtn.textContent = "Clear All";
  }

  formData();

  activities.push(formData());
  renderActivities(activities);

  Array.from(addingSessionForm.querySelectorAll("input")).forEach(
    (input) => (input.value = "")
  );

  const setLocalStorage = function () {
    localStorage.clear();
    localStorage.setItem("timie", JSON.stringify(activities));
  };
  if (activities) setLocalStorage();

  clearBtn.classList.remove("hidden");
});

// ***** GET TOTAL TIME **********
getTotalBtn.addEventListener("click", function () {
  getTotal = true;
  renderActivities(activities);
});

// ***** CLEAR ACTIVITIES **********
const clearActivities = function () {
  activities = [];
  trackerSection.classList.add("hidden");
  trackerTable.innerHTML = "";
  clearBtn.classList.add("hidden");
  getTotalBtn.classList.add("hidden");
  getChartBtn.classList.add("hidden");

  if (getChart()) getChart().destroy();
  chartContainer.classList.add("hidden");
  localStorage.clear();
};

clearBtn.addEventListener("click", clearActivities);

// **** EDIT ACTIVITY *********
const editActivity = function (id, activities) {
  const editedActivity = activities.find((activity) => {
    return activity.id === +id;
  });
  // console.log(editedActivity);
  document.getElementById("activity").value = editedActivity.activity;
  document.getElementById("tag").value = editedActivity.tag;
  document.getElementById("hrs").value = editedActivity.hrs;
  document.getElementById("mins").value = editedActivity.mins;
  edit = true;
};

// **** Delete ACTIVITY *********
const deleteActivity = function (id, activs) {
  activities = activs.filter((activity) => activity.id !== +id);
  renderActivities(activities);

  const setLocalStorage = function () {
    localStorage.clear();
    localStorage.setItem("timie", JSON.stringify(activities));
  };
  setLocalStorage();

  if (activities.length === 1) clearBtn.textContent = "Clear";

  if (activities.length === 0) {
    trackerSection.classList.add("hidden");
    descriptionFillIn.classList.remove("hidden");
    trackerTable.innerHTML = "";
    clearBtn.classList.add("hidden");
    getTotalBtn.classList.add("hidden");
    getChartBtn.classList.add("hidden");
  }

  if (getChart()) getChart().destroy();
  chartContainer.classList.add("hidden");
};

// ***** RENDERING ACTIVITIES **********

const renderActivities = function (activities) {
  trackerTable.innerHTML = "";

  let markup =
    `<tr>
       <th>Activity</th>  
       <th>Duration</th>
    </tr>` +
    activities
      .map(
        (activity) => `
            <tr data-id=${activity.id}>
               <td>${activity.activity ? activity.activity : "n/a"}</td>
                <td>${activity.hrs > 0 ? activity.hrs + "h" : ""}${
          activity.mins > 0 ? activity.mins + "m" : ""
        }${
          !activity.hrs && !activity.mins ? "n/a" : ""
        }<span class="icon--btn edit-btn">✎</span><span class="icon--btn delete-btn">🗑</span></td>
           </tr>`
      )
      .join("");

  // **Get total time
  const getTotalTime = function (activities) {
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
  };
  getTotalTime(activities);

  trackerTable.insertAdjacentHTML("beforeend", markup);
};

// ***** STOPWATCH **********

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
  hr.innerHTML = "00";
  min.innerHTML = "00";
  sec.innerHTML = "00";
});

startStopwatchBtn.addEventListener("click", function () {
  stopwatchSection.classList.remove("hidden");
});

// ***** EDIT & DELETE**********
document
  .querySelector(".tracker-table")
  .addEventListener("click", function (e) {
    const btn = e.target;

    if (btn.classList.contains("icon--btn")) {
      const id = btn.closest("tr").dataset.id;

      // Edit
      if (btn.classList.contains("edit-btn")) {
        edit = true;
        editID = id;
        editActivity(id, activities);
      }

      // Delete
      if (btn.classList.contains("delete-btn")) {
        deleteActivity(id, activities);
        // edit = true
        // editID = id;
      }
    } else return;
  });

// ***** LOCAL STORAGE **********
window.addEventListener("DOMContentLoaded", function () {
  getLocalStorage();
  renderActivities(activities);
});
