function BuildMixedChart(chart, labels, barVals, linVals) {
  var ctx = document.getElementById(chart).getContext('2d');
  var myChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels, // Our labels
      datasets: [{
        label: 'pages', // Name the series
        data: barVals, // Our values
		backgroundColor: 'rgba(255, 99, 132, 0.2)',
		borderColor: 'rgba(255,99,132,1)',
        borderWidth: 1 // Specify bar border width
      },
	  {
        label: 'parts', // Name the series
        data: linVals, // Our values
		backgroundColor: 'rgba(54, 162, 235, 0.2)',
		borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1, // Specify bar border width
		type: 'line'
      }]
    },
    options: {
      responsive: true, // Instruct chart js to respond nicely.
      maintainAspectRatio: false, // Add to prevent default behavior of full-width/height 
	  tooltips: {
            backgroundColor: 'rgba(24, 41, 48, 0.8)', //182930
			borderColor: 'rgba(255, 247, 240, 1.0)', //FFF7F0
			borderWidth: 1
		}
	}
  });
  return myChart;
}

var table = document.getElementById("dataTable");
var json = []; 

// First row needs to be headers 
var headers =[];

for (var i = 0; i < table.rows[0].cells.length; i++) 
{
	headers[i] = 
		table.rows[0].cells[i].innerHTML.toLowerCase().replace(/ /gi, '');
}

// Go through cells 
for (var i = 1; i < table.rows.length; i++) 
{
  var tableRow = table.rows[i];
  var rowData = {};
  for (var j = 0; j < tableRow.cells.length; j++) 
  {
    rowData[headers[j]] = tableRow.cells[j].innerHTML;
  }

  json.push(rowData);
}


// Map JSON values back to label array
var labels = json.map(function (e) {
  return e.year;
});

// Map JSON values back to values array
var episodes = json.map(function (e) {
  return e.episodes;
});

// Map JSON values back to values array
var pages = json.map(function (e) {
  return e.pages;
});

var chart = BuildMixedChart("mixedChart", labels, pages, episodes);




//testing new click solution for tool tip text:

document.querySelectorAll('.tt .ttt').forEach(function(tooltip) {
  // Add close button if it doesn't exist
  if (!tooltip.querySelector('.ttt-close')) {
    var closeBtn = document.createElement('button');
    closeBtn.className = 'ttt-close';
    closeBtn.setAttribute('aria-label', 'Close tooltip');
    closeBtn.innerHTML = '&times;';
    // Insert close button at the end of tooltip content
    tooltip.appendChild(closeBtn);
  }
});

document.querySelectorAll('.tt').forEach(function(tt) {
  var tooltip = tt.querySelector('.ttt');
  var closeBtn = tooltip.querySelector('.ttt-close');

  // Show tooltip on click
  tt.addEventListener('click', function(event) {
    // Hide any other open tooltips
    document.querySelectorAll('.tt .ttt.active').forEach(function(openTooltip) {
      if (openTooltip !== tooltip) openTooltip.classList.remove('active');
    });
    tooltip.classList.add('active');
    event.stopPropagation();
  });

  // Hide tooltip on close button click
  closeBtn.addEventListener('click', function(event) {
    tooltip.classList.remove('active');
    event.stopPropagation();
  });
});

// Hide tooltip when clicking outside
document.addEventListener('click', function() {
  document.querySelectorAll('.tt .ttt.active').forEach(function(openTooltip) {
    openTooltip.classList.remove('active');
  });
});