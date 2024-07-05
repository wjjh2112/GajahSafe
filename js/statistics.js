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
                    label: "Total Electricity Shutdown",
                    data: data.shutdown,
                    backgroundColor: 'transparent',
                    borderColor: 'rgba(220,53,69,0.75)',
                    borderWidth: 3,
                    pointStyle: 'circle',
                    pointRadius: 5,
                    pointBorderColor: 'transparent',
                    pointBackgroundColor: 'rgba(220,53,69,0.75)',
                }, {
                    label: "Total Pushed/Pulled",
                    data: data.pushedPulled,
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





$(function() {
    // Initialize Date Range Picker
    $('#dateRangePicker').daterangepicker({
        opens: 'left',
        locale: {
            format: 'DD/MM/YYYY',
            separator: ' - ',
            applyLabel: 'Apply',
            cancelLabel: 'Cancel',
            fromLabel: 'From',
            toLabel: 'To',
            customRangeLabel: 'Custom',
            weekLabel: 'W',
            daysOfWeek: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
            monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
            firstDay: 1
        },
        autoUpdateInput: false
    });

    // Handle Apply button click on Date Range Picker
    $('#dateRangePicker').on('apply.daterangepicker', function(ev, picker) {
        $(this).val(picker.startDate.format('DD/MM/YYYY') + ' - ' + picker.endDate.format('DD/MM/YYYY'));
        filterTable();
    });

    // Handle Cancel button click on Date Range Picker
    $('#dateRangePicker').on('cancel.daterangepicker', function(ev, picker) {
        $(this).val('');
        filterTable();
    });

    // Handle alert filter change
    $('#alertFilter').change(function() {
        filterTable();
    });

    // Store the original rows
    var originalRows = Array.from(document.querySelectorAll('.table-earning tbody tr'));

    // Function to filter table by alert and date range
    function filterTable() {
        var selectedAlertType = $('#alertFilter').val();
        var dateRange = $('#dateRangePicker').val();
        var table = document.querySelector('.table-earning tbody');
        
        // Clear the table before re-adding filtered rows
        table.innerHTML = '';

        var startDate = null;
        var endDate = null;

        if (dateRange) {
            var dates = dateRange.split(' - ');
            startDate = moment(dates[0], 'DD/MM/YYYY');
            endDate = moment(dates[1], 'DD/MM/YYYY');
        }

        var rowsShown = 0;

        originalRows.forEach(function(row) {
            var shutdownCell = row.querySelector('td:nth-child(2)');
            var pushedPulledCell = row.querySelector('td:nth-child(3)');
            var dateCell = row.querySelector('td:nth-child(4)');
            if (!shutdownCell || !pushedPulledCell || !dateCell) return; // Skip if cells are not found

            var shutdownText = shutdownCell.textContent.trim();
            var pushedPulledText = pushedPulledCell.textContent.trim();
            var dateText = dateCell.textContent.trim();
            var rowDate = moment(dateText, 'DD/MM/YYYY, HH:mm:ss', true); // Parse date with strict mode

            var alertMatch = (selectedAlertType === 'All Types of Alerts' || 
                             (selectedAlertType === 'Electricity Shutdown' && shutdownText === 'Yes') || 
                             (selectedAlertType === 'Pushed / Pulled' && pushedPulledText === 'Yes'));

            var dateMatch = (!startDate || !endDate || rowDate.isBetween(startDate, endDate, null, '[]'));

            if (alertMatch && dateMatch) {
                row.style.display = '';
                table.appendChild(row); // Add the row to the table
                rowsShown++;
            }
        });

        // Show "No records found" message if no rows are visible after filtering
        if (rowsShown === 0) {
            if (!document.querySelector('.no-records')) {
                var noRecordsRow = document.createElement('tr');
                noRecordsRow.classList.add('no-records');
                noRecordsRow.innerHTML = '<td colspan="6" style="text-align: center;">No records found</td>';
                table.appendChild(noRecordsRow);
            }
        } else {
            var noRecordsElement = document.querySelector('.no-records');
            if (noRecordsElement) {
                noRecordsElement.remove();
            }
        }
    }

    // Initial call to sort and display the table
    function sortAndFilterTable() {
        originalRows.sort(function(a, b) {
            var dateA = moment(a.querySelector('td:nth-child(4)').textContent.trim(), 'DD/MM/YYYY, HH:mm:ss');
            var dateB = moment(b.querySelector('td:nth-child(4)').textContent.trim(), 'DD/MM/YYYY, HH:mm:ss');
            return dateB - dateA; // descending order
        });
        filterTable();
    }

    // Initialize the table on page load
    sortAndFilterTable();
});
