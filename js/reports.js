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


// Line Graph
document.addEventListener('DOMContentLoaded', function() {
    const weeklyChartCtx = document.getElementById('weekly-chart').getContext('2d');
    const monthlyChartCtx = document.getElementById('monthly-chart').getContext('2d');
    const yearlyChartCtx = document.getElementById('yearly-chart').getContext('2d');
    
    let weeklyChart, monthlyChart, yearlyChart;
    let currentWeek = new Date();
    let currentMonth = new Date();
    let currentYear = new Date().getFullYear();

    document.getElementById('prev-week').addEventListener('click', () => navigateWeek(-1));
    document.getElementById('next-week').addEventListener('click', () => navigateWeek(1));
    document.getElementById('prev-month').addEventListener('click', () => navigateMonth(-1));
    document.getElementById('next-month').addEventListener('click', () => navigateMonth(1));
    document.getElementById('prev-year').addEventListener('click', () => navigateYear(-1));
    document.getElementById('next-year').addEventListener('click', () => navigateYear(1));

    fetchReports().then(reports => {
        displayWeeklyChart(reports);
        displayMonthlyChart(reports);
        displayYearlyChart(reports);
    });

    function fetchReports() {
        return fetch('/reports')
            .then(response => response.json())
            .then(reports => {
                reports.sort((a, b) => new Date(a.reportDateTime) - new Date(b.reportDateTime));
                return reports;
            })
            .catch(error => console.error('Error:', error));
    }

    function displayWeeklyChart(reports) {
        const weekStart = new Date(currentWeek);
        weekStart.setDate(currentWeek.getDate() - currentWeek.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);

        const weeklyData = [];
        for (let date = new Date(weekStart); date <= weekEnd; date.setDate(date.getDate() + 1)) {
            const count = reports.filter(report => new Date(report.reportDateTime).toDateString() === date.toDateString()).length;
            weeklyData.push({ date: new Date(date), count });
        }

        if (weeklyChart) {
            weeklyChart.destroy();
        }

        weeklyChart = new Chart(weeklyChartCtx, {
            type: 'line',
            data: {
                labels: weeklyData.map(d => d.date.toLocaleDateString()),
                datasets: [{
                    label: 'Total of Reports',
                    backgroundColor: 'transparent',
                    borderColor: 'rgba(220,53,69,0.75)',
                    borderWidth: 3,
                    pointStyle: 'circle',
                    pointRadius: 5,
                    pointBorderColor: 'transparent',
                    pointBackgroundColor: 'rgba(220,53,69,0.75)',
                    data: weeklyData.map(d => d.count)
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
                            labelString: 'Date'
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
                }
            }
        });

        document.getElementById('weekly-header').textContent = `${weekStart.toLocaleDateString()} - ${weekEnd.toLocaleDateString()}`;
    }

    function displayMonthlyChart(reports) {
        const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
        const nextMonthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
    
        const monthlyData = [];
        for (let date = new Date(monthStart); date < nextMonthStart; date.setDate(date.getDate() + 1)) {
            const endDate = new Date(date);
            endDate.setDate(endDate.getDate() + 6);
            if (endDate >= nextMonthStart) {
                endDate.setDate(nextMonthStart.getDate() - 1);
            }
    
            const count = reports.filter(report => {
                const reportDate = new Date(report.reportDateTime);
                return reportDate >= date && reportDate <= endDate;
            }).length;
    
            monthlyData.push({ startDate: new Date(date), endDate: new Date(endDate), count });
            date.setDate(endDate.getDate());
        }
    
        if (monthlyChart) {
            monthlyChart.destroy();
        }

        monthlyChart = new Chart(monthlyChartCtx, {
            type: 'line',
            data: {
                labels: monthlyData.map(d => `${d.startDate.toLocaleDateString()} - ${d.endDate.toLocaleDateString()}`),
                datasets: [{
                    label: 'Total of Reports',
                    backgroundColor: 'transparent',
                    borderColor: 'rgba(220,53,69,0.75)',
                    borderWidth: 3,
                    pointStyle: 'circle',
                    pointRadius: 5,
                    pointBorderColor: 'transparent',
                    pointBackgroundColor: 'rgba(220,53,69,0.75)',
                    data: monthlyData.map(d => d.count)
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
                            labelString: 'Date'
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
                }
            }
        });

        document.getElementById('monthly-header').textContent = `${monthStart.toLocaleDateString('default', { month: 'long' })} ${monthStart.getFullYear()}`;
    }

    function displayYearlyChart(reports) {
        const yearlyData = [];
        for (let month = 0; month < 12; month++) {
            const monthStart = new Date(currentYear, month, 1);
            const monthEnd = new Date(currentYear, month + 1, 0);

            const count = reports.filter(report => {
                const reportDate = new Date(report.reportDateTime);
                return reportDate >= monthStart && reportDate <= monthEnd;
            }).length;

            yearlyData.push({ month: monthStart.toLocaleString('default', { month: 'long' }), count });
        }

        if (yearlyChart) {
            yearlyChart.destroy();
        }

        yearlyChart = new Chart(yearlyChartCtx, {
            type: 'line',
            data: {
                labels: yearlyData.map(d => d.month),
                datasets: [{
                    label: 'Total of Reports',
                    backgroundColor: 'transparent',
                    borderColor: 'rgba(220,53,69,0.75)',
                    borderWidth: 3,
                    pointStyle: 'circle',
                    pointRadius: 5,
                    pointBorderColor: 'transparent',
                    pointBackgroundColor: 'rgba(220,53,69,0.75)',
                    data: yearlyData.map(d => d.count)
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
                            labelString: 'Date'
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
                }
            }
        });

        document.getElementById('yearly-header').textContent = `${currentYear}`;
    }

    function navigateWeek(offset) {
        currentWeek.setDate(currentWeek.getDate() + offset * 7);
        fetchReports().then(displayWeeklyChart);
    }

    function navigateMonth(offset) {
        currentMonth.setMonth(currentMonth.getMonth() + offset);
        fetchReports().then(displayMonthlyChart);
    }

    function navigateYear(offset) {
        currentYear += offset;
        fetchReports().then(displayYearlyChart);
    }
});

// Pie Chart
document.addEventListener('DOMContentLoaded', function() {
    const pieWeeklyChartCtx = document.getElementById('pie-weekly-chart').getContext('2d');
    const pieMonthlyChartCtx = document.getElementById('pie-monthly-chart').getContext('2d');
    const pieYearlyChartCtx = document.getElementById('pie-yearly-chart').getContext('2d');
    
    let pieWeeklyChart, pieMonthlyChart, pieYearlyChart;
    let currentWeek = new Date();
    let currentMonth = new Date();
    let currentYear = new Date().getFullYear();

    document.getElementById('pie-prev-week').addEventListener('click', () => navigateWeek(-1));
    document.getElementById('pie-next-week').addEventListener('click', () => navigateWeek(1));
    document.getElementById('pie-prev-month').addEventListener('click', () => navigateMonth(-1));
    document.getElementById('pie-next-month').addEventListener('click', () => navigateMonth(1));
    document.getElementById('pie-prev-year').addEventListener('click', () => navigateYear(-1));
    document.getElementById('pie-next-year').addEventListener('click', () => navigateYear(1));

    fetchReports().then(reports => {
        displayPieWeeklyChart(reports);
        displayPieMonthlyChart(reports);
        displayPieYearlyChart(reports);
    });

    function fetchReports() {
        return fetch('/reports')
            .then(response => response.json())
            .then(reports => {
                console.log('Fetched Reports:', reports);  // Debugging line
                reports.sort((a, b) => new Date(a.reportDateTime) - new Date(b.reportDateTime));
                return reports;
            })
            .catch(error => console.error('Error:', error));
    }

    function displayPieWeeklyChart(reports) {
        const weekStart = new Date(currentWeek);
        weekStart.setDate(currentWeek.getDate() - currentWeek.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);

        const damages = aggregateDamages(reports, weekStart, weekEnd);
        console.log('Weekly Damages:', damages);  // Debugging line

        if (pieWeeklyChart) {
            pieWeeklyChart.destroy();
        }

        pieWeeklyChart = new Chart(pieWeeklyChartCtx, {
            type: 'pie',
            data: {
                labels: Object.keys(damages),
                datasets: [{
                    data: Object.values(damages),
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.2)',
                        'rgba(54, 162, 235, 0.2)',
                        'rgba(255, 206, 86, 0.2)',
                        'rgba(75, 192, 192, 0.2)',
                        'rgba(153, 102, 255, 0.2)',
                        'rgba(255, 159, 64, 0.2)'
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 159, 64, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Weekly Damages'
                }
            }
        });

        document.getElementById('pie-weekly-header').textContent = `${weekStart.toLocaleDateString()} - ${weekEnd.toLocaleDateString()}`;
    }

    function displayPieMonthlyChart(reports) {
        const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
        const nextMonthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);

        const damages = aggregateDamages(reports, monthStart, nextMonthStart);
        console.log('Monthly Damages:', damages);  // Debugging line

        if (pieMonthlyChart) {
            pieMonthlyChart.destroy();
        }

        pieMonthlyChart = new Chart(pieMonthlyChartCtx, {
            type: 'pie',
            data: {
                labels: Object.keys(damages),
                datasets: [{
                    data: Object.values(damages),
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.2)',
                        'rgba(54, 162, 235, 0.2)',
                        'rgba(255, 206, 86, 0.2)',
                        'rgba(75, 192, 192, 0.2)',
                        'rgba(153, 102, 255, 0.2)',
                        'rgba(255, 159, 64, 0.2)'
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 159, 64, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Monthly Damages'
                }
            }
        });

        document.getElementById('pie-monthly-header').textContent = `${monthStart.toLocaleDateString()} - ${nextMonthStart.toLocaleDateString()}`;
    }

    function displayPieYearlyChart(reports) {
        const yearStart = new Date(currentYear, 0, 1);
        const nextYearStart = new Date(currentYear + 1, 0, 1);

        const damages = aggregateDamages(reports, yearStart, nextYearStart);
        console.log('Yearly Damages:', damages);  // Debugging line

        if (pieYearlyChart) {
            pieYearlyChart.destroy();
        }

        pieYearlyChart = new Chart(pieYearlyChartCtx, {
            type: 'pie',
            data: {
                labels: Object.keys(damages),
                datasets: [{
                    data: Object.values(damages),
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.2)',
                        'rgba(54, 162, 235, 0.2)',
                        'rgba(255, 206, 86, 0.2)',
                        'rgba(75, 192, 192, 0.2)',
                        'rgba(153, 102, 255, 0.2)',
                        'rgba(255, 159, 64, 0.2)'
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 159, 64, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Yearly Damages'
                }
            }
        });

        document.getElementById('pie-yearly-header').textContent = `${yearStart.getFullYear()}`;
    }

    function navigateWeek(offset) {
        currentWeek.setDate(currentWeek.getDate() + offset * 7);
        fetchReports().then(reports => displayPieWeeklyChart(reports));
    }

    function navigateMonth(offset) {
        currentMonth.setMonth(currentMonth.getMonth() + offset);
        fetchReports().then(reports => displayPieMonthlyChart(reports));
    }

    function navigateYear(offset) {
        currentYear += offset;
        fetchReports().then(reports => displayPieYearlyChart(reports));
    }

    function aggregateDamages(reports, startDate, endDate) {
        const damages = {};
        reports.forEach(report => {
            const reportDate = new Date(report.reportDateTime);
            if (reportDate >= startDate && reportDate < endDate) {
                report.reportInfo.forEach(info => {
                    if (info.typeOfDamage) {
                        damages[info.typeOfDamage] = (damages[info.typeOfDamage] || 0) + 1;
                    }
                });
            }
        });
        return damages;
    }
});