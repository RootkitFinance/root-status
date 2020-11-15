import { combineReducers } from "redux";

import userReducer from "./user";
import transactionsReducer from "./transactions";

const rootReducer = combineReducers({
  user: userReducer,
  transactions: transactionsReducer,
});

export default rootReducer;
