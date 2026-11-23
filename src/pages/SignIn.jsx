import React from 'react';
import { Helmet } from 'react-helmet-async';
import AuthExperience from '../components/AuthExperience';

export default function SignIn() {
  return (
    <>
      <Helmet>
        <title>Sign In | KamiKoto</title>
        <meta
          name="description"
          content="Sign in to your KamiKoto account to access your profile, orders, and saved pieces."
        />
      </Helmet>
      <AuthExperience initialMode="login" />
    </>
  );
}
