# Car-Listing

This project is a car listing platform built with Next.js, designed to provide a seamless experience for users to browse, search, and book test drives for various cars. It leverages AI for image processing, Clerk for authentication, and Prisma for database management.

[![JavaScript](https://img.shields.io/badge/JavaScript-%23F7DF1E.svg?style=for-the-badge&logo=javascript&logoColor=black)]()
[![NextJS](https://img.shields.io/badge/Next.js-%23000000.svg?style=for-the-badge&logo=next.js&logoColor=white)]()
[![React](https://img.shields.io/badge/React-%2320232A.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)]()
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)]()
[![Shadcn UI](https://img.shields.io/badge/Shadcn%20UI-%23000000.svg?style=for-the-badge&logo=shadcnui&logoColor=white)]()
[![Prisma](https://img.shields.io/badge/Prisma-%23000000.svg?style=for-the-badge&logo=prisma&logoColor=white)]()
[![Google Gemini](https://img.shields.io/badge/Google%20Gemini-%23ffffff.svg?style=for-the-badge&logo=google-gemini&logoColor=black)]()

## Important Links

- **Author's Profile** : [Shivam Kumar](https://www.linkedin.com/in/shivam-web-developer-designer/)
- **Live Demo**: [Click Here](https://vehiql-listing.vercel.app/)

## Table of Contents

- [Description](#description)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [How to Use](#how-to-use)
- [License](#license)

## Description

The Car-Listing project offers a comprehensive solution for managing car listings, booking test drives, and providing an admin interface for dealerships. It integrates several modern technologies to enhance user experience and streamline administrative tasks.

## Features

- 🚗 **Car Listing Management:** Allows dealerships and admins to add, update, and delete car listings.
- ✨ **AI-Powered Image Search:** Uses Google Gemini API to extract car details from images, making listing creation easier.
- 📅 **Test Drive Booking:** Enables users to book test drives and manage their reservations.
- ❤️ **Wishlist Functionality:** Users can save cars to their wishlist for later viewing.
- 🛡️ **User Authentication:** Utilizes Clerk for secure user authentication and role management.
- 🎛️ **Dealership Management:** Allows admins to manage dealerships and their information.
- ⚙️ **Settings:** Enables dealerships to manage their working hours and other information.
- 🌙 **Theme Support:** Offers both light and dark themes.
- 🔑 **Admin Dashboard:** Provides a dashboard for managing cars, test drives, and users.

## Tech Stack

- **Framework:** Next.js
- **UI Library:** Shadcn UI, Radix UI, Tailwind CSS
- **Language:** JavaScript
- **Authentication:** Clerk
- **Database:** Prisma Supabase
- **AI:** Google Gemini API
- **Image Storage:** Supabase

## Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/Shivam-AK/Car-Listing
   ```

2. **Navigate to the project directory:**

   ```bash
   cd Car-Listing
   ```

3. **Install dependencies:**

   ```bash
   npm install
   ```

4. **Configure the environment variables:**

   - Create a `.env.local` file in the project root.
   - Add the necessary environment variables, including:

     ```
     NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
     NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

     DATABASE_URL=<Supabase Database URL>
     DIRECT_URL=<Supabase Direct URL>

     GEMINI_API_KEY=<Your Gemini API Key>

     NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=<Your Clerk Publishable Key>
     CLERK_SECRET_KEY=<Your Clerk Secret Key>

     NEXT_PUBLIC_SUPABASE_URL=<Your Supabase URL>
     NEXT_PUBLIC_SUPABASE_ANON_KEY=<Your Supabase Anon Key>

     ARCJET_KEY=<Your Arcjet Key>
     ```

5. **Setup Prisma:**

   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

6. **Start the development server:**
   ```bash
   npm run dev
   ```

## How to Use

1.  **Adding a car using AI image processing:**

    - Navigate to the admin dashboard and select "Cars."
    - Click on "Add car" button and select the "AI Upload" tab.
    - Upload a clear image of the car, and the system will attempt to extract the car details.
    - Review the extracted information in Manual Entry tab and fill in any missing details manually.
    - Add the car to your inventory. Images are uploaded to Supabase Storage, as the action `src/actions/cars.js` indicates. 🚀

2.  **Browsing and filtering car listings:**

    - Access the `/cars` route to view available car listings. 🔍
    - Use the filter controls to narrow down the search based on make, body type, fuel type, transmission, and price range, as handled in `src/app/(main)/cars/_components/CarFilters.js`. ⚙️

3.  **Booking a test drive:**

    - Navigate to a specific car's details page.
    - Click the "Book Test Drive" button and select a date and time slot.
    - Confirm the booking to schedule the test drive using `src/actions/test-drive.js`. 📅

4.  **Managing car inventory from the admin dashboard:**

    - Log in to the admin dashboard to manage dealerships or cars with super admin privileges.
    - Use the admin dashboard to manage cars, test drives, and users.

5.  **Updating user roles:**

    - Use the admin dashboard to find all users and set the role to each of them.

6.  **Configuring dealership settings:**
    - Log in to admin dashboard as a dealership to manage your working hours, address, email, etc.

## License

This project has no specified license. All rights reserved.
