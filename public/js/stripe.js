import axios from 'axios';

const stripe = Stripe(
  'pk_test_51Ps1kj2LkADhGgv9ogZHTVujBNL2FtQgTuJsuiWyubna9y3gkTJNu3xP9Xk5EOYw2F8Mrd5EbGEjEqpPxBuM2BFh00Ek1E5noG'
);

export const bookTour = async (tourID) => {
  //1)get the checkout session from the server
  try {
    const session = await axios(`http://127.0.0.1:8000/api/v1/bookings/checkout-session/${tourID}`);
    console.log(session);

    //2)Create checkout form + charge the credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (error) {
    showAlert('error', error);
  }
};
