import { getChart } from "./chart";

const addingSession = document.querySelector(".adding-session");
const addingSessionForm = document.querySelector(".adding-session-form");
const activityInput = document.getElementById("activity");
const tagInput = document.getElementById("tag");
const hrsInput = document.getElementById("hrs");
const minsInput = document.getElementById("mins");
const addSessionBtn = document.querySelector(".btn--add-session");
const descriptionFillIn = document.querySelector(".description--fill-in");
const getChartBtn = document.querySelector(".btn-get-chart");
const chartContainer = document.querySelector(".chart-container");
const getTotalBtn = document.querySelector(".btn-total");
const clearBtn = document.querySelector(".btn-clear");
const trackerSection = document.querySelector(".tracker");
const trackerTable = document.querySelector(".tracker-table");
const hr = document.getElementById("hr");
const min = document.getElementById("min");
const sec = document.getElementById("sec");
const optionStopwatch = document.querySelector(".option-stopwatch");
const startStopwatchBtn = document.querySelector(".btn-start-stopwatch");
const stopwatchSection = document.querySelector(".stopwatch-section");
const runStopwatchBtn = document.getElementById("run-stopwatch");
const stopStopwatchBtn = document.getElementById("stop-stopwatch");
const resetStopwatchBtn = document.getElementById("reset-stopwatch");

/* Functions */
const addSession = function () {
  optionStopwatch.classList.remove("hidden");
  addSessionBtn.classList.add("hidden");
  addingSession.classList.remove("hidden");

  if (activities.length > 0) {
    revealTracker();
  }
  if (activities.length > 1) {
    revealTrackerBtns();
  }
};

const revealTracker = function () {
  trackerSection.classList.remove("hidden");
  descriptionFillIn.classList.add("hidden");
};
const revealTrackerBtns = function () {
  getTotalBtn.classList.remove("hidden");
  getChartBtn.classList.remove("hidden");
  clearBtn.classList.remove("hidden");
};
const hideTracker = function () {
  trackerTable.innerHTML = "";
  trackerSection.classList.add("hidden");
};
const hideTrackerBtns = function () {
  clearBtn.classList.add("hidden");
  getTotalBtn.classList.add("hidden");
  getChartBtn.classList.add("hidden");
};
const hideTrackerAndBtns = function () {
  hideTracker();
  hideTrackerBtns();
};

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

const chartData = function (activities) {
  tags = activities.map((activity) => activity.tag);
  tags = [...new Set(tags)];

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

const removeChart = function () {
  if (getChart()) getChart().destroy();
  chartContainer.classList.add("hidden");
};

const renderActivities = function (activities) {
  trackerTable.innerHTML = "";

  markup =
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

  getTotalTime(activities);
  trackerTable.insertAdjacentHTML("beforeend", markup);
};

const resetStopwatch = function () {
  ticker.stop();
  hour = 0;
  minute = 0;
  second = 0;
  hr.innerHTML = "00";
  min.innerHTML = "00";
  sec.innerHTML = "00";
};

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

const editActivity = function (id, activities) {
  const editedActivity = activities.find((activity) => {
    return activity.id === +id;
  });
  activityInput.value = editedActivity.activity;
  tagInput.value = editedActivity.tag;
  hrsInput.value = editedActivity.hrs;
  minsInput.value = editedActivity.mins;
  edit = true;
};

const deleteActivity = function (id, activs) {
  activities = activs.filter((activity) => activity.id !== +id);
  renderActivities(activities);

  const setLocalStorage = function () {
    localStorage.clear();
    localStorage.setItem("timie", JSON.stringify(activities));
  };
  setLocalStorage();

  if (activities.length < 2) {
    hideTrackerBtns();
  }
  if (activities.length < 1) {
    hideTrackerAndBtns();
    descriptionFillIn.classList.remove("hidden");
  }
  removeChart();
};

const clearActivities = function () {
  activities = [];
  hideTrackerAndBtns();
  removeChart();
  localStorage.clear();
};

const setLocalStorage = function () {
  localStorage.clear();
  localStorage.setItem("timie", JSON.stringify(activities));
};
const getLocalStorage = function () {
  timieData = JSON.parse(localStorage.getItem("timie"));
  if (timieData) activities = [...timieData];
};

let activities = [];
let tags = [];
let getTotal = false;
let edit = false;
let editID, timieData, markup;

/* Stopwatch */
let hour = 0;
let minute = 0;
let second = 0;

function AdjustingInterval(timerFunc, interval, errorFunc) {
  let that = this;
  let expected, timeout;
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
      if (errorFunc) errorFunc();
    }
    timerFunc();
    expected += that.interval;
    timeout = setTimeout(step, Math.max(0, that.interval - drift));
  }
}

const timer = function () {
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

const throwError = function () {
  console.warn("The drift exceeded the interval.");
};

const ticker = new AdjustingInterval(timer, 1000, throwError);

/* Event listeners */
window.addEventListener("DOMContentLoaded", function () {
  getLocalStorage();
  renderActivities(activities);
});

addSessionBtn.addEventListener("click", addSession);

addingSessionForm.addEventListener("submit", function (e) {
  e.preventDefault();

  if (edit) {
    activities = activities.filter((activity) => activity.id !== +editID);
  }
  if (getChart() != undefined) {
    getChart().destroy();
    chartContainer.classList.add("hidden");
  }
  revealTracker();
  if (activities.length > 0) {
    revealTrackerBtns();
  }

  formData();
  activities.push(formData());
  renderActivities(activities);

  Array.from(addingSessionForm.querySelectorAll("input")).forEach(
    (input) => (input.value = "")
  );

  setLocalStorage();
});

trackerTable.addEventListener("click", function (e) {
  const btn = e.target;

  if (btn.classList.contains("icon--btn")) {
    const id = btn.closest("tr").dataset.id;
    if (btn.classList.contains("edit-btn")) {
      edit = true;
      editID = id;
      editActivity(id, activities);
    }
    if (btn.classList.contains("delete-btn")) {
      deleteActivity(id, activities);
    }
  } else return;
});
getChartBtn.addEventListener("click", function () {
  chartContainer.classList.remove("hidden");
  getChart(chartData(activities).labels, chartData(activities).data);
});
clearBtn.addEventListener("click", clearActivities);
getTotalBtn.addEventListener("click", function () {
  getTotal = true;
  renderActivities(activities);
});
runStopwatchBtn.addEventListener("click", function () {
  ticker.start();
});
stopStopwatchBtn.addEventListener("click", function () {
  ticker.stop();
});
resetStopwatchBtn.addEventListener("click", resetStopwatch);
startStopwatchBtn.addEventListener("click", function () {
  stopwatchSection.classList.remove("hidden");
});
