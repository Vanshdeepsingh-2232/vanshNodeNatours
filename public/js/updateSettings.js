import axios from 'axios';

import { showAlert } from './alerts';

//type can be a Password or Email,Name
export const updateSettings = async (data, type) => {
  try {
    console.log('Print the data in ', data);

    const url =
      type === 'password'
        ? 'http://127.0.0.1:8000/api/v1/users/updatePassword'
        : 'http://127.0.0.1:8000/api/v1/users/updateMe';

    const res = await axios({
      method: 'PATCH',
      url,
      data,
    });
    if (res.data.status === 'success') {
      showAlert('success', `${type.toUpperCase()} Data Updated Successfully!`);
    }
  } catch (error) {
    showAlert('error', error.response.data.message);
  }
};
