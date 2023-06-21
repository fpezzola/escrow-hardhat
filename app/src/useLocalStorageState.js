import { useEffect, useState } from "react";

const defaultOptions = {
  initialValue: {},
  deserializer: (data) => JSON.parse(data),
  serializer: (data) => JSON.stringify(data),
};

function getItem(key) {
  return window.localStorage.getItem(key);
}

function setItem(key, val) {
  return window.localStorage.setItem(key, val);
}

/**
 * This hook persist the state in the window.localStorage and takes care of keeping that synchronization.
 *
 * @param key the key you want to use to store the info in the window.localStorage
 * @param stateOptions
 * @returns [state,setState]
 */
function useLocalStorageState(key, stateOptions = defaultOptions) {
  const { initialValue, deserializer, serializer } = {
    ...defaultOptions,
    ...stateOptions,
  };
  const storageKey = key;

  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [state, setState] = useState(() => {
    const data = getItem(storageKey);
    if (!data) {
      setItem(storageKey, initialValue);
      return initialValue;
    }
    return deserializer ? deserializer(data) : data;
  });

  useEffect(() => {
    setItem(storageKey, serializer ? serializer(state) : state);
  }, [state, storageKey, serializer]);
  return [state, setState];
}

export default useLocalStorageState;
