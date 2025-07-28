import React, { createContext, useState, useContext } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);

    const addToCart = (productToAdd) => {
        setCartItems(prevItems => {
            const existingItem = prevItems.find(item => item.product_id === productToAdd.product_id);
            if (existingItem) {
                // If item already exists, just increase quantity
                return prevItems.map(item =>
                    item.product_id === productToAdd.product_id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            // Otherwise, add new item with quantity of 1
            return [...prevItems, { ...productToAdd, quantity: 1 }];
        });
        alert(`${productToAdd.name} has been added to your cart!`);
    };

    // --- NEW FUNCTION ---
    const clearCart = () => {
        setCartItems([]);
    };

    const value = { cartItems, addToCart, clearCart };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    return useContext(CartContext);
};
