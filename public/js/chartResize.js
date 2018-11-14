(function(){
    // set up the timeout variable
    var t;
    // setup the sizing function,
    // with an argument that tells the chart to animate or not
    function size(animate){
        // If we are resizing, we don't want the charts drawing on every resize event.
        // This clears the timeout so that we only run the sizing function
        // when we are done resizing the window
        clearTimeout(t);
        // This will reset the timeout right after clearing it.
        t = setTimeout(function(){
            $("canvas").each(function(i,el){
                // Set the canvas element's height and width to it's parent's height and width.
                // The parent element is the div.canvas-container
                $(el).attr({
                    "width":$(el).parent().width(),
                    "height":$(el).parent().outerHeight()
                });
            });
            // kickoff the redraw function, which builds all of the charts.
            redraw(animate);
     
            // loop through the widgets and find the tallest one, and set all of them to that height.
            var m = 0;
            // we have to remove any inline height setting first so that we get the automatic height.
            $(".widget").height("");
            $(".widget").each(function(i,el){ m = Math.max(m,$(el).height()); });
            $(".widget").height(m);
     
        }, 100); // the timeout should run after 100 milliseconds
    }
    $(window).on('resize', size);
    function redraw(animation){
        var options = {};
        if (!animation){
            options.animation = false;
        } else {
            options.animation = true;
        }
        // ....
            // the rest of our chart drawing will happen here
        // ....
        const socket= io();
        //let timer = new Timer();
//TVOC chart
        let counter=0;
        //timer.start({precision: 'seconds'});
socket.on("arduino:tvoc",(arduinoData)=>{
    //secondsPassed = timer.getTotalTimeValues().seconds;
    //console.log(secondsPassed);
    myChart.data.labels.push(counter);
    myChart.data.datasets.forEach(dataset => {
        dataset.data.push(arduinoData.value);
    });    
    counter++;
    if (counter > 30){
        myChart.data.labels.shift(counter);
        myChart.data.datasets.forEach(dataset => {
            dataset.data.shift(arduinoData.value);
        });    
    }
    myChart.update();
});
//TVOC chart DEFINITION
var ctx = document.getElementById("tvocChart").getContext('2d');
var myChart = new Chart(ctx, {
type: 'line',
data: {
labels: ["TVOC"],
datasets: [{
    label: 'tvoc',
    backgroundColor:'rgba(254, 90, 0, 0.5)',
    borderColor: 'rgba(255, 159, 64, 1)',
    borderWidth: 1,
    data: [0,5,10,15,20,25,30,35,40,45,50]
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

// CO2 chart
let counterCo=0;
    socket.on("arduino:co2",(arduinoData)=>{
        //secondsPassed = timer.getTotalTimeValues().seconds;
        //console.log(secondsPassed);
       co2Chart.data.labels.push(counterCo);
       co2Chart.data.datasets.forEach(dataset => {
            dataset.data.push(arduinoData.value);
        });    
        counterCo++;
        if (counterCo > 30){
            co2Chart.data.labels.shift(counterCo);
            co2Chart.data.datasets.forEach(dataset => {
                dataset.data.shift(arduinoData.value);
            });    
        }
        co2Chart.update();
    });
    // CO2 chart DEFINITION
    var ctx = document.getElementById("co2Chart").getContext('2d');
    var co2Chart = new Chart(ctx, {
    type: 'line',
    data: {
    labels: ["CO2"],
    datasets: [{
        label: 'co2',
        backgroundColor:'rgba(59, 99, 210, 0.5)',
        borderColor: 'rgba(31, 53, 112, 1)',
        borderWidth: 1,
        data: [0,5,10,15,20,25,30,35,40,45,50]
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

    // Humidity chart
let counterHum=0;
    socket.on("arduino:hum",(arduinoData)=>{
        //secondsPassed = timer.getTotalTimeValues().seconds;
        //console.log(secondsPassed);
        humChart.data.labels.push(counterHum);
        humChart.data.datasets.forEach(dataset => {
            dataset.data.push(arduinoData.value);
        });    
        counterHum++;
        if (counterHum > 30){
            humChart.data.labels.shift(counterHum);
            humChart.data.datasets.forEach(dataset => {
                dataset.data.shift(arduinoData.value);
            });    
        }
        humChart.update();
    });
    // Humidity chart DEFINITION
    var ctx = document.getElementById("humChart").getContext('2d');
    var humChart = new Chart(ctx, {
    type: 'line',
    data: {
    labels: ["Humidity"],
    datasets: [{
        label: 'hum',
        backgroundColor:'rgba(59, 99, 210, 0.5)',
        borderColor: 'rgba(31, 53, 112, 1)',
        borderWidth: 1,
        data: [0,5,10,15,20,25,30,35,40,45,50]
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

//temperature chart
var canvas = document.getElementById("tempRadar");
var ctx = canvas.getContext("2d");
var data = {
    labels : ["Helpful","Friendly","Kind","Rude","Slow","Frustrating"],
    datasets : [
        {
            fillColor : "rgba(220,220,220,0.5)",
            strokeColor : "#637b85",
            pointColor : "#dbba34",
            pointStrokeColor : "#637b85",
            data : [65,59,90,81,30,56]
        }
    ]
}
var tempRadar = new Chart(ctx).Radar(data, options);



    }
    size(); // this kicks off the first drawing; note that the first call to size will animate the charts in
})