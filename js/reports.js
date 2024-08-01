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

document.addEventListener('DOMContentLoaded', function() {
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
    const yearlyChart = createChart(yearlyChartCtx, yearlyData, yearlyData.labels);

    updateHeader('weekly-header', `${getWeekRange(currentWeek, currentWeeklyYear)}`);
    updateHeader('monthly-header', `${getMonthName(currentMonth)} ${currentMonthlyYear}`);
    updateHeader('yearly-header', `${currentYearlyYear}`);

    function updatePrevNextButtons() {
        const maxWeeklyDate = new Date();
        maxWeeklyDate.setDate(maxWeeklyDate.getDate() - maxWeeklyDate.getDay());
        prevWeekButton.disabled = (currentWeeklyYear <= 2024 && currentWeek <= 1);
        nextWeekButton.disabled = (currentWeeklyYear >= maxWeeklyDate.getFullYear() && currentWeek >= getCurrentWeekNumber(maxWeeklyDate));

        const maxMonthlyDate = new Date();
        prevMonthButton.disabled = (currentMonthlyYear <= 2024 && currentMonth <= 0);
        nextMonthButton.disabled = (currentMonthlyYear >= maxMonthlyDate.getFullYear() && currentMonth >= maxMonthlyDate.getMonth());

        prevYearButton.disabled = (currentYearlyYear <= 2024);
        nextYearButton.disabled = (currentYearlyYear >= maxMonthlyDate.getFullYear());
    }

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

    prevYearButton.addEventListener('click', function () {
        if (currentYearlyYear > 2024) {
            currentYearlyYear -= 1;
            updateHeader('yearly-header', `${currentYearlyYear}`);
            const yearlyData = calculateYearlyData(currentYearlyYear, tableData);
            updateChart(yearlyChart, yearlyData, yearlyData.labels);
        }
        updatePrevNextButtons();
    });

    nextYearButton.addEventListener('click', function () {
        const currentDate = new Date();
        if (currentYearlyYear < currentDate.getFullYear()) {
            currentYearlyYear += 1;
            updateHeader('yearly-header', `${currentYearlyYear}`);
            const yearlyData = calculateYearlyData(currentYearlyYear, tableData);
            updateChart(yearlyChart, yearlyData, yearlyData.labels);
        }
        updatePrevNextButtons();
    });
    
    updatePrevNextButtons();
});

    function createChart(ctx, data, labels) {
        return new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: "Total of Reports",
                    data: data.totalReports,
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
                            labelString: 'Number of Reports',
                            fontFamily: "Poppins"
                        },
                        ticks: {
                            fontFamily: "Poppins",
                            beginAtZero: true,
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
        chart.data.datasets[0].data = data.totalReports;
        chart.data.labels = labels;
        chart.update();
    }    

    function updateHeader(id, text) {
        document.getElementById(id).innerText = text;
    }

    function parseTableData() {
        const tableRows = document.querySelectorAll('#reportsTableBody tr');
        let parsedData = [];
        
        tableRows.forEach(row => {
            const location = row.cells[0].innerText.trim();
            const efDamage = row.cells[1].innerText.trim() === 'Yes';
            const camDamage = row.cells[2].innerText.trim() === 'Yes';
            const date = new Date(row.cells[3].innerText.trim().replace(/(\d{2})\/(\d{2})\/(\d{4})/, '$3-$2-$1'));
            const officer = row.cells[4].innerText.trim();
            
            parsedData.push({
                location: location,
                efDamage: efDamage,
                camDamage: camDamage,
                date: date,
                officer: officer
            });
        });
        
        return parsedData.filter(item => item.date >= new Date(2024, 0, 1) && item.date <= new Date());
    }
    

    function calculateWeeklyData(weekNumber, year, data) {
        let weeklyReports = Array(7).fill(0); // Array for each day of the week
        let labels = [];
        
        data.forEach(item => {
            const itemWeek = getCurrentWeekNumber(item.date);
            const itemYear = item.date.getFullYear();
            
            if (itemWeek === weekNumber && itemYear === year) {
                const dayOfWeek = item.date.getDay();
                weeklyReports[dayOfWeek] += 1; // Count reports for each day of the week
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
            totalReports: weeklyReports,
            labels: labels
        };
    }    

    function calculateMonthlyData(month, year, data) {
        let monthlyReports = Array(Math.ceil(new Date(year, month + 1, 0).getDate() / 7)).fill(0); // Array for weeks
        let labels = [];
        
        const daysInMonth = new Date(year, month + 1, 0).getDate();
    
        data.forEach(item => {
            if (item.date.getMonth() === month && item.date.getFullYear() === year) {
                const dayOfMonth = item.date.getDate() - 1; // Zero-based index for days
                const weekIndex = Math.floor(dayOfMonth / 7); // Determine the week index for the day
                monthlyReports[weekIndex] += 1; // Count reports for each week
            }
        });
    
        for (let i = 0; i < monthlyReports.length; i++) {
            labels.push(`Week ${i + 1}`);
        }
        
        return {
            totalReports: monthlyReports,
            labels: labels
        };
    }
    
    function calculateYearlyData(year, data) {
        let yearlyReports = Array(12).fill(0); // Array for each month
        let labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        
        data.forEach(item => {
            if (item.date.getFullYear() === year) {
                const month = item.date.getMonth();
                yearlyReports[month] += 1; // Count reports for each month
            }
        });
        
        return {
            totalReports: yearlyReports,
            labels: labels
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
