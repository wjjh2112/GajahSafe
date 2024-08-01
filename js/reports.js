document.addEventListener('DOMContentLoaded', function () {
    fetchReports();

    document.getElementById('addReportBtn').addEventListener('click', function () {
        window.location.href = '/Add-New-Report';
    });

    // Initialize date range picker
    $('#dateRangePicker').daterangepicker({
        autoUpdateInput: false,
        locale: {
            cancelLabel: 'Clear'
        }
    });

    $('#dateRangePicker').on('apply.daterangepicker', function (ev, picker) {
        $(this).val(picker.startDate.format('DD/MM/YYYY') + ' - ' + picker.endDate.format('DD/MM/YYYY'));
        filterReports();
    });

    $('#dateRangePicker').on('cancel.daterangepicker', function (ev, picker) {
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
            initCharts(reports);
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
        btn.addEventListener('click', function (e) {
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

function initCharts(reports) {
    const weeklyChartCtx = document.getElementById('weekly-chart').getContext('2d');
    const monthlyChartCtx = document.getElementById('monthly-chart').getContext('2d');
    const yearlyChartCtx = document.getElementById('yearly-chart').getContext('2d');

    let currentWeek = getCurrentWeekNumber(new Date());
    let currentMonth = new Date().getMonth();
    let currentWeeklyYear = new Date().getFullYear();
    let currentMonthlyYear = new Date().getFullYear();
    let currentYearlyYear = new Date().getFullYear();

    const tableData = parseTableData(reports);

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
            const newYearlyData = calculateYearlyData(currentYearlyYear, tableData);
            updateChart(yearlyChart, newYearlyData, ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]);
        }
        updatePrevNextButtons();
    });

    nextYearButton.addEventListener('click', function () {
        const currentDate = new Date();
        const maxYear = currentDate.getFullYear();
        if (currentYearlyYear < maxYear) {
            currentYearlyYear += 1;
            updateHeader('yearly-header', `${currentYearlyYear}`);
            const newYearlyData = calculateYearlyData(currentYearlyYear, tableData);
            updateChart(yearlyChart, newYearlyData, ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]);
        }
        updatePrevNextButtons();
    });

    function updatePrevNextButtons() {
        // Update button states
        const currentDate = new Date();
        const maxWeek = getCurrentWeekNumber(currentDate);
        const maxMonth = currentDate.getMonth();
        const maxYear = currentDate.getFullYear();

        prevWeekButton.disabled = (currentWeeklyYear === 2024 && currentWeek === 1);
        nextWeekButton.disabled = (currentWeeklyYear === maxYear && currentWeek === maxWeek);

        prevMonthButton.disabled = (currentMonthlyYear === 2024 && currentMonth === 0);
        nextMonthButton.disabled = (currentMonthlyYear === maxYear && currentMonth === maxMonth);

        prevYearButton.disabled = (currentYearlyYear === 2024);
        nextYearButton.disabled = (currentYearlyYear === maxYear);
    }

    updatePrevNextButtons();
}

function parseTableData(reports) {
    const data = reports.map(report => ({
        dateTime: new Date(report.reportDateTime)
    }));
    return data;
}

function calculateWeeklyData(week, year, tableData) {
    const data = [];
    const startDate = getDateOfISOWeek(week, year);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);

    for (let i = 0; i < 7; i++) {
        const day = new Date(startDate);
        day.setDate(startDate.getDate() + i);
        const dailyCount = tableData.filter(d => d.dateTime >= day && d.dateTime < new Date(day).setDate(day.getDate() + 1)).length;
        data.push(dailyCount);
    }

    return {
        labels: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        data: data
    };
}

function calculateMonthlyData(month, year, tableData) {
    const data = [];
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let i = 1; i <= daysInMonth; i++) {
        const day = new Date(year, month, i);
        const dailyCount = tableData.filter(d => d.dateTime >= day && d.dateTime < new Date(day).setDate(day.getDate() + 1)).length;
        data.push(dailyCount);
    }

    return {
        labels: Array.from({ length: daysInMonth }, (_, i) => (i + 1).toString()),
        data: data
    };
}

function calculateYearlyData(year, tableData) {
    const data = [];

    for (let month = 0; month < 12; month++) {
        const monthStart = new Date(year, month, 1);
        const monthEnd = new Date(year, month + 1, 0);
        const monthlyCount = tableData.filter(d => d.dateTime >= monthStart && d.dateTime <= monthEnd).length;
        data.push(monthlyCount);
    }

    return data;
}

function createChart(ctx, data, labels) {
    return new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Number of Reports',
                data: data.data,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function updateChart(chart, data, labels) {
    chart.data.labels = labels;
    chart.data.datasets[0].data = data.data;
    chart.update();
}

function updateHeader(headerId, text) {
    document.getElementById(headerId).textContent = text;
}

function getWeekRange(week, year) {
    const startDate = getDateOfISOWeek(week, year);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    return `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
}

function getMonthName(month) {
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return monthNames[month];
}

function getCurrentWeekNumber(date) {
    const oneJan = new Date(date.getFullYear(), 0, 1);
    const numberOfDays = Math.floor((date - oneJan) / (24 * 60 * 60 * 1000));
    return Math.ceil((date.getDay() + 1 + numberOfDays) / 7);
}

function getDateOfISOWeek(week, year) {
    const simple = new Date(year, 0, 1 + (week - 1) * 7);
    const dayOfWeek = simple.getDay();
    const ISOweekStart = simple;
    if (dayOfWeek <= 4) {
        ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
    } else {
        ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
    }
    return ISOweekStart;
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
