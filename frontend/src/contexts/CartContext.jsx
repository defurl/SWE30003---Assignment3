import React, { createContext, useState, useContext } from "react";
import apiClient from "../api/apiClient";

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartBranchId, setCartBranchId] = useState(null); // <-- NEW: State to lock the branch

  // For simplicity in this demo, we are assuming all orders originate from Branch 1
  const assumedBranchId = 1;

  const addToCart = async (productToAdd) => {
    const currentBranchId = cartBranchId || assumedBranchId;

    try {
      // Rule 1: Always check stock before adding
      const stock = await apiClient.checkStock(
        currentBranchId,
        productToAdd.product_id
      );

      const existingItem = cartItems.find(
        (item) => item.product_id === productToAdd.product_id
      );
      const quantityInCart = existingItem ? existingItem.quantity : 0;

      // Rule 2: Check if there is enough stock
      if (stock.quantity <= quantityInCart) {
        alert(`Sorry, '${productToAdd.name}' is out of stock at this branch.`);
        return;
      }

      // If cart is empty, set the branch ID
      if (cartItems.length === 0) {
        setCartBranchId(currentBranchId);
      }

      setCartItems((prevItems) => {
        if (existingItem) {
          return prevItems.map((item) =>
            item.product_id === productToAdd.product_id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        }
        return [...prevItems, { ...productToAdd, quantity: 1 }];
      });
      alert(`${productToAdd.name} has been added to your cart!`);
    } catch (error) {
      alert(`Error checking stock for ${productToAdd.name}: ${error.message}`);
    }
  };

  const clearCart = () => {
    setCartItems([]);
    setCartBranchId(null); // <-- NEW: Reset the branch on clear
  };

  // Expose cartBranchId so the OrderPage can use it
  const value = { cartItems, cartBranchId, addToCart, clearCart };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  return useContext(CartContext);
};
