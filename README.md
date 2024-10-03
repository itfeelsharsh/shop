# Admin Side (Separate Repo: [shopAdmin](https://github.com/itfeelsharsh/shopAdmin)):
 (made with React + Firebase no server deployment required, can-be hosted on CloudFlare pages, Vercel, Netlify, Firebase Hosting Etc.)

# KamiKoto - Exquisite Japanese Stationery E-Commerce Web App

Welcome to KamiKoto, a beautifully crafted e-commerce platform offering a seamless shopping experience for exquisite Japanese stationery. This project is built using **React.js** and **Firebase**, delivering a delightful UI/UX and mobile-friendly experience for all users.

---

## 🌟 Features

### User Side:

- **Sign In / Sign Up:** Create a new account or log in using email/password.
- **Google / GitHub Authentication:** Sign in quickly using Google or GitHub accounts.
- **Password Reset:** Securely reset forgotten passwords.
- **User Profile Setup:** Update personal information (Profile Picture, Email, Phone, Address).
- **Cart System & Payment Handling:** Add products to the cart and securely process payments.
- **Shipping Details:** Enter shipping information for delivery.
- **Mobile Friendly:** Responsive design for a smooth shopping experience across all devices.

### Admin Side (Separate Repo: [shopAdmin](https://github.com/itfeelsharsh/shopAdmin)):

- **Manage Users:** View user details (Profile Picture, Contact Info), ban users if necessary.
- **Manage Products:** Add, edit, or delete products with detailed information such as:
  - Product Name
  - Description
  - Price (₹)
  - Brand, Stock, and Product Type
  - Primary, Secondary, Tertiary Image URLs
  - Option to feature the product on the homepage

---

## 🚀 Getting Started

### Setup & Installation

1. **Clone the Repository**

   ```bash
   git clone https://github.com/itfeelsharsh/kamikoto.git
   cd kamikoto
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Start the Development Server**

   ```bash
   npm start
   ```

4. **Firebase Configuration:**
   - Add your Firebase project configuration in `firebase.js`.
   - Set up Firestore Database and Authentication in [Firebase Console](https://console.firebase.google.com).
   - Update Firestore security rules accordingly.

---

## 🛠 Firebase Firestore Configuration

Set up Firebase Firestore by following these steps:

1.  Go to [Firebase Console](https://console.firebase.google.com) and enable **Firestore** and **Authentication**.

2.  Set Firestore rules for secure data access:

 ```json
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    match /users/{userId} {
      allow read: if request.auth != null && 
                  (request.auth.uid == userId || 
                   get(/databases/$(database)/documents/users/$(request.auth.uid)).data.userRole == 'Admin');
      allow write: if request.auth != null && request.auth.uid == userId;
    }

    match /products/{productId} {
      allow read: if true;
      allow create, update, delete: if request.auth != null && 
                                     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.userRole == 'Admin';
    }

    match /users/{userId}/cart/{cartItemId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    match /users/{userId}/orders/{orderId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    match /products/{productId}/reviews/{reviewId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.userId;
    }

  }
}
```

3.  For **Admin Panel Access**, go to Firestore and add the following field to any user you want to give admin rights:

    ```plaintext
    userRole : Admin
    ```

---

## ⚡️ Admin Panel Access

To use the Admin Panel ([shopAdmin](https://github.com/itfeelsharsh/shopAdmin)):

1. Register as a normal user.
2. In the Firestore Console, find the user in the `users` collection and update their role:

   ```plaintext
   userRole : Admin (string)
   ```

3. The user can now access the admin dashboard to manage products and users.

---

## 📝 Notes

- **Optimized UI/UX:** The application uses clean, modern design principles for a smooth user experience, modeled after Apple’s elegant design ethos.
- **Mobile-Friendly:** Built with responsive design to ensure users have a great experience on both desktop and mobile devices.
- **Secure Authentication:** Firebase Authentication provides seamless sign-in options, including Google and GitHub for faster logins.
- **Easy Product Management:** Admins can quickly add, edit, or remove products with all the necessary details, including images, stock, and pricing.
- **Performance-Oriented:** Leveraging Firebase Firestore for fast data access and real-time updates.
- **Great for E-Commerce Projects:** The codebase is structured to be scalable and can be extended for various other e-commerce needs.

---

## 🧑‍💻 Tech Stack

- **Frontend:** React.js
- **Backend/Database:** Firebase (Firestore, Authentication)
- **Deployment:** Firebase Hosting (or any other service)
