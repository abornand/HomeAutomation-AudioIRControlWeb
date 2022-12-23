import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useRive, useStateMachineInput } from 'rive-react';
import useSound from 'use-sound';
// import useWebSocket, { ReadyState } from 'react-use-websocket';
import moment, { Duration } from 'moment';
import mqtt, { IClientOptions, MqttClient } from 'precompiled-mqtt';
import { useCountdownTimer } from '../hooks/useCountdownTimer';
// import { useTimer } from 'use-timer';
// import Rive from '@rive-app/react-canvas';
import './Application.scss';
import { icons } from './Icons';
import { sounds } from './Sounds';
import { animations } from './Animations';
import { DISPLAY_STATES } from './DisplayState';
import { ACTIONS } from './Actions';

const Application: React.FC = () => {
  const [displayState, setDisplayState] = useState(DISPLAY_STATES.INITIALIZING);
  // const [counter, setCounter] = useState(0);
  // const [darkTheme, setDarkTheme] = useState(true);
  const STATE_MACHINE_NAME = 'State Machine 1';
  const INPUT_NAME = 'Reveal';
  const SOCKET_URL =
    'wss://g72mfojt9c.execute-api.us-west-1.amazonaws.com/shared';
  const TIMER_DURATION = moment.duration(1, 'minutes');

  const display = animations.display;

  const { RiveComponent, rive } = useRive({
    src: animations.display,
    stateMachines: STATE_MACHINE_NAME,
    artboard: 'MainArtBoard',
    autoplay: true,
  });

  const revealInput = useStateMachineInput(
    rive,
    STATE_MACHINE_NAME,
    INPUT_NAME,
  );

  const [playAlarm] = useSound(sounds.alarm, { volume: 1.0 });
  const [playBeep, controlBeep] = useSound(sounds.beep1s, {
    volume: 0.5,
    loop: true,
  });

  const [timer] = useState(moment.duration(TIMER_DURATION));
  const { countdown, start, reset, pause, isRunning } = useCountdownTimer({
    timer,
    onExpire: () => {
      setActions((actions) => [...actions, 'Expire Callback']);
      console.log('expire');
      controlBeep.stop();
    },
    onReset: () => {
      console.log('reset');
      setActions((actions) => [...actions, 'Reset Callback']);
    },
    interval: 50,
    // onBeep: () => {
    //   playBeep();
    // },
  });

  const [actions, setActions] = useState<string[]>([]);

  const logAction = (message: string, action: () => void) => {
    setActions((actions) => [...actions, message]);
    action();
  };

  // const { time, start, pause, reset, status } = useTimer({
  //   initialTime: 300, //TIMER_DURATION.asMilliseconds() / 100,
  //   timerType: 'DECREMENTAL',
  //   interval: 1000,
  //   onTimeUpdate: (time) => {
  //     if (time <= 0) {
  //       console.log('stop');
  //       stop();
  //     }
  //     // const countdown = moment(time);
  //     // console.log(
  //     //   `${countdown.minutes()} ${countdown.seconds()} ${countdown.milliseconds()}`,
  //     // );
  //     console.log(time);
  //   },
  // });

  //Public API that will echo messages sent to it back to the client
  const [socketUrl, setSocketUrl] = useState(SOCKET_URL);
  const [messageHistory, setMessageHistory] = useState([]);
  const didUnmount = useRef(false);

  const [mqttClient, setMqttClient] = useState<MqttClient>();

  useEffect(() => {
    var options: IClientOptions = {
      protocol: 'mqtts',
      // hostname: 'io.adafruit.com',
      // port: 8883,
      keepalive: 30,
      // protocolVersion: 4,
      // clean: true,
      reconnectPeriod: 1000,
      connectTimeout: 30 * 1000,
      // rejectUnauthorized: false,
      username: 'andrewbornand',
      password: 'aio_lkYw416dlB2zQ1YTkbXYRQGZ6gdv',
    };
    // var client = mqtt.connect('mqtts://io.adafruit.com:8883', options);
    const client = mqtt.connect('mqtts://io.adafruit.com:443/mqtt', options);
    client.subscribe('andrewbornand/f/xmas-2022.xmas-bot');
    client.on('connect', () => {
      console.log('CONNECTED to broker');
    });
    client.on('message', (topic, message) => {
      /* set state and handle the change in a different useEffect then reset the action to null */
      const decoder = new TextDecoder('utf-8');
      const msg = JSON.parse(decoder.decode(message));
      console.log(msg.action);

      if (msg.action) {
        switch (msg.action) {
          case ACTIONS.START:
            setDisplayState(DISPLAY_STATES.WAITING);
            console.log('Waiting...');
          case ACTIONS.COUNTDOWN:
            setDisplayState(DISPLAY_STATES.COUNTDOWN);
            break;
          case ACTIONS.IDLE:
            break;
          default:
        }
      }
    });
  }, []);

  useEffect(() => {
    switch (displayState) {
      case DISPLAY_STATES.COUNTDOWN:
        console.log('Countdown...');
        console.log(revealInput);
        revealInput && revealInput.fire();
        start();
        playBeep();
        break;
      default:
    }
  }, [displayState]);

  const startCountdown = () => {};

  // const { sendMessage, lastMessage, readyState } = useWebSocket(socketUrl, {
  //   shouldReconnect: (closeEvent) => {
  //     /*
  //       useWebSocket will handle unmounting for you, but this is an example of a
  //       case in which you would not want it to automatically reconnect
  //     */
  //     return didUnmount.current === false;
  //   },
  //   reconnectAttempts: 10,
  //   reconnectInterval: 3000,

  //   onOpen: (event: WebSocketEventMap['open']) => {
  //     console.log(event);
  //   },
  //   onMessage: (event: WebSocketEventMap['message']) => {
  //     console.log(event);
  //     const data = JSON.parse(event.data);
  //     console.log(event.data);
  //     console.log(data.action);

  //     setDisplayState(DISPLAY_STATES.COUNTDOWN);
  //     revealInput && revealInput.fire();
  //     start();
  //     playBeep();
  //     //playAlarm();
  //   },
  // });

  useEffect(() => {
    return () => {
      didUnmount.current = true;
    };
  }, []);

  // useEffect(() => {
  //   if (lastMessage !== null) {
  //     setMessageHistory((prev) => prev.concat(lastMessage));
  //   }
  // }, [lastMessage, setMessageHistory]);

  // const handleClickChangeSocketUrl = useCallback(
  //   () => setSocketUrl('wss://demos.kaazing.com/echo'),
  //   []
  // );

  //const handleClickSendMessage = useCallback(() => sendMessage('Hello'), []);

  // const connectionStatus = {
  //   [ReadyState.CONNECTING]: 'Connecting',
  //   [ReadyState.OPEN]: 'Open',
  //   [ReadyState.CLOSING]: 'Closing',
  //   [ReadyState.CLOSED]: 'Closed',
  //   [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
  // }[readyState];

  const host: string = 'io.adafruit.com';
  const clientId: string = `webdisplay_ + ${Math.random()
    .toString(16)
    .substr(2, 8)}`;
  const port: number = 8883;

  // const url = `mqtt://${host}:${port}`;
  // const options = {
  //   keepalive: 30,
  //   protocolId: 'mqtt',
  //   protocolVersion: 4,
  //   clean: true,
  //   reconnectPeriod: 1000,
  //   connectTimeout: 30 * 1000,
  //   rejectUnauthorized: false,
  //   clientId,
  //   username: 'andrewbornand',
  //   password: 'aio_lkYw416dlB2zQ1YTkbXYRQGZ6gdv',
  // };

  const CountdownDisplay = () => {
    const min = Math.max(countdown.minutes(), 0).toString().padStart(2, '0');
    const sec = Math.max(countdown.seconds(), 0).toString().padStart(2, '0');
    const milli = Math.max(countdown.milliseconds(), 0)
      .toString()
      .padStart(3, '0');
    return (
      <div id='graphics'>
        <div className='time' id='minutes'>
          {min}
        </div>
        <div className='time' id='seconds'>
          {sec}
        </div>
        <div className='time' id='milliseconds'>
          {milli}
        </div>
      </div>
    );
  };

  return (
    <div id='main'>
      <div id='animation'>
        <RiveComponent />
      </div>
      {(displayState === DISPLAY_STATES.COUNTDOWN ||
        displayState === DISPLAY_STATES.FAIRGAME ||
        displayState === DISPLAY_STATES.OPENED) && <CountdownDisplay />}
    </div>
  );
};

export default Application;
