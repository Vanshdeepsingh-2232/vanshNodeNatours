import axios from 'axios';
import { showAlert } from './alerts';
export const login = async (email, password) => {
  const res = await axios
    .post('/api/v1/users/login', {
      email: email,
      password: password,
    })
    .then(function (res) {
      if (res.data.status === 'success') {
        showAlert('success', 'Logged in Successfully');
        window.setTimeout(() => {
          location.assign('/');
        }, 1500);
      }
    })
    .catch(function (error) {
      showAlert('error', error.res.data.message);
    });
};

export const logout = async () => {
  try {
    const res = await axios.get(' /api/v1/users/logout');
    if (res.data.status === 'success') location.reload(true);
  } catch (error) {
    showAlert('error', 'Error Logging Out');
  }
};
