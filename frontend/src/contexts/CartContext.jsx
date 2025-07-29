import React, { createContext, useState, useContext } from "react";
import apiClient from "../api/apiClient";

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartBranchId, setCartBranchId] = useState(null);

  const assumedBranchId = 1;

  const addToCart = async (productToAdd, quantity = 1) => {
    const currentBranchId = cartBranchId || assumedBranchId;

    try {
      const stock = await apiClient.checkStock(
        currentBranchId,
        productToAdd.product_id
      );
      const existingItem = cartItems.find(
        (item) => item.product_id === productToAdd.product_id
      );
      const quantityInCart = existingItem ? existingItem.quantity : 0;

      if (stock.quantity < quantityInCart + quantity) {
        alert(
          `Sorry, only ${stock.quantity} units of '${productToAdd.name}' are available at this branch.`
        );
        return;
      }

      if (cartItems.length === 0) {
        setCartBranchId(currentBranchId);
      }

      setCartItems((prevItems) => {
        if (existingItem) {
          return prevItems.map((item) =>
            item.product_id === productToAdd.product_id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        }
        return [...prevItems, { ...productToAdd, quantity }];
      });
      alert(
        `${quantity} unit(s) of ${productToAdd.name} have been added to your cart!`
      );
    } catch (error) {
      alert(`Error checking stock for ${productToAdd.name}: ${error.message}`);
    }
  };

  const clearCart = () => {
    setCartItems([]);
    setCartBranchId(null);
  };

  const value = { cartItems, cartBranchId, addToCart, clearCart };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  return useContext(CartContext);
};
