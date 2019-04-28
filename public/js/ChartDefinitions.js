
module.exports =function(){
//TVOC chart DEFINITION
var ctx = document.getElementById("tvocChart").getContext('2d');
var tvocChart = new Chart(ctx, {
type: 'line',
data: {
labels: ["TVOC"],
datasets: [{
    label: 'ppb vs seg',
    backgroundColor:'rgba(254, 90, 0, 0.5)',
    borderColor: 'rgba(255, 159, 64, 1)',
    borderWidth: 1,
    //data: [0,5,10,15,20,25,30,35,40,45,50,55,60,70,75,80]
}]
},
options: {
scales: {
    yAxes: [{
        ticks: {
            beginAtZero:true
        }
    }]
}
}
});
}

// CO2 chart DEFINITION
var ctx = document.getElementById("co2Chart").getContext('2d');
var co2Chart = new Chart(ctx, {
type: 'line',
data: {
labels: ["CO2"],
datasets: [{
    label: 'ppm vs seg',
    backgroundColor:'rgba(59, 99, 210, 0.5)',
    borderColor: 'rgba(31, 53, 112, 1)',
    borderWidth: 1,
    //data: [400,600,800,1000,1200,1400,1600,1800,2000,2200,2400]
}]
},
options: {
scales: {
    yAxes: [{
        ticks: {
            beginAtZero:true
        }
    }]
}
}
});

  // Humidity chart DEFINITION
  var ctx = document.getElementById("humChart").getContext('2d');
  var humChart = new Chart(ctx, {
  type: 'line',
  data: {
  labels: ["Humidity"],
  datasets: [{
      label: '% vs seg',
      backgroundColor:'rgba(59, 99, 210, 0.5)',
      borderColor: 'rgba(31, 53, 112, 1)',
      borderWidth: 1,
      //data: [0,5,10,15,20,25,30,35,40,45,50,55,60,65,70,75,80,85,90,95,100]
  }]
  },
  options: {
  scales: {
      yAxes: [{
          ticks: {
              beginAtZero:true
          }
      }]
  }
  }
  });

   // TEMPERATURE chart DEFINITION
   var ctx = document.getElementById("tempChart").getContext('2d');
   var tempChart = new Chart(ctx, {
   type: 'line',
   data: {
   labels: ["Temperature"],
   datasets: [{
       label: 'C° vs seg',
       backgroundColor:'rgba(59, 99, 210, 0.5)',
       borderColor: 'rgba(31, 53, 112, 1)',
       borderWidth: 1,
       //data: [-35,-30,-25,-20,-15,-10,-5,0,5,10,15,20,25,30,35]
   }]
   },
   options: {
   scales: {
       yAxes: [{
           ticks: {
               beginAtZero:true
           }
       }]
   }
   }
   });
