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

    // Store the original rows
    var originalRows = Array.from(document.querySelectorAll('.table-earning tbody tr'));

    // Function to filter table by date range
    function filterTable() {
        var dateRange = $('#dateRangePicker').val();
        var table = document.querySelector('.table-earning tbody');
        
        // Clear the table before re-adding filtered rows
        table.innerHTML = '';

        var startDate = null;
        var endDate = null;

        if (dateRange) {
            var dates = dateRange.split(' - ');
            startDate = moment(dates[0], 'DD/MM/YYYY');
            endDate = moment(dates[1], 'DD/MM/YYYY').endOf('day');
        }

        var rowsShown = 0;

        originalRows.forEach(function(row) {
            var dateCell = row.querySelector('td:nth-child(3)');
            if (!dateCell) return; // Skip if the date cell is not found

            var dateText = dateCell.textContent.trim();
            var rowDate = moment(dateText, 'DD/MM/YYYY, HH:mm:ss', true); // Parse date with strict mode

            var dateMatch = (!startDate || !endDate || rowDate.isBetween(startDate, endDate, null, '[]'));

            if (dateMatch) {
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
                noRecordsRow.innerHTML = '<td colspan="4" style="text-align: center;">No records found</td>';
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
            var dateA = moment(a.querySelector('td:nth-child(3)').textContent.trim(), 'DD/MM/YYYY, HH:mm:ss');
            var dateB = moment(b.querySelector('td:nth-child(3)').textContent.trim(), 'DD/MM/YYYY, HH:mm:ss');
            return dateB - dateA; // descending order
        });
        filterTable();
    }

    // Initialize the table on page load
    sortAndFilterTable();
});
