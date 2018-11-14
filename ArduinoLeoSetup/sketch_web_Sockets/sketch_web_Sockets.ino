#include "DHT.h"             // Libreria del sensor de temperatura 
#include "SparkFunCCS811.h"  // Libreria del sensor de calidad del aire
#define DHTPIN 4             // Pin de lectura del sensor de temperatura
#define DHTTYPE DHT11        // Definicion del sensor de temperatura **Se usa el DHT11
#define CCS811_ADDR 0x5B     // Entrada default del I2C

CCS811 mySensor(CCS811_ADDR); // Instancia del sensor de calidad del aire
DHT dht(DHTPIN, DHTTYPE);     // Instancia del sensor de temp

float co2, tvoc;
float temp, hum;
String stemp,shum,sco2,stvoc;
String resultVar;

void setup() {

  Serial.begin(9600);  
  delay(500);
  while (!Serial){
    ;
  }
  
  dht.begin();
  delay(500);
  
  CCS811Core::status returnCode = mySensor.begin();
  if (returnCode != CCS811Core::SENSOR_SUCCESS)
  {
    Serial.println(".begin() returned with an error.");
    while (1); //Hang if there was a problem.
  }
  
}

void printData(float temp, float hum, float co2, float tvoc){
  stemp = String(temp);
  shum = String(hum);
  sco2 = String(co2);
  stvoc = String(tvoc);
  resultVar = String(stemp + "," +shum + "," + sco2 + "," + stvoc);
  Serial.println(resultVar);
  stvoc="";
  shum ="";
  sco2="";
  stvoc="";
  resultVar="";
}

void resetVar(float temp, float hum, float co2, float tvoc) {
  temp=0;
  hum=0;
  co2=0;
  tvoc=0;
}

void loop() {

  hum = dht.readHumidity();
  temp = dht.readTemperature();
  delay(100);
  if (mySensor.dataAvailable()){
    mySensor.readAlgorithmResults();
    co2 = mySensor.getCO2();
    tvoc = mySensor.getTVOC();  
  }else {
    Serial.print("CCS811 no disponible!\n\n");
    while (1); //Hang if there was a problem.
  }
  delay(1000);
  printData(temp,hum,co2,tvoc);
  resetVar(temp,hum,co2,tvoc);
}
