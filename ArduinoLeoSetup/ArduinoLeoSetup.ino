int counter = 1;
int counter2 = 100;
int counter3= 200;
int counter4 = 300;
int incomingByte =0;
void setup() {
  Serial.begin(9600);
}

void loop() {
  
  Serial.print(++counter,DEC);
  Serial.print(",");
  Serial.print(++counter2,DEC);
  Serial.print(",");
  Serial.print(++counter3,DEC);
  Serial.print(",");
  Serial.println(++counter4,DEC);
  delay(2000);

}
