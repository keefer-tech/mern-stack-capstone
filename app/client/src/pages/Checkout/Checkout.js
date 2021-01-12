import React from "react";
import { API } from "../../util/fetch";
import "react-square-payment-form/lib/default.css";
import {
  SquarePaymentForm,
  CreditCardNumberInput,
  CreditCardExpirationDateInput,
  CreditCardCVVInput,
  CreditCardSubmitButton,
} from "react-square-payment-form";

export default class Checkout extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      errorMessages: [],
    };
  }

  submitPayment = async (nonce, token) => {
    try {
      const { data } = await API.post(`/payments/${nonce}/${token}`);
      if (data) return data;
    } catch (e) {
      console.log(e.message);
    }
  };

  cardNonceResponseReceived = async (
    errors,
    nonce,
    cardData,
    buyerVerificationToken
  ) => {
    if (errors) {
      this.setState({ errorMessages: errors.map((error) => error.message) });
      return;
    }

    this.setState({ errorMessages: [] });
    alert(
      "nonce created: " +
        nonce +
        ", buyerVerificationToken: " +
        buyerVerificationToken
    );
    const paymentResponse = await this.submitPayment(
      nonce,
      buyerVerificationToken
    );
    console.log({ paymentResponse });
  };

  createVerificationDetails() {
    return {
      amount: "100.00",
      currencyCode: "USD",
      intent: "CHARGE",
      billingContact: {
        familyName: "Smith",
        givenName: "John",
        email: "jsmith@example.com",
        country: "GB",
        city: "London",
        addressLines: ["1235 Emperor's Gate"],
        postalCode: "SW7 4JA",
        phone: "020 7946 0532",
      },
    };
  }

  render() {
    return (
      <div>
        <h1>checkout items</h1>

        <SquarePaymentForm
          sandbox={true}
          applicationId={"sandbox-sq0idb-FjbIBPKhnJ98JvdVZumxIA"} //SANDBOX_APPLICATION_ID
          locationId={"LWB7HW6Z45KS9"} //SANDBOX_LOCATION_ID
          cardNonceResponseReceived={this.cardNonceResponseReceived}
          createVerificationDetails={this.createVerificationDetails}
        >
          <fieldset className="sq-fieldset">
            <CreditCardNumberInput />
            <div className="sq-form-third">
              <CreditCardExpirationDateInput />
            </div>

            <div className="sq-form-third">
              <CreditCardCVVInput />
            </div>
          </fieldset>

          <CreditCardSubmitButton>Pay $1.00</CreditCardSubmitButton>
        </SquarePaymentForm>

        <div className="sq-error-message">
          {this.state.errorMessages.map((errorMessage) => (
            <li key={`sq-error-${errorMessage}`}>{errorMessage}</li>
          ))}
        </div>
      </div>
    );
  }
}