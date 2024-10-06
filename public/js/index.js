import '@babel/polyfill';
import { login, logout } from './login';
import { updateSettings } from './updateSettings';
//import { logout } from '../../controllers/authController
import { bookTour } from './stripe';
import { initializeMap } from './mapbox';
import { signups } from './signup';

document.addEventListener('DOMContentLoaded', () => {
  console.log('Document is ready');
  initializeMap();
});

// Ensure the function is called if the page is already loaded
if (document.readyState === 'complete') {
  console.log('Document already complete');
  initializeMap();
}

//DOM ELEMENTS
const loginForm = document.querySelector('.form--login');
const logOutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');
const bookBtn = document.getElementById('book-tour');
const SignedUpForm = document.querySelector('.form--SignUp');
//values

//delegation
if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}

if (SignedUpForm) {
  SignedUpForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    signups(name,email, password,passwordConfirm);
  });
}

if (logOutBtn) logOutBtn.addEventListener('click', logout);

if (userDataForm) {
  userDataForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);
    console.log(form);
    updateSettings(form, 'data');
  });
}

if (userPasswordForm) {
  userPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    document.querySelector('.btn--save-password').textContent = 'Updating...';
    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    await updateSettings(
      {
        passwordCurrent: passwordCurrent,
        password: password,
        passwordConfirm: passwordConfirm,
      },
      'password'
    );

    document.querySelector('.btn--save-password').textContent = 'Save Password';
    passwordCurrent = document.getElementById('password-current').value = '';
    password = document.getElementById('password').value = '';
    passwordConfirm = document.getElementById('password-confirm').value = '';
  });
}

if (bookBtn) {
  bookBtn.addEventListener('click', (e) => {
    e.target.textContent = 'Proccessing....';
    const tourID = e.target.dataset.tourId;
    console.log(tourID);
    bookTour(tourID);
  });
}
