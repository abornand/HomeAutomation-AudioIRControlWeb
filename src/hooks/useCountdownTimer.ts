import { useCallback, useEffect, useReducer } from 'react';
import moment, { Moment } from 'moment';

type Actions =
  | { type: 'START' }
  | { type: 'RESET'; payload: number }
  | { type: 'PAUSE' }
  | { type: 'RUNNING' }
  | { type: 'TICK'; payload: number };

type State = {
  canStart: boolean;
  countdown: moment.Duration;
  lastTime: moment.Moment;
  isRunning: boolean;
};

function reducer(state: State, action: Actions) {
  switch (action.type) {
    case 'START':
      return {
        ...state,
        canStart: state.countdown.asMilliseconds() !== 0,
        lastTime: moment(),
      };
    case 'RESET':
      return {
        ...state,
        countdown: moment.duration(action.payload),
        canStart: false,
        isRunning: false,
      };
    case 'PAUSE':
      return {
        ...state,
        canStart: false,
        isRunning: false,
      };
    case 'RUNNING':
      return {
        ...state,
        isRunning: true,
      };
    case 'TICK':
      return {
        ...state,
        countdown: state.countdown.subtract(action.payload),
        lastTime: moment(),
      };
    /* istanbul ignore next */
    default:
      return state;
  }
}

export interface ICountdownTimerParams {
  /**
   * Countdown time in milliseconds. // moment.Duration
   */
  timer: moment.Duration;
  /**
   * Default: 1000.
   * Interval between ticks in milliseconds.
   */
  interval?: number;
  /**
   * Default: false.
   * Determines if the countdown will start ticking on mount. This value has no effect on
   * a timer after it has expired or been reset.
   */
  autostart?: boolean;
  /**
   * Default: false
   * Determines if the countdown will expire immediately when ticking to 0. If false,
   * the timer will first set countdown to 0 and then expire on the next interval tick.
   */
  expireImmediate?: boolean;
  /**
   * Default: true.
   * Reset the countdown to it's initial value after expiration. If false,
   * the countdown will remain at 0 in a non-running state until reset.
   */
  resetOnExpire?: boolean;
  /**
   * Callback fired on countdown expiration.
   */
  onExpire?: () => void;
  /**
   * Callback fired when countdown is reset, either by setting resetOnExpire to true
   * or explicitly calling the reset method.
   */
  onReset?: () => void;
  onBeep?: () => void;
}

export type CountdownTimerResults = {
  /**
   * Current value of the countdown.
   */
  countdown: moment.Duration;
  /**
   * Is the countdown currently ticking.
   */
  isRunning: boolean;
  /**
   * Start a non-running and non-expired timer. If countdown has expired and
   * resetOnExpire = false, reset must be called before starting again.
   */
  start: () => void;
  /**
   * Reset a countdown to it's initial state.
   */
  reset: () => void;
  /**
   * Pause a running countdown.
   */
  pause: () => void;
};

/**
 * Create a configurable countdown timer.
 */
export function useCountdownTimer({
  timer,
  interval = 1000,
  autostart = false,
  expireImmediate = false,
  resetOnExpire = true,
  onExpire,
  onReset,
  onBeep,
}: ICountdownTimerParams): CountdownTimerResults {
  const [state, dispatch] = useReducer(reducer, {
    canStart: autostart,
    countdown: timer,
    lastTime: moment(),
    isRunning: false,
  });

  function start() {
    dispatch({ type: 'START' });
  }

  function pause() {
    dispatch({ type: 'PAUSE' });
  }

  function initStopped(time: moment.Duration) {
    dispatch({ type: 'RESET', payload: time.asMilliseconds() });
  }

  const reset = useCallback(() => {
    initStopped(timer);
    if (onReset && typeof onReset === 'function') {
      onReset();
    }
  }, [timer, onReset]);

  const expire = useCallback(() => {
    initStopped(resetOnExpire ? timer : moment.duration(0));
    if (onExpire && typeof onExpire === 'function') {
      onExpire();
    }
  }, [timer, onExpire, resetOnExpire]);

  const beep = useCallback(() => {
    onBeep();
  }, [timer, onBeep]);

  useEffect(() => {
    function tick() {
      const countdownDuration = state.countdown as moment.Duration;
      const diff = moment().diff(state.lastTime);
      // if (moment().second() !== state.lastTime.second()) {
      //   console.log('beep');
      //   beep();
      // }
      if (
        countdownDuration.asMilliseconds() <= 0 ||
        (expireImmediate && diff - countdownDuration.asMilliseconds() <= 0)
      ) {
        expire();
      } else {
        dispatch({ type: 'TICK', payload: diff });
      }
    }

    let id: NodeJS.Timeout;
    if (state.canStart) {
      id = setInterval(tick, interval);
      if (!state.isRunning) {
        dispatch({ type: 'RUNNING' });
      }
    }
    return () => clearInterval(id);
  }, [
    expire,
    expireImmediate,
    interval,
    state.canStart,
    state.countdown,
    state.isRunning,
  ]);

  return {
    countdown: state.countdown as moment.Duration,
    isRunning: state.isRunning,
    start,
    reset,
    pause,
  };
}
