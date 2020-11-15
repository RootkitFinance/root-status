import { saveState, loadState } from "../localStorage";

const LOCAL_STORAGE_KEY = "user";
const persistedState = loadState(LOCAL_STORAGE_KEY) || {};

const initialState = {
  ...persistedState,
};

const userReducer = (state = initialState, action) => {
  const newState = (function () {
    switch (action.type) {
      default:
        return state;
    }
  })();
  saveState(LOCAL_STORAGE_KEY, newState);
  return { ...newState };
};

export default userReducer;
