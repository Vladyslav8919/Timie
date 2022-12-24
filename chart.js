import Chart from "chart.js/auto";
import ChartDataLabels from "chartjs-plugin-datalabels";
Chart.register(ChartDataLabels);

export const getChart = function (labels, data) {
  const ctx = document.querySelector("#chart").getContext("2d");

  let chartStatus = Chart.getChart("chart");

  if (chartStatus != undefined) {
    chartStatus.destroy();
  }

  let chart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: labels,
      datasets: [
        {
          label: "min",
          data: data,
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
  return chartStatus;
};
