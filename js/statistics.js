
// Electric Fence Line Chart
try {
    // Dummy data for demonstration
    document.addEventListener('DOMContentLoaded', function () {
      const weeklyChartCtx = document.getElementById('weekly-chart').getContext('2d');
      const monthlyChartCtx = document.getElementById('monthly-chart').getContext('2d');
      const yearlyChartCtx = document.getElementById('yearly-chart').getContext('2d');

      let currentWeek = getCurrentWeekNumber(new Date());
      let currentMonth = new Date().getMonth();
      let currentYear = new Date().getFullYear();

      const weeklyData = generateDummyData(7);
      const monthlyData = generateDummyData(4);
      const yearlyData = generateDummyData(12);

      const weeklyChart = createChart(weeklyChartCtx, weeklyData, ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]);
      const monthlyChart = createChart(monthlyChartCtx, monthlyData, ["Week 1", "Week 2", "Week 3", "Week 4"]);
      const yearlyChart = createChart(yearlyChartCtx, yearlyData, ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]);

      updateHeader('weekly-header', `${getWeekRange(currentWeek, currentYear)}`);
      updateHeader('monthly-header', `${getMonthName(currentMonth)}`);
      updateHeader('yearly-header', `${currentYear}`);

      document.getElementById('prev-week').addEventListener('click', function () {
          currentWeek = (currentWeek > 1) ? currentWeek - 1 : 52;
          updateHeader('weekly-header', `${getWeekRange(currentWeek, currentYear)}`);
          updateChart(weeklyChart, generateDummyData(7));
      });

      document.getElementById('next-week').addEventListener('click', function () {
          currentWeek = (currentWeek < 52) ? currentWeek + 1 : 1;
          updateHeader('weekly-header', `${getWeekRange(currentWeek, currentYear)}`);
          updateChart(weeklyChart, generateDummyData(7));
      });

      document.getElementById('prev-month').addEventListener('click', function () {
          currentMonth = (currentMonth > 0) ? currentMonth - 1 : 11;
          updateHeader('monthly-header', `${getMonthName(currentMonth)}`);
          updateChart(monthlyChart, generateDummyData(4));
      });

      document.getElementById('next-month').addEventListener('click', function () {
          currentMonth = (currentMonth < 11) ? currentMonth + 1 : 0;
          updateHeader('monthly-header', `${getMonthName(currentMonth)}`);
          updateChart(monthlyChart, generateDummyData(4));
      });

      document.getElementById('prev-year').addEventListener('click', function () {
          currentYear -= 1;
          updateHeader('yearly-header', `${currentYear}`);
          updateChart(yearlyChart, generateDummyData(12));
      });

      document.getElementById('next-year').addEventListener('click', function () {
          currentYear += 1;
          updateHeader('yearly-header', `${currentYear}`);
          updateChart(yearlyChart, generateDummyData(12));
      });

      function createChart(ctx, data, labels) {
          return new Chart(ctx, {
              type: 'line',
              data: {
                  labels: labels,
                  datasets: [{
                      label: "Total Electricity Shutdown",
                      data: data,
                      backgroundColor: 'transparent',
                      borderColor: 'rgba(220,53,69,0.75)',
                      borderWidth: 3,
                      pointStyle: 'circle',
                      pointRadius: 5,
                      pointBorderColor: 'transparent',
                      pointBackgroundColor: 'rgba(220,53,69,0.75)',
                  }, {
                      label: "Total Pushed/Pulled",
                      data: data.map(() => Math.floor(Math.random() * 100)),
                      backgroundColor: 'transparent',
                      borderColor: 'rgba(40,167,69,0.75)',
                      borderWidth: 3,
                      pointStyle: 'circle',
                      pointRadius: 5,
                      pointBorderColor: 'transparent',
                      pointBackgroundColor: 'rgba(40,167,69,0.75)',
                  }]
              },
              options: {
                  responsive: true,
                  tooltips: {
                      mode: 'index',
                      titleFontSize: 12,
                      titleFontColor: '#000',
                      bodyFontColor: '#000',
                      backgroundColor: '#fff',
                      titleFontFamily: 'Poppins',
                      bodyFontFamily: 'Poppins',
                      cornerRadius: 3,
                      intersect: false,
                  },
                  legend: {
                      display: false,
                      labels: {
                          usePointStyle: true,
                          fontFamily: 'Poppins',
                      },
                  },
                  scales: {
                      xAxes: [{
                          display: true,
                          gridLines: {
                              display: false,
                              drawBorder: false
                          },
                          scaleLabel: {
                              display: false,
                              labelString: 'Time'
                          },
                          ticks: {
                              fontFamily: "Poppins"
                          }
                      }],
                      yAxes: [{
                          display: true,
                          gridLines: {
                              display: false,
                              drawBorder: false
                          },
                          scaleLabel: {
                              display: true,
                              labelString: 'Value',
                              fontFamily: "Poppins"
                          },
                          ticks: {
                              fontFamily: "Poppins"
                          }
                      }]
                  },
                  title: {
                      display: false,
                      text: 'Normal Legend'
                  }
              }
          });
      }

      function updateChart(chart, data) {
          chart.data.datasets[0].data = data;
          chart.data.datasets[1].data = data.map(() => Math.floor(Math.random() * 100));
          chart.update();
      }

      function updateHeader(id, text) {
          document.getElementById(id).innerText = text;
      }

      function generateDummyData(points) {
          return Array.from({ length: points }, () => Math.floor(Math.random() * 100));
      }

      function getWeekRange(weekNumber, year) {
          const firstDayOfYear = new Date(year, 0, 1);
          const daysOffset = firstDayOfYear.getDay();
          const startDate = new Date(year, 0, 1 + (weekNumber - 1) * 7 - daysOffset);
          const endDate = new Date(startDate);
          endDate.setDate(endDate.getDate() + 6);
          return `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
      }

      function getMonthName(monthIndex) {
          const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
          return monthNames[monthIndex];
      }

      function getCurrentWeekNumber(d) {
          const firstDayOfYear = new Date(d.getFullYear(), 0, 1);
          const pastDaysOfYear = (d - firstDayOfYear) / 86400000;
          return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
      }
  });
  
} catch (error) {
    console.log(error);
}