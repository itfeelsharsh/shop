import { SIGNIN_SUCCESS, SIGNOUT_SUCCESS } from 'constants/constants';

const initState = null;

export default (state = initState, action) => {
  switch (action.type) {
    case SIGNIN_SUCCESS:
      return {
        id: action.payload.id,
        role: action.payload.role,
        provider: action.payload.provider
      };
    case SIGNOUT_SUCCESS:
      return null;
    default:
      return state;
  }
};
