# Context

This directory contains React Contexts for global state management.

## `AuthContext.js`
Manages the user's authentication state.
- **`user`**: The currently logged-in user object.
- **`login(email, password)`**: Authenticates user and stores token in Axios headers.
- **`register(userData)`**: Registers a new user.
- **`logout()`**: Clears user state and tokens.
