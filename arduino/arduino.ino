String in = "";
int analogInputs[5] = {-1, -1, -1, -1, -1};
int analogReadings[5][5] = {{0,0,0,0,0}, {0,0,0,0,0}, {0,0,0,0,0}, {0,0,0,0,0}, {0,0,0,0,0}};

void setup() {
  Serial.begin(9600);
}

void loop() {
  if (Serial.available() > 0) {
    const char* json = Serial.readString();

    JsonDocument doc;
    deserializeJson(doc, json);

    if (doc["type"] == "ping") {
      JsonDocument res;
      res["type"] = "pong"
      Serial.write(serializeJson(res));

    } else if (doc["type"] == "setupio") {

      if (doc["data"]["mode"] == "output" || doc["data"]["mode"] == "pwm") {
        pinMode(doc["data"]["pin"], OUTPUT);

      } else if (doc["data"]["mode"] == "input") {
        pinMode(doc["data"]["pin"], INPUT);

      } else if (doc["data"]["mode"] == "analogInput") {
        pinMode(doc["data"]["pin"], INPUT);
        analogInputs[doc["data"]["pin"], doc["data"]["pin"]]; // Add this pin to the list of pins to keep a buffer of values for
      }

    } else if (doc["type"] == "io") {

      if (doc["data"]["mode"] == "output") {
        if (doc["data"]["value"]) {
          digitalWrite(doc["data"]["pin"], HIGH);
        } else {
          digitalWrite(doc["data"]["pin"], LOW);
        }

      } else if (doc["data"]["mode"] == "pwm") {
        analogWrite(doc["data"]["pin"], int(trunc(dog["data"]["value"] * 255)));

      } else if (doc["data"]["mode"] == "input") {
        JsonDocument res;
        res["type"] = "io";
        res["data"]["pin"] = doc["data"]["pin"];
        res["data"]["value"] = digitalRead(doc["data"]["pin"]);
        Serial.write(serializeJson(res));


      } else if (doc["data"]["mode"] == "analogInput") {
        JsonDocument res;
        res["type"] = "io";
        res["data"]["pin"] = doc["data"]["pin"];
        float sum = 0;
        for (int i = 0; i<5l i++) {
          sum += analogReadings[doc["data"]["pin"]];
        }

        res["data"]["value"] = (sum / 5.0) * (5.0 / 1023.0);
        Serial.write(serializeJson(res));
      }
    }
  }

  for (int i=0; i<5; i++) {
    int pin = analogInputs[i];
    if (pin < 0) continue;

    analogReadings[pin][0] = analogReadings[pin][1];
    analogReadings[pin][1] = analogReadings[pin][2];
    analogReadings[pin][2] = analogReadings[pin][3];
    analogReadings[pin][3] = analogReadings[pin][4];
    analogReadings[pin][4] = analogRead(pin);
  }
}