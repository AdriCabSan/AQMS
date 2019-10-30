#include <Wire.h>
#include "Adafruit_SGP30.h"
#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <PubSubClient.h>

WiFiClient espClient;
PubSubClient client(espClient);
long lastMsg = 0;
char msg[50];
int value = 0;

Adafruit_SGP30 sgp;
//"HUAWEI P30 lite","zelda800"
const char* ssid = "";
const char* password = "";
const char* mqtt_server = "";
const char* mqttUser = "";
const char* mqttPassword = "";

/* return absolute humidity [mg/m^3] with approximation formula
* @param temperature [°C]
* @param humidity [%RH]
*/
uint32_t getAbsoluteHumidity(float temperature, float humidity) {
    // approximation formula from Sensirion SGP30 Driver Integration chapter 3.15
    const float absoluteHumidity = 216.7f * ((humidity / 100.0f) * 6.112f * exp((17.62f * temperature) / (243.12f + temperature)) / (273.15f + temperature)); // [g/m^3]
    const uint32_t absoluteHumidityScaled = static_cast<uint32_t>(1000.0f * absoluteHumidity); // [mg/m^3]
    return absoluteHumidityScaled;
}

void setup_wifi() {

  delay(10);
  // We start by connecting to a WiFi network
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  randomSeed(micros());

  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
}

void reconnect() {
  // Loop until we're reconnected
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    // Create a random client ID
    String clientId = "ESP8266Client-";
    clientId += String(random(0xffff), HEX);
    // Attempt to connect
    if (client.connect(clientId.c_str())) {
      Serial.println("connected");
      // Once connected, publish an announcement...
      client.publish("reconnect", "device_reconnected:N1");
      // ... and resubscribe
      client.subscribe("aqms/#");
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      // Wait 5 seconds before retrying
      delay(5000);
    }
  }
}
void callback(char* topic, byte* payload, unsigned int length) {
  Serial.print("Message arrived [");
  Serial.print(topic);
  Serial.print("] ");
  for (int i=0;i<length;i++) {
    Serial.print((char)payload[i]);
  }
  Serial.println();
}

void setup() {
  Serial.begin(9600);
  Serial.println("SGP30 test");
  Wire.begin();
  if (! sgp.begin()){
    Serial.println("Sensor not found :(");
    while (1);
  }
  Serial.print("Found SGP30 serial #");
  Serial.print(sgp.serialnumber[0], HEX);
  Serial.print(sgp.serialnumber[1], HEX);
  Serial.println(sgp.serialnumber[2], HEX);

  setup_wifi();
  client.setCallback(callback);
  client.setServer(mqtt_server, 1883);

   // Allow the hardware to sort itself out
  delay(1500);
  
}
  // If you have a baseline measurement from before you can assign it to start, to 'self-calibrate'
  //sgp.setIAQBaseline(0x8E68, 0x8F41);  // Will vary for each sensor!


int counter = 0;
void loop() {
  // If you have a temperature / humidity sensor, you can set the absolute humidity to enable the humditiy compensation for the air quality signals
  //float temperature = 22.1; // [°C]
  //float humidity = 45.2; // [%RH]
  //sgp.setHumidity(getAbsoluteHumidity(temperature, humidity));
  if (!client.connected()) {
      reconnect();
  }
  
 else { 
    if (! sgp.IAQmeasure()) {
      Serial.println("Measurement failed");
      return;
    }
    char cstr[16];
    char cstr2[16];
    char cstr3[16];
    char cstr4[16];
    char* eco2=itoa(sgp.eCO2, cstr, 10);
    char* tvoc = itoa(sgp.TVOC, cstr2, 10);
    Serial.print("TVOC "); Serial.print(tvoc); Serial.print(" ppb\t");
    Serial.print("eCO2 "); Serial.print(eco2); Serial.println(" ppm");

    if (! sgp.IAQmeasureRaw()) {
      Serial.println("Raw Measurement failed");
      return;
    }
  
    char* rawH2 = itoa(sgp.rawH2, cstr3, 10);
    char* rawEthanol = itoa(sgp.rawEthanol, cstr4, 10);
    
    Serial.print("Raw H2 "); Serial.print(rawH2); Serial.print(" \t");
    Serial.print("Raw Ethanol "); Serial.print(rawEthanol); Serial.println("");
    
      if(client.publish("aqms/tvoc",tvoc)){
         Serial.println("published to aqms/tvoc ");
      }
      if(client.publish("aqms/eco2",eco2)){
        Serial.println("published to aqms/eco2 ");
      }
      if(client.publish("aqms/h2",rawH2)){
        Serial.println("published to aqms/h2 ");
      }
      if(client.publish("aqms/ethanol",rawEthanol)){
        Serial.println("published to aqms/ethanol ");
      }
     
      
    delay(5000);
/*
    counter++;
    if (counter == 30) {
        counter = 0;
        uint16_t TVOC_base, eCO2_base;
        if (! sgp.getIAQBaseline(&eCO2_base, &TVOC_base)) {
          Serial.println("Failed to get baseline readings");
          return;
        }
        Serial.print("****Baseline values: eCO2: 0x"); Serial.print(eCO2_base, HEX);
        Serial.print(" & TVOC: 0x"); Serial.println(TVOC_base, HEX);
    }*/
    ///finish sensor code
}
 
}
