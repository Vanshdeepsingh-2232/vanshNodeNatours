import axios from 'axios';
import { showAlert } from './alerts';
export const signups = async (name, email, password, passwordConfirm) => {
  const res = await axios
    .post('http://127.0.0.1:8000/api/v1/users/signup', {
      name: name,
      email: email,
      password: password,
      passwordConfirm: passwordConfirm,
    })
    .then(function (res) {
      if (res.data.status === 'success') {
        showAlert('success', 'SignedUP in Successfully');
        window.setTimeout(() => {
          location.assign('/');
        }, 1500);
      }
    })
    .catch(function (error) {
      showAlert('error', error.res.data.message);
    });
};
