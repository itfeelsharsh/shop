/* eslint-disable react/forbid-prop-types */
import { ADMIN_DASHBOARD, SIGNIN } from 'constants/routes';
import PropType from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { Redirect, Route } from 'react-router-dom';

const PrivateRoute = ({
  isAuth, role, component: Component, ...rest
}) => (
  <Route
    {...rest}
    component={(props) => {
      if (isAuth && role === 'USER') {
        return (
          <main className='content'>
            <Component {...props} />
          </main>
        );
      }

      if (isAuth && role === 'ADMIN') {
        return <Redirect to={ADMIN_DASHBOARD} />;
      }

      return (
        <Redirect to={{
          pathname: SIGNIN,
          state: { from: props.location }
        }}
        />
      );
    }}
  />
);

PrivateRoute.defaultProps = {
  isAuth: false,
  role: 'USER'
};

PrivateRoute.propTypes = {
  isAuth: PropType.bool,
  role: PropType.string,
  component: PropType.func.isRequired,
  rest: PropType.any
};

const mapStateToProps = ({ auth }) => ({
  isAuth: !!auth,
  role: auth?.role || ''
});

export default connect(mapStateToProps)(PrivateRoute);
