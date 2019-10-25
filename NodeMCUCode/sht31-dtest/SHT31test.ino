/*************************************************** 
  This is an example for the SHT31-D Humidity & Temp Sensor

  Designed specifically to work with the SHT31-D sensor from Adafruit
  ----> https://www.adafruit.com/products/2857

  These sensors use I2C to communicate, 2 pins are required to  
  interface
 ****************************************************/
 
#include <Arduino.h>
#include <Wire.h>
#include "Adafruit_SHT31.h"
#include <ESP8266WiFi.h>
#include <PubSubClient.h>

WiFiClient espClient;
PubSubClient client(espClient);
long lastMsg = 0;
char msg[50];
int value = 0;

Adafruit_SHT31 sht31 = Adafruit_SHT31();

//"HUAWEI P30 lite","zelda800"
const char* ssid = "*****";
const char* password = "****";
const char* mqtt_server = "broker.mqtt-dashboard.com";
mqttPort = 1883;
mqttUser = "******";
mqttPassword = "***";

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
  //client.connect("arduinoClient", mqttUser, mqttPassword);
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    // Create a random client ID
    String clientId = "ESP8266Client-";
    clientId += String(random(0xffff), HEX);
    // Attempt to connect
    if (client.connect(clientId.c_str())) {
      Serial.println("connected");
      // Once connected, publish an announcement...
      client.publish("reconnect", "device_reconnected:N2");
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
void setup() {
  Serial.begin(9600);

  while (!Serial)
    delay(10);     // will pause Zero, Leonardo, etc until serial console opens

  Serial.println("SHT31 test");
  if (! sht31.begin(0x44)) {   // Set to 0x45 for alternate i2c addr
    Serial.println("Couldn't find SHT31");
    while (1) delay(1);
  }
  setup_wifi();
  client.setServer(mqtt_server, mqttPort);
}


void loop() {
if (!client.connected()) {
      reconnect();
}

else{
  char result[16];
   char result2[16];
  float t = sht31.readTemperature();
  float h = sht31.readHumidity();
  char* temp= dtostrf(t, 6, 2, result);
  char* hum= dtostrf(h, 6, 2, result2);
  
  if (! isnan(t)) {  // check if 'is not a number'
    Serial.print("Temp *C = "); Serial.println(temp);
    if(client.publish("aqms/temperature",temp)){
         Serial.println("published to aqms/temp ");
      }
    
  } else { 
    Serial.println("Failed to read temperature");
  }
  
  if (! isnan(h)) {  // check if 'is not a number'
    Serial.print("Hum. % = "); Serial.println(hum);
    if(client.publish("aqms/humidity",hum)){
         Serial.println("published to aqms/humidity ");
      }
    
  } else { 
    Serial.println("Failed to read humidity");
  }
  Serial.println();
  delay(1000);
}
}
