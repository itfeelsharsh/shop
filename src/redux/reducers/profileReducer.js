import { CLEAR_PROFILE, SET_PROFILE, UPDATE_PROFILE_SUCCESS } from 'constants/constants';
// import profile from 'static/profile.jpg';
// import banner from 'static/banner.jpg';

 
export default (state = {}, action) => {
  switch (action.type) {
    case SET_PROFILE:
      return action.payload;
    case UPDATE_PROFILE_SUCCESS:
      return {
        ...state,
        ...action.payload
      };
    case CLEAR_PROFILE:
      return {};
    default:
      return state;
  }
};
