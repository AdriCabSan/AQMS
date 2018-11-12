const socket= io();
let counter=0;
socket.on("arduino:data",(arduinoData)=>{
    myChart.data.labels.push(counter);
    myChart.data.datasets.forEach(dataset => {
        dataset.data.push(arduinoData.value);
    });    
    counter++;
    if (counter > 5){
        myChart.data.labels.shift(counter);
        myChart.data.datasets.forEach(dataset => {
            dataset.data.shift(arduinoData.value);
        });    
    }
    myChart.update();
});
var ctx = document.getElementById("myCanvas").getContext('2d');
var myChart = new Chart(ctx, {
type: 'line',
data: {
labels: ["Serial"],
datasets: [{
    label: 'Serial',
    backgroundColor:'rgba(255, 99, 132, 0.2)',
    borderColor: 'rgba(255, 159, 64, 1)',
    borderWidth: 1,
    data: []
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