import React from 'react';
import { Helmet } from 'react-helmet-async';
import AuthExperience from '../components/AuthExperience';

export default function SignUp() {
  return (
    <>
      <Helmet>
        <title>Create Account | KamiKoto</title>
        <meta
          name="description"
          content="Join KamiKoto today and keep your favorite pieces and orders together."
        />
      </Helmet>
      <AuthExperience initialMode="signup" />
    </>
  );
}
