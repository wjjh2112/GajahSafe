document.addEventListener('DOMContentLoaded', function() {
    fetchReports();

    document.getElementById('addReportBtn').addEventListener('click', function() {
        window.location.href = '/Add-New-Report';
    });

    // Initialize date range picker
    $('#dateRangePicker').daterangepicker({
        autoUpdateInput: false,
        locale: {
            cancelLabel: 'Clear'
        }
    });

    $('#dateRangePicker').on('apply.daterangepicker', function(ev, picker) {
        $(this).val(picker.startDate.format('DD/MM/YYYY') + ' - ' + picker.endDate.format('DD/MM/YYYY'));
        filterReports();
    });

    $('#dateRangePicker').on('cancel.daterangepicker', function(ev, picker) {
        $(this).val('');
        filterReports();
    });

    $('#locationFilter').change(filterReports);
});

function fetchReports() {
    fetch('/reports')
        .then(response => response.json())
        .then(reports => {
            // Sort reports from newest to oldest
            reports.sort((a, b) => new Date(b.reportDateTime) - new Date(a.reportDateTime));
            displayReports(reports);
        })
        .catch(error => console.error('Error:', error));
}

function displayReports(reports) {
    const tableBody = document.getElementById('reportsTableBody');
    tableBody.innerHTML = '';

    if (reports.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No records found</td></tr>';
        return;
    }

    reports.forEach(report => {
        const row = `
            <tr>
                <td>${report.reportLocation}</td>
                <td>${report.reportEFDamage === 'damaged' ? 'Yes' : 'No'}</td>
                <td>${report.reportCAMDamage === 'damaged' ? 'Yes' : 'No'}</td>
                <td>${new Date(report.reportDateTime).toLocaleDateString()}</td>
                <td>${report.reportingOfficer}</td>
                <td><a href="#" class="view-report-btn" data-report-id="${report.reportID}">View</a></td>
            </tr>
        `;
        tableBody.innerHTML += row;
    });

    addViewEventListeners();
}

function addViewEventListeners() {
    document.querySelectorAll('.view-report-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const reportId = this.getAttribute('data-report-id');
            window.location.href = `/View-Report?reportID=${reportId}`;
        });
    });
}

function filterReports() {
    const location = $('#locationFilter').val();
    const dateRange = $('#dateRangePicker').val();
    let startDate, endDate;

    if (dateRange) {
        [startDate, endDate] = dateRange.split(' - ').map(date => new Date(date));
    }

    const rows = document.querySelectorAll('#reportsTableBody tr');

    rows.forEach(row => {
        const rowLocation = row.cells[0].textContent;
        const rowDate = new Date(row.cells[3].textContent);
        const locationMatch = location === 'Location' || rowLocation === location;
        const dateMatch = !dateRange || (rowDate >= startDate && rowDate <= endDate);

        if (locationMatch && dateMatch) {
            row.style.display = '';
            visibleRows++;
        } else {
            row.style.display = 'none';
        }
    });
}

document.addEventListener('DOMContentLoaded', function () {
    const weeklyChartCtx = document.getElementById('weekly-chart').getContext('2d');
    const monthlyChartCtx = document.getElementById('monthly-chart').getContext('2d');
    const yearlyChartCtx = document.getElementById('yearly-chart').getContext('2d');

    let currentWeek = getCurrentWeekNumber(new Date());
    let currentMonth = new Date().getMonth();
    let currentWeeklyYear = new Date().getFullYear();
    let currentMonthlyYear = new Date().getFullYear();
    let currentYearlyYear = new Date().getFullYear();

    const tableData = parseTableData(); // Parse table data for calculations

    let weeklyData = calculateWeeklyData(currentWeek, currentWeeklyYear, tableData);
    let monthlyData = calculateMonthlyData(currentMonth, currentMonthlyYear, tableData);
    const yearlyData = calculateYearlyData(currentYearlyYear, tableData);

    let weeklyChart = createChart(weeklyChartCtx, weeklyData, weeklyData.labels);
    const monthlyChart = createChart(monthlyChartCtx, monthlyData, monthlyData.labels);
    const yearlyChart = createChart(yearlyChartCtx, yearlyData, ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]);

    updateHeader('weekly-header', `${getWeekRange(currentWeek, currentWeeklyYear)}`);
    updateHeader('monthly-header', `${getMonthName(currentMonth)} ${currentMonthlyYear}`);
    updateHeader('yearly-header', `${currentYearlyYear}`);

    // Previous and Next buttons for weekly chart
    const prevWeekButton = document.getElementById('prev-week');
    const nextWeekButton = document.getElementById('next-week');

    prevWeekButton.addEventListener('click', function () {
        if (currentWeeklyYear > 2024 || (currentWeeklyYear === 2024 && currentWeek > 1)) {
            currentWeek = (currentWeek > 1) ? currentWeek - 1 : 52;
            if (currentWeek === 52) {
                currentWeeklyYear -= 1;
            }
            updateHeader('weekly-header', `${getWeekRange(currentWeek, currentWeeklyYear)}`);
            weeklyData = calculateWeeklyData(currentWeek, currentWeeklyYear, tableData);
            updateChart(weeklyChart, weeklyData, weeklyData.labels);
        }
        updatePrevNextButtons();
    });

    nextWeekButton.addEventListener('click', function () {
        const currentDate = new Date();
        const maxWeek = getCurrentWeekNumber(currentDate);
        if (currentWeeklyYear < currentDate.getFullYear() || (currentWeeklyYear === currentDate.getFullYear() && currentWeek < maxWeek)) {
            currentWeek = (currentWeek < 52) ? currentWeek + 1 : 1;
            if (currentWeek === 1) {
                currentWeeklyYear += 1;
            }
            updateHeader('weekly-header', `${getWeekRange(currentWeek, currentWeeklyYear)}`);
            weeklyData = calculateWeeklyData(currentWeek, currentWeeklyYear, tableData);
            updateChart(weeklyChart, weeklyData, weeklyData.labels);
        }
        updatePrevNextButtons();
    });

    // Previous and Next buttons for monthly chart
    const prevMonthButton = document.getElementById('prev-month');
    const nextMonthButton = document.getElementById('next-month');

    prevMonthButton.addEventListener('click', function () {
        if (currentMonthlyYear > 2024 || (currentMonthlyYear === 2024 && currentMonth > 0)) {
            currentMonth = (currentMonth > 0) ? currentMonth - 1 : 11;
            if (currentMonth === 11) {
                currentMonthlyYear -= 1;
            }
            updateHeader('monthly-header', `${getMonthName(currentMonth)} ${currentMonthlyYear}`);
            monthlyData = calculateMonthlyData(currentMonth, currentMonthlyYear, tableData);
            updateChart(monthlyChart, monthlyData, monthlyData.labels);
        }
        updatePrevNextButtons();
    });

    nextMonthButton.addEventListener('click', function () {
        const currentDate = new Date();
        const maxMonth = currentDate.getMonth();
        if (currentMonthlyYear < currentDate.getFullYear() || (currentMonthlyYear === currentDate.getFullYear() && currentMonth < maxMonth)) {
            currentMonth = (currentMonth < 11) ? currentMonth + 1 : 0;
            if (currentMonth === 0) {
                currentMonthlyYear += 1;
            }
            updateHeader('monthly-header', `${getMonthName(currentMonth)} ${currentMonthlyYear}`);
            monthlyData = calculateMonthlyData(currentMonth, currentMonthlyYear, tableData);
            updateChart(monthlyChart, monthlyData, monthlyData.labels);
        }
        updatePrevNextButtons();
    });

    // Previous and Next buttons for yearly chart
    const prevYearButton = document.getElementById('prev-year');
    const nextYearButton = document.getElementById('next-year');

    prevYearButton.addEventListener('click', function () {
        if (currentYearlyYear > 2024) {
            currentYearlyYear -= 1;
            updateHeader('yearly-header', `${currentYearlyYear}`);
            updateChart(yearlyChart, calculateYearlyData(currentYearlyYear, tableData), yearlyChart.data.labels);
        }
        updatePrevNextButtons();
    });

    nextYearButton.addEventListener('click', function () {
        const currentDate = new Date();
        if (currentYearlyYear < currentDate.getFullYear()) {
            currentYearlyYear += 1;
            updateHeader('yearly-header', `${currentYearlyYear}`);
            updateChart(yearlyChart, calculateYearlyData(currentYearlyYear, tableData), yearlyChart.data.labels);
        }
        updatePrevNextButtons();
    });

    function updatePrevNextButtons() {
        // For weekly chart
        const maxWeeklyDate = new Date();
        maxWeeklyDate.setDate(maxWeeklyDate.getDate() - maxWeeklyDate.getDay()); // Get start of current week
        prevWeekButton.disabled = (currentWeeklyYear <= 2024 && currentWeek <= 1);
        nextWeekButton.disabled = (currentWeeklyYear >= maxWeeklyDate.getFullYear() && currentWeek >= getCurrentWeekNumber(maxWeeklyDate));

        // For monthly chart
        const maxMonthlyDate = new Date();
        prevMonthButton.disabled = (currentMonthlyYear <= 2024 && currentMonth <= 0);
        nextMonthButton.disabled = (currentMonthlyYear >= maxMonthlyDate.getFullYear() && currentMonth >= maxMonthlyDate.getMonth());

        // For yearly chart
        prevYearButton.disabled = (currentYearlyYear <= 2024);
        nextYearButton.disabled = (currentYearlyYear >= maxMonthlyDate.getFullYear());
    }

    function createChart(ctx, data, labels) {
        return new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: "Total of Reports",
                    data: data.shutdown,
                    backgroundColor: 'transparent',
                    borderColor: 'rgba(220,53,69,0.75)',
                    borderWidth: 3,
                    pointStyle: 'circle',
                    pointRadius: 5,
                    pointBorderColor: 'transparent',
                    pointBackgroundColor: 'rgba(220,53,69,0.75)',
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
                            fontFamily: "Poppins",
                            beginAtZero: true,
                            suggestedMin: 0,
                            suggestedMax: 5,
                            stepSize: 1,
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

    function updateChart(chart, data, labels) {
        chart.data.datasets[0].data = data.shutdown;
        chart.data.datasets[1].data = data.pushedPulled;
        chart.data.labels = labels;
        chart.update();
    }

    function updateHeader(id, text) {
        document.getElementById(id).innerText = text;
    }

    function parseTableData() {
        const tableRows = document.querySelectorAll('.table-earning tbody tr');
        let parsedData = [];

        tableRows.forEach(row => {
            const deviceId = row.cells[0].innerText.trim();
            const shutdown = row.cells[1].innerText.trim() === 'Yes' ? 1 : 0;
            const pushedPulled = row.cells[2].innerText.trim() === 'Yes' ? 1 : 0;
            const datetime = new Date(row.cells[3].innerText.trim().replace(/(\d{2})\/(\d{2})\/(\d{4}), (\d{2}):(\d{2}):(\d{2})/, '$3-$2-$1T$4:$5:$6'));

            parsedData.push({
                deviceId: deviceId,
                shutdown: shutdown,
                pushedPulled: pushedPulled,
                datetime: datetime
            });
        });

        return parsedData.filter(item => item.datetime >= new Date(2024, 0, 1) && item.datetime <= new Date());
    }

    function calculateWeeklyData(weekNumber, year, data) {
        let weeklyShutdown = [0, 0, 0, 0, 0, 0, 0];
        let weeklyPushedPulled = [0, 0, 0, 0, 0, 0, 0];
        let labels = [];

        data.forEach(item => {
            if (getCurrentWeekNumber(item.datetime) === weekNumber && item.datetime.getFullYear() === year) {
                const dayOfWeek = item.datetime.getDay();
                weeklyShutdown[dayOfWeek] += item.shutdown;
                weeklyPushedPulled[dayOfWeek] += item.pushedPulled;
            }
        });

        // Generate the dates for the current week
        const firstDayOfYear = new Date(year, 0, 1);
        const daysOffset = firstDayOfYear.getDay();
        const startDate = new Date(year, 0, 1 + (weekNumber - 1) * 7 - daysOffset);
        for (let i = 0; i < 7; i++) {
            let date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            labels.push(date.toLocaleDateString());
        }

        return {
            shutdown: weeklyShutdown,
            pushedPulled: weeklyPushedPulled,
            labels: labels
        };
    }

    function calculateMonthlyData(month, year, data) {
        let monthlyShutdown = [0, 0, 0, 0, 0];
        let monthlyPushedPulled = [0, 0, 0, 0, 0];
        let labels = [];
    
        const daysInMonth = new Date(year, month + 1, 0).getDate(); // Get total days in the month
        const weeksCount = Math.ceil(daysInMonth / 7); // Calculate total full weeks in the month
    
        data.forEach(item => {
            if (item.datetime.getMonth() === month && item.datetime.getFullYear() === year) {
                const dayOfMonth = item.datetime.getDate() - 1; // Zero-based index for days
                const weekIndex = Math.floor(dayOfMonth / 7); // Determine the week index for the day
    
                monthlyShutdown[weekIndex] += item.shutdown;
                monthlyPushedPulled[weekIndex] += item.pushedPulled;
            }
        });
    
        // Generate the date ranges for each week of the month
        for (let week = 0; week < weeksCount; week++) {
            const startDay = week * 7 + 1;
            const endDay = Math.min(startDay + 6, daysInMonth); // Ensure end day does not exceed month days
            const startDate = new Date(year, month, startDay);
            const endDate = new Date(year, month, endDay);
            labels.push(`${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`);
        }
    
        return {
            shutdown: monthlyShutdown,
            pushedPulled: monthlyPushedPulled,
            labels: labels
        };
    }
    

    function calculateYearlyData(year, data) {
        let yearlyShutdown = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        let yearlyPushedPulled = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

        data.forEach(item => {
            if (item.datetime.getFullYear() === year) {
                const monthOfYear = item.datetime.getMonth();
                yearlyShutdown[monthOfYear] += item.shutdown;
                yearlyPushedPulled[monthOfYear] += item.pushedPulled;
            }
        });

        return {
            shutdown: yearlyShutdown,
            pushedPulled: yearlyPushedPulled
        };
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

    // Initialize buttons state
    updatePrevNextButtons();
});



    //pie chart
    var ctx = document.getElementById("pieChart");
    if (ctx) {
      ctx.height = 200;
      var myChart = new Chart(ctx, {
        type: 'pie',
        data: {
          datasets: [{
            data: [45, 25, 20, 10],
            backgroundColor: [
              "rgba(0, 123, 255,0.9)",
              "rgba(0, 123, 255,0.7)",
              "rgba(0, 123, 255,0.5)",
              "rgba(0,0,0,0.07)"
            ],
            hoverBackgroundColor: [
              "rgba(0, 123, 255,0.9)",
              "rgba(0, 123, 255,0.7)",
              "rgba(0, 123, 255,0.5)",
              "rgba(0,0,0,0.07)"
            ]

          }],
          labels: [
            "Green",
            "Green",
            "Green"
          ]
        },
        options: {
          legend: {
            position: 'top',
            labels: {
              fontFamily: 'Poppins'
            }

          },
          responsive: true
        }
      });
    }
