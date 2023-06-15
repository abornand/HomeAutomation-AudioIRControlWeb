import React, { useState, useCallback, useEffect, useRef } from 'react';
import moment, { Duration } from 'moment';
import mqtt, { IClientOptions, MqttClient } from 'precompiled-mqtt';
import './Application.scss';
import { icons } from './Icons';
import { sounds } from './Sounds';
import { animations } from './Animations';
import { DISPLAY_STATES } from './DisplayState';
import { ACTIONS } from './Actions';

const Application: React.FC = () => {
  const [mode, setMode] = useState('');
  const [lastMessage, setLastMessage] = useState('');
  const [displayState, setDisplayState] = useState(DISPLAY_STATES.INITIALIZING);

  const didUnmount = useRef(false);

  const [mqttClient, setMqttClient] = useState<MqttClient>();

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    if (
      queryParams.get('mode') &&
      queryParams.get('mode').toUpperCase() === 'REMOTE'
    ) {
      setMode('REMOTE');
    }
    var options: IClientOptions = {
      protocol: 'mqtts',
      keepalive: 30,
      reconnectPeriod: 1000,
      connectTimeout: 30 * 1000,
      username: 'andrewbornand',
      password: 'aio_QXhF76SLCxS124Tt6IawnOy89rQv',
    };
    const client = mqtt.connect('mqtts://io.adafruit.com:443/mqtt', options);
    client.subscribe('andrewbornand/f/home.audio');
    setMqttClient(client);
    client.on('connect', () => {
      console.log('CONNECTED to broker');
    });
    client.on('message', (topic, message) => {
      /* set state and handle the change in a different useEffect then reset the action to null */
      const decoder = new TextDecoder('utf-8');
      //console.log(decoder.decode(message));

      setLastMessage(message.toString());

      // if (decoder.decode(message) == 'KEEPALIVE') {
      //   return;
      // }
      // try {
      //   const msg = JSON.parse(decoder.decode(message));
      //   console.log(msg.action);
      //   setLastMessage(message.toString());
      //   if (mode && mode == 'REMOTE') {
      //   } else {
      //     if (msg.action) {
      //       switch (msg.action) {
      //         default:
      //           console.log(msg.action);
      //       }
      //     }
      //   }
      // } catch (e) {}
    });
  }, []);

  const host: string = 'io.adafruit.com';
  const clientId: string = `webdisplay_ + ${Math.random()
    .toString(16)
    .substr(2, 8)}`;
  const port: number = 8883;

  const lg_power = () => {
    const msg = `{"device": "lg", "action": "POWER"}`;
    console.log(msg.toString());
    mqttClient.publish('andrewbornand/f/home.audio', msg);
  };

  const indoor_power = () => {
    const msg = `{"device": "onkyo", "action": "POWER", "location": "indoor"}`;
    console.log(msg.toString());
    mqttClient.publish('andrewbornand/f/home.audio', msg);
  };

  const outdoor_power = () => {
    const msg = `{"device": "kenwood", "action": "POWER", "location": "outdoor"}`;
    console.log(msg.toString());
    mqttClient.publish('andrewbornand/f/home.audio', msg);
  };

  const indoor_mute = () => {
    const msg = `{"device": "onkyo", "action": "MUTE", "location": "indoor"}`;
    console.log(msg.toString());
    mqttClient.publish('andrewbornand/f/home.audio', msg);
  };

  const outdoor_mute = () => {
    const msg = `{"device": "kenwood", "action": "MUTE", "location": "outdoor"}`;
    console.log(msg.toString());
    mqttClient.publish('andrewbornand/f/home.audio', msg);
  };

  const outdoor_volume_up = () => {
    const msg = `{"device": "kenwood", "action": "VOLUME_UP", "location": "outdoor"}`;
    console.log(msg.toString());
    mqttClient.publish('andrewbornand/f/home.audio', msg);
  };

  const indoor_volume_up = () => {
    const msg = `{"device": "onkyo", "action": "VOLUME_UP", "location": "indoor"}`;
    console.log(msg.toString());
    mqttClient.publish('andrewbornand/f/home.audio', msg);
  };

  const outdoor_volume_down = () => {
    const msg = `{"device": "kenwood", "action": "VOLUME_DOWN", "location": "outdoor"}`;
    console.log(msg.toString());
    mqttClient.publish('andrewbornand/f/home.audio', msg);
  };

  const indoor_volume_down = () => {
    const msg = `{"device": "onkyo", "action": "VOLUME_DOWN", "location": "indoor"}`;
    console.log(msg.toString());
    mqttClient.publish('andrewbornand/f/home.audio', msg);
  };

  if (mode === 'REMOTE') {
    return (
      <div id='remote'>
        <div id='buttons'>
          <button onClick={outdoor_power}>Outdoor Power</button>
          <br />
          <button onClick={indoor_power}>Indoor Power</button>
          <br />
          <button onClick={outdoor_mute}>Outdoor Mute</button>
          <br />
          <button onClick={indoor_mute}>Indoor Mute</button>
          <br />
          <button onClick={indoor_volume_down}>Indoor Volume Down</button>
          <br />
          <button onClick={indoor_volume_up}>Indoor Volume Up</button>
          <br />
          <button onClick={outdoor_volume_down}>Outdoor Volume Down</button>
          <br />
          <button onClick={outdoor_volume_up}>Outdoor Volume Up</button>
          <br />

          {/* 
          <button onClick={arm}>Arm System</button>
          <br />
          <button onClick={disarm}>Disarm System</button>
          <br />
          <button onClick={ctdown}>Countdown</button>
          <br />
          <button onClick={unlock}>Unlock</button>
          <br />
          <button onClick={resetSensor}>Reset</button>
          <br />
          <button onClick={check}>Check</button>
          <br />
 */}
        </div>
        <div id='message'>
          <textarea value={lastMessage}></textarea>
        </div>
      </div>
    );
  }

  return <div />;
};

export default Application;
