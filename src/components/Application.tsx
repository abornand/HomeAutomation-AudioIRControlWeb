import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useRive, useStateMachineInput } from 'rive-react';
import useSound from 'use-sound';
import useWebSocket, { ReadyState } from 'react-use-websocket';
// import Rive from '@rive-app/react-canvas';
import './Application.scss';
import { icons } from './Icons';
import { sounds } from './Sounds';
import { animations } from './Animations';

const Application: React.FC = () => {
  // const [counter, setCounter] = useState(0);
  // const [darkTheme, setDarkTheme] = useState(true);
  const STATE_MACHINE_NAME = 'State Machine 1';
  const INPUT_NAME = 'Reveal';
  const SOCKET_URL =
    'wss://g72mfojt9c.execute-api.us-west-1.amazonaws.com/shared';

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
  // const [playAlarm] = useSound(sounds.alarm, { volume: 1.0 });

  //Public API that will echo messages sent to it back to the client
  const [socketUrl, setSocketUrl] = useState(SOCKET_URL);
  const [messageHistory, setMessageHistory] = useState([]);
  const didUnmount = useRef(false);

  const { sendMessage, lastMessage, readyState } = useWebSocket(socketUrl, {
    shouldReconnect: (closeEvent) => {
      /*
        useWebSocket will handle unmounting for you, but this is an example of a 
        case in which you would not want it to automatically reconnect
      */
      return didUnmount.current === false;
    },
    reconnectAttempts: 10,
    reconnectInterval: 3000,

    onOpen: (event: WebSocketEventMap['open']) => {
      console.log(event);
    },
    onMessage: (event: WebSocketEventMap['message']) => {
      console.log(event);
      const data = JSON.parse(event.data);
      console.log(event.data);
      console.log(data.action);

      // playAlarm();
      revealInput && revealInput.fire();
    },
  });

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

  const connectionStatus = {
    [ReadyState.CONNECTING]: 'Connecting',
    [ReadyState.OPEN]: 'Open',
    [ReadyState.CLOSING]: 'Closing',
    [ReadyState.CLOSED]: 'Closed',
    [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
  }[readyState];

  // levelInput is a number state machine input. To transition the state machine,
  // we need to set the value to a number. For this state machine input, we need
  // to set to 0, 1 or 2 for a state transition to occur.
  const levelInput = useStateMachineInput(rive, STATE_MACHINE_NAME, INPUT_NAME);

  /**
   * On component mount
   */
  useEffect(() => {
    // const useDarkTheme = parseInt(localStorage.getItem('dark-mode'));
    // if (isNaN(useDarkTheme)) {
    //   setDarkTheme(true);
    // } else if (useDarkTheme == 1) {
    //   setDarkTheme(true);
    // } else if (useDarkTheme == 0) {
    //   setDarkTheme(false);
    // }
  }, []);

  /**
   * On Dark theme change
   */
  // useEffect(() => {
  //   if (darkTheme) {
  //     localStorage.setItem('dark-mode', '1');
  //     document.body.classList.add('dark-mode');
  //   } else {
  //     localStorage.setItem('dark-mode', '0');
  //     document.body.classList.remove('dark-mode');
  //   }
  // }, [darkTheme]);

  /**
   * Toggle Theme
   */
  // function toggleTheme() {
  //   setDarkTheme(!darkTheme);
  // }

  return (
    <div id='main'>
      <div id='animation'>
        <RiveComponent />
      </div>
      <div id='graphics'>
        <div className='time' id='minutes'>
          5
        </div>
      </div>
    </div>
  );
};

export default Application;
