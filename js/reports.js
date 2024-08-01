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

document.addEventListener('DOMContentLoaded', function () {
    const weeklyChartCtx = document.getElementById('weekly-chart').getContext('2d');
    const monthlyChartCtx = document.getElementById('monthly-chart').getContext('2d');
    const yearlyChartCtx = document.getElementById('yearly-chart').getContext('2d');

    let currentWeek = getCurrentWeekNumber(new Date());
    let currentMonth = new Date().getMonth();
    let currentWeeklyYear = new Date().getFullYear();
    let currentMonthlyYear = new Date().getFullYear();
    let currentYearlyYear = new Date().getFullYear();

    // Fetch and parse data from MongoDB
    fetchTableData().then(tableData => {
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
                        data: data.total,
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
            chart.data.datasets[0].data = data.total; // Update total data
            chart.data.labels = labels;
            chart.update();
        }    

        function updateHeader(id, text) {
            document.getElementById(id).innerText = text;
        }

    }).catch(err => {
        console.error('Failed to fetch data:', err);
    });
});

function calculateWeeklyData(week, year, tableData) {
    // Extract data for the given week and year
    const weeklyData = {
        total: new Array(7).fill(0),
        labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    };

    tableData.forEach(row => {
        const date = new Date(row.datetime);
        const rowWeek = getCurrentWeekNumber(date);
        const rowYear = date.getFullYear();
        if (rowWeek === week && rowYear === year) {
            weeklyData.total[date.getDay()]++;
        }
    });

    return weeklyData;
}

function calculateMonthlyData(month, year, tableData) {
    const monthlyData = {
        total: [],
        labels: []
    };
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let i = 1; i <= daysInMonth; i++) {
        monthlyData.labels.push(i.toString());
        monthlyData.total.push(0);
    }

    tableData.forEach(row => {
        const date = new Date(row.datetime);
        const rowMonth = date.getMonth();
        const rowYear = date.getFullYear();
        if (rowMonth === month && rowYear === year) {
            monthlyData.total[date.getDate() - 1]++;
        }
    });

    return monthlyData;
}

function calculateYearlyData(year, tableData) {
    const yearlyData = {
        total: new Array(12).fill(0)
    };

    tableData.forEach(row => {
        const date = new Date(row.datetime);
        const rowYear = date.getFullYear();
        if (rowYear === year) {
            yearlyData.total[date.getMonth()]++;
        }
    });

    return yearlyData;
}

function getWeekRange(week, year) {
    const firstDayOfYear = new Date(year, 0, 1);
    const daysOffset = firstDayOfYear.getDay();
    const startOfWeek = new Date(firstDayOfYear.getTime() + (week - 1) * 7 * 24 * 60 * 60 * 1000 - daysOffset * 24 * 60 * 60 * 1000);
    const endOfWeek = new Date(startOfWeek.getTime() + 6 * 24 * 60 * 60 * 1000);
    return `${startOfWeek.getDate()} ${getMonthName(startOfWeek.getMonth())} - ${endOfWeek.getDate()} ${getMonthName(endOfWeek.getMonth())}`;
}

function getMonthName(monthIndex) {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return monthNames[monthIndex];
}

function getCurrentWeekNumber(date) {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

async function fetchTableData() {
    try {
        const response = await fetch('/api/getTableData'); // Your backend endpoint
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Failed to fetch table data:', error);
        throw error;
    }
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
