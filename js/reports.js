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
    fetchReports();
    
    // Initialize chart instances
    let weeklyChart, monthlyChart, yearlyChart;
    let currentWeek = 0, currentMonth = 0, currentYear = 0;
    
    const ctxWeekly = document.getElementById('weekly-chart').getContext('2d');
    const ctxMonthly = document.getElementById('monthly-chart').getContext('2d');
    const ctxYearly = document.getElementById('yearly-chart').getContext('2d');
    
    document.getElementById('prev-week').addEventListener('click', function() {
        currentWeek--;
        updateWeeklyChart();
    });
    
    document.getElementById('next-week').addEventListener('click', function() {
        currentWeek++;
        updateWeeklyChart();
    });
    
    document.getElementById('prev-month').addEventListener('click', function() {
        currentMonth--;
        updateMonthlyChart();
    });
    
    document.getElementById('next-month').addEventListener('click', function() {
        currentMonth++;
        updateMonthlyChart();
    });
    
    document.getElementById('prev-year').addEventListener('click', function() {
        currentYear--;
        updateYearlyChart();
    });
    
    document.getElementById('next-year').addEventListener('click', function() {
        currentYear++;
        updateYearlyChart();
    });
    
    function fetchReports() {
        fetch('/reports')
            .then(response => response.json())
            .then(reports => {
                // Process the report data for charts
                const reportData = processReportData(reports);
                initializeCharts(reportData);
            })
            .catch(error => console.error('Error:', error));
    }
    
    function processReportData(reports) {
        const weeklyData = [], monthlyData = [], yearlyData = [];
        const weekCounts = {}, monthCounts = {}, yearCounts = {};
        
        reports.forEach(report => {
            const date = new Date(report.reportDateTime);
            const year = date.getFullYear();
            const month = date.getMonth() + 1; // months are 0-based
            const week = getWeekOfYear(date);
            
            if (!weekCounts[year]) weekCounts[year] = {};
            if (!weekCounts[year][week]) weekCounts[year][week] = 0;
            weekCounts[year][week]++;
            
            if (!monthCounts[year]) monthCounts[year] = {};
            if (!monthCounts[year][month]) monthCounts[year][month] = 0;
            monthCounts[year][month]++;
            
            if (!yearCounts[year]) yearCounts[year] = 0;
            yearCounts[year]++;
        });
        
        Object.keys(weekCounts).forEach(year => {
            Object.keys(weekCounts[year]).forEach(week => {
                weeklyData.push({ year: parseInt(year), week: parseInt(week), count: weekCounts[year][week] });
            });
        });
        
        Object.keys(monthCounts).forEach(year => {
            Object.keys(monthCounts[year]).forEach(month => {
                monthlyData.push({ year: parseInt(year), month: parseInt(month), count: monthCounts[year][month] });
            });
        });
        
        Object.keys(yearCounts).forEach(year => {
            yearlyData.push({ year: parseInt(year), count: yearCounts[year] });
        });
        
        return { weeklyData, monthlyData, yearlyData };
    }
    
    function getWeekOfYear(date) {
        const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
        const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
        return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    }
    
    function initializeCharts(reportData) {
        weeklyChart = new Chart(ctxWeekly, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Reports',
                    borderColor: 'rgba(0, 123, 255, 0.9)',
                    borderWidth: 1,
                    backgroundColor: 'rgba(0, 123, 255, 0.5)',
                    data: []
                }]
            },
            options: {
                responsive: true,
                scales: {
                    x: { beginAtZero: true },
                    y: { beginAtZero: true }
                }
            }
        });
        
        monthlyChart = new Chart(ctxMonthly, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Reports',
                    borderColor: 'rgba(0, 123, 255, 0.9)',
                    borderWidth: 1,
                    backgroundColor: 'rgba(0, 123, 255, 0.5)',
                    data: []
                }]
            },
            options: {
                responsive: true,
                scales: {
                    x: { beginAtZero: true },
                    y: { beginAtZero: true }
                }
            }
        });
        
        yearlyChart = new Chart(ctxYearly, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Reports',
                    borderColor: 'rgba(0, 123, 255, 0.9)',
                    borderWidth: 1,
                    backgroundColor: 'rgba(0, 123, 255, 0.5)',
                    data: []
                }]
            },
            options: {
                responsive: true,
                scales: {
                    x: { beginAtZero: true },
                    y: { beginAtZero: true }
                }
            }
        });
        
        updateWeeklyChart(reportData);
        updateMonthlyChart(reportData);
        updateYearlyChart(reportData);
    }
    
    function updateWeeklyChart(reportData) {
        const { weeklyData } = reportData;
        const weekLabels = [];
        const weekCounts = [];
        
        const currentYear = new Date().getFullYear();
        const startWeek = currentWeek * 7;
        const endWeek = startWeek + 7;
        
        for (let i = startWeek; i < endWeek; i++) {
            const week = i + 1;
            const weekLabel = `Week ${week}`;
            weekLabels.push(weekLabel);
            const weekData = weeklyData.find(wd => wd.year === currentYear && wd.week === week);
            weekCounts.push(weekData ? weekData.count : 0);
        }
        
        weeklyChart.data.labels = weekLabels;
        weeklyChart.data.datasets[0].data = weekCounts;
        weeklyChart.update();
    }
    
    function updateMonthlyChart(reportData) {
        const { monthlyData } = reportData;
        const monthLabels = [];
        const monthCounts = [];
        
        const currentYear = new Date().getFullYear();
        const startMonth = currentMonth * 12;
        const endMonth = startMonth + 12;
        
        for (let i = startMonth; i < endMonth; i++) {
            const month = i + 1;
            const monthLabel = `Month ${month}`;
            monthLabels.push(monthLabel);
            const monthData = monthlyData.find(md => md.year === currentYear && md.month === month);
            monthCounts.push(monthData ? monthData.count : 0);
        }
        
        monthlyChart.data.labels = monthLabels;
        monthlyChart.data.datasets[0].data = monthCounts;
        monthlyChart.update();
    }
    
    function updateYearlyChart(reportData) {
        const { yearlyData } = reportData;
        const yearLabels = [];
        const yearCounts = [];
        
        const startYear = currentYear * 5;
        const endYear = startYear + 5;
        
        for (let i = startYear; i < endYear; i++) {
            const year = i + 1;
            const yearLabel = `Year ${year}`;
            yearLabels.push(yearLabel);
            const yearData = yearlyData.find(yd => yd.year === year);
            yearCounts.push(yearData ? yearData.count : 0);
        }
        
        yearlyChart.data.labels = yearLabels;
        yearlyChart.data.datasets[0].data = yearCounts;
        yearlyChart.update();
    }
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
