export default = function(){
    const colors = {
        green:'rgba(57, 232, 0, 0.40)',
        yellow:'rgba(255, 263, 134, 0.50)',
        orange:'rgba(20, 98, 255, 0.60)',
        red: 'rgba(209, 23, 44, 0.70)',
        purple: 'rgba(142,1,142,0.90)'
    };
   //creating a plugin that draws a background color to the charts
   const Status = () => {
        this.colors = colors
        this.isAcceptable=false
        this.isRegular=false
        this.isBad =false
        this.isVeryBad = false
        this.isToxic = false
    }
    let currentStatus = (Status)=>{
        let status="";
            if(Status.isAcceptable){ status = "acceptable";}
            if(Status.isRegular){ status = "regular";}
            if(Status.isBad){ status = "bad";}
            if(Status.isVeryBad){ status = "very bad";}
            if(Status.isToxic){ status = "toxic";}
        return status;
    }
    
    let tvocStatus= (data)=>{
        let status = Status()
        Status.isAcceptable = data < 0.2;
        Status.isRegular = data >=0.2 && data < 3;
        Status.isBad = data >=3 && data < 15;
        Status.isVeryBad = data >=15 && data < 25;
        Status.isToxic = data > 25;
        return currentStatus(Status);
    };

    let co2Status= (data)=>{
        let status = Status()
        Status.isAcceptable = data < 500;
        Status.isRegular = data >=500 && data < 600;
        Status.isBad = data >=600 && data < 700;
        Status.isVeryBad = data >=700 && data < 800;
        Status.isToxic = data >= 800;

        return currentStatus(Status);
    };
    function enviromentStatus(arduinoData,statusType){
        return statusType(arduinoData);
    }

    let setStatus=(chart,statusType,arduinoData)=>{
        if (enviromentStatus(arduinoData,statusType)=="acceptable"){
            chart.data.datasets[0].backgroundColor = colors.green;
        }
        if (enviromentStatus(arduinoData,statusType)=="regular"){
            chart.data.datasets[0].backgroundColor= colors.yellow;
        }
        if (enviromentStatus(arduinoData,statusType)=="bad"){
            chart.data.datasets[0].backgroundColor = colors.orange;
        }
        if (enviromentStatus(arduinoData,statusType)=="very bad"){
            chart.data.datasets[0].backgroundColor = colors.red;
        }
        if (enviromentStatus(arduinoData,statusType)=="toxic"){
            chart.data.datasets[0].backgroundColor = colors.purple;
        }  
    }
    
}