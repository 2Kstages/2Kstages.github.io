function BuildMixedChart(chart, labels, barVals, linVals) {
  var ctx = document.getElementById(chart).getContext('2d');
  var myChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels, // Our labels
      datasets: [{
        label: 'pages [toggle]', // Name the series
        data: barVals, // Our values
		backgroundColor: 'rgba(255, 99, 132, 0.2)',
		borderColor: 'rgba(255,99,132,1)',
        borderWidth: 1 // Specify bar border width
      },
	  {
        label: 'parts [toggle]', // Name the series
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