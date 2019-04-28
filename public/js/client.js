let Status = require('./StatusProcess')();
let Chart = require('./ChartDefinitions')();
const socket= io();

const Charts={
    tvocChart: Chart.tvocChart,
    co2Chart: Chart.co2Chart
}
const Statuses={
    tvocStatus:Status.tvocStatus,
    co2Status: Status.co2Status
}


const plotSensorData = (chart,counter,arduinoData) => {
    chart.data.labels.push(counter);
    chart.data.datasets.forEach(dataset => {
        dataset.data.push(arduinoData.value);
    });    
    }

const deleteSensorData = (chart,counter,arduinoData) => {
    if (counter > 15){
        chart.data.labels.shift(counter);
        chart.data.datasets.forEach(dataset => {
            dataset.data.shift(arduinoData.value);
        });    
    }
    }
//tvoc chart
    socket.on("arduino:tvoc",(arduinoData)=>{
        Status.setStatus(Charts.tvocChart,Statuses.tvocStatus,arduinoData.value);
        plotSensorData(Charts.tvocChart,counter,arduinoData)
        counter++;
        deleteSensorData(Charts.tvocChart,counter,arduinoData)
        tvocChart.update();
    });