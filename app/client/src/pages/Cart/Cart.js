import React, { useContext } from "react";
import useStyles from "./CartStyles";
import CartItem from "./CartItem";
import { Box, Container } from "@material-ui/core";
import CartTotals from "./CartTotals";
import CartContext from "../../context/CartContext";

export default function SignUp() {
  const classes = useStyles();

  const context = useContext(CartContext);
  console.log(context.cart);

  return (
    <div className={classes.cartContainer}>
      <h1 className={classes.formTitle}>your cart</h1>
      <Box className={classes.cartInfoBox}>
        <Box
          style={{
            display: "inline-flex",
            flexDirection: "column",
          }}
        >
          {context.cart.length <= 0 && (
            <p style={{ color: "white" }}>No Items in the Cart</p>
          )}
          {context.cart.map((cartItem) => {
            return <CartItem cartItem={cartItem} />;
          })}
        </Box>
        <Container
          style={{
            padding: 0,
          }}
        >
          <CartTotals />
        </Container>
      </Box>
    </div>
  );
}