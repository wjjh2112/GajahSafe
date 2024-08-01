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
            updateCharts(reports);  // Call the function to update the charts
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
        [startDate, endDate] = dateRange.split(' - ').map(date => new Date(date.split('/').reverse().join('-'))); // Convert DD/MM/YYYY to YYYY-MM-DD
    }

    const rows = document.querySelectorAll('#reportsTableBody tr');

    rows.forEach(row => {
        const rowLocation = row.cells[0].textContent.trim();
        const rowDate = new Date(row.cells[3].textContent.split('/').reverse().join('-')); // Convert DD/MM/YYYY to YYYY-MM-DD
        const locationMatch = location === 'Location' || rowLocation === location;
        const dateMatch = !dateRange || (rowDate >= startDate && rowDate <= endDate);

        if (locationMatch && dateMatch) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

function initializeCharts(reports = []) {
    const weeklyChartCtx = document.getElementById('weekly-chart').getContext('2d');
    const monthlyChartCtx = document.getElementById('monthly-chart').getContext('2d');
    const yearlyChartCtx = document.getElementById('yearly-chart').getContext('2d');

    let currentWeek = getCurrentWeekNumber(new Date());
    let currentMonth = new Date().getMonth();
    let currentWeeklyYear = new Date().getFullYear();
    let currentMonthlyYear = new Date().getFullYear();
    let currentYearlyYear = new Date().getFullYear();

    const tableData = parseTableData(reports); // Parse table data for calculations

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
        const currentYear = new Date().getFullYear();
        if (currentYearlyYear < currentYear) {
            currentYearlyYear += 1;
            updateHeader('yearly-header', `${currentYearlyYear}`);
            updateChart(yearlyChart, calculateYearlyData(currentYearlyYear, tableData), yearlyChart.data.labels);
        }
        updatePrevNextButtons();
    });

    function updatePrevNextButtons() {
        const currentDate = new Date();
        const maxWeek = getCurrentWeekNumber(currentDate);
        const maxMonth = currentDate.getMonth();
        const maxYear = currentDate.getFullYear();

        prevWeekButton.disabled = currentWeeklyYear === 2024 && currentWeek === 1;
        nextWeekButton.disabled = currentWeeklyYear === maxYear && currentWeek === maxWeek;

        prevMonthButton.disabled = currentMonthlyYear === 2024 && currentMonth === 0;
        nextMonthButton.disabled = currentMonthlyYear === maxYear && currentMonth === maxMonth;

        prevYearButton.disabled = currentYearlyYear === 2024;
        nextYearButton.disabled = currentYearlyYear === maxYear;
    }
    updatePrevNextButtons();
}

function createChart(ctx, data, labels) {
    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Total Reports',
                data: data.values,
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 2,
                fill: false
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Total Reports'
                    }
                }
            }
        }
    });
}

function updateChart(chart, data, labels) {
    chart.data.labels = labels;
    chart.data.datasets[0].data = data.values;
    chart.update();
}

function updateHeader(headerId, text) {
    document.getElementById(headerId).textContent = text;
}

function parseTableData(reports) {
    return reports.map(report => {
        return {
            date: new Date(report.reportDateTime),
            count: 1
        };
    });
}

function getCurrentWeekNumber(date) {
    const startOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - startOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);
}

function getWeekRange(week, year) {
    const firstDayOfYear = new Date(year, 0, 1);
    const firstWeekday = firstDayOfYear.getDay() || 7;
    const daysOffset = (week - 1) * 7 - firstWeekday + 1;
    const startOfWeek = new Date(year, 0, daysOffset + 1);
    const endOfWeek = new Date(year, 0, daysOffset + 7);
    return `${startOfWeek.toLocaleDateString()} - ${endOfWeek.toLocaleDateString()}`;
}

function calculateWeeklyData(week, year, data) {
    const weeklyData = [];
    const labels = [];

    for (let i = 0; i < 7; i++) {
        const date = new Date(year, 0, (week - 1) * 7 + i + 1);
        const count = data.filter(report => report.date.toDateString() === date.toDateString()).length;
        weeklyData.push(count);
        labels.push(date.toLocaleDateString());
    }

    return { values: weeklyData, labels: labels };
}

function calculateMonthlyData(month, year, data) {
    const monthlyData = [];
    const labels = [];
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let i = 1; i <= daysInMonth; i++) {
        const date = new Date(year, month, i);
        const count = data.filter(report => report.date.toDateString() === date.toDateString()).length;
        monthlyData.push(count);
        labels.push(date.toLocaleDateString());
    }

    return { values: monthlyData, labels: labels };
}

function calculateYearlyData(year, data) {
    const yearlyData = [];

    for (let month = 0; month < 12; month++) {
        const count = data.filter(report => report.date.getFullYear() === year && report.date.getMonth() === month).length;
        yearlyData.push(count);
    }

    return { values: yearlyData };
}

function getMonthName(monthIndex) {
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return monthNames[monthIndex];
}



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
