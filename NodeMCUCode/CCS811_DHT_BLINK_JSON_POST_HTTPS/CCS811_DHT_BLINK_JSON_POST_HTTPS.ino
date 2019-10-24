#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <ESP8266WiFiMulti.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClientSecureBearSSL.h>
#include <ArduinoJson.h>
#include "DHT.h"
#include <Wire.h>
#include "SparkFunCCS811.h"

#define DHTPIN 2
#define DHTTYPE DHT11
#define CCS811_ADDR 0x5B

CCS811 mySensor(CCS811_ADDR);
DHT dht(DHTPIN, DHTTYPE);
ESP8266WiFiMulti WiFiMulti;

void setup() {
  Serial.begin(9600);
  dht.begin();
  delay(1500);
  Wire.begin();
  CCS811Core::status returnCode = mySensor.begin();
  
  if (returnCode != CCS811Core::SENSOR_SUCCESS){
    Serial.println("CCS811 Failed to begin.");
    while (1);
  }
  
  for (uint8_t t = 4; t > 0; t--) {
    Serial.printf("[SETUP] WAIT %d...\n", t);
    Serial.flush();
    delay(1000);
  }
  
  WiFi.mode(WIFI_STA);
  //WiFiMulti.addAP("linksys IOT",NULL);
  WiFiMulti.addAP("HUAWEI P30 lite","zelda800");
}

void loop() {
  float h = dht.readHumidity();
  float t = dht.readTemperature();
  float f = dht.readTemperature(true);
  float hic = dht.computeHeatIndex(t, h, false);
  
  mySensor.readAlgorithmResults();
  float CO2 = mySensor.getCO2();
  float TVOC = mySensor.getTVOC();
  float MILLI = millis(); 
  
  char JSONmessageBuffer[180];
  String getData, Link; 
  char json[180];
  
  WiFiClientSecure httpsClient;
  
  StaticJsonBuffer<180> JSONbuffer;
  JsonObject& JSONencoder = JSONbuffer.createObject();
   
  if (isnan(h) || isnan(t) || isnan(f) || isnan(CO2) || isnan(TVOC) || isnan(MILLI)) {  //We validate the data is present in the variables.
    Serial.println("Failed to read from sensors!");
    return;
    }
    
   if ((WiFiMulti.run() == WL_CONNECTED)) { //
    std::unique_ptr<BearSSL::WiFiClientSecure>client(new BearSSL::WiFiClientSecure);

    client->setFingerprint("08 3B 71 72 02 43 6E CA ED 42 86 93 BA 7E DF 81 C4 BC 62 30");  //SHA1 KEY

    HTTPClient https;
    
    JSONencoder["ID"].set(1);
    JSONencoder["CO2"].set(CO2);
    JSONencoder["TVOC"].set(TVOC);
    JSONencoder["Millis"].set(MILLI);
    JSONencoder["Humidity"].set(h);
    JSONencoder["Temperature_C"].set(t);
    JSONencoder["Heat_Index"].set(hic);
    JSONencoder.printTo(JSONmessageBuffer, sizeof(JSONmessageBuffer));
    JSONencoder.printTo((char*)json, JSONencoder.measureLength() + 1);  //Assign JSON to char(json).
    
    Serial.print("JSON TO SEND...\n\n");
    Serial.print(json);
    Serial.print("[HTTPS] begin...\n");
    if (https.begin(*client, "https://aqms-alpha.herokuapp.com/api/aqms")) {  //Stablish connection with server...
      Serial.print("[HTTPS] POST...\n");
      https.addHeader("Content-Type", "application/json"); // Send HTTPS header
      int httpCode = https.POST(json); // Send HTTPS POST
      
      if (httpCode > 0) {   // HTTP header has been send and Server response header has been handled
        Serial.printf("[HTTPS] POST... code: %d\n", httpCode);
        Serial.println();
        
        if (httpCode == HTTP_CODE_OK || httpCode == HTTP_CODE_MOVED_PERMANENTLY) {  //Validate the codes sent as an answer
          String payload = https.getString();
          Serial.println(payload);
        }
      } else {
        Serial.printf("[HTTPS] POST... failed, error: %s\n", https.errorToString(httpCode).c_str());
      }
      
      https.end();   //Close connection.
      
    } else {
      Serial.printf("[HTTPS] Unable to connect\n");
    }
  }
  
  Serial.println("System refreshing...");
  delay(1000);
}
