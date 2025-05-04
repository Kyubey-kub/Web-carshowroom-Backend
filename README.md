⚙️ Car Showroom Backend
Welcome to the Backend of the Car Showroom project! This submodule powers the API and database management, built with Node.js, Express, and TypeScript. 🚀

🌟 Features

🔒 Authentication: Secure user authentication with jsonwebtoken and bcryptjs.
📧 Email Notifications: Send emails using nodemailer.
📂 File Uploads: Handle file uploads with multer.
🗄️ Database: MySQL integration with mysql2 for efficient data management.
⚡ Real-Time: WebSocket support with ws for real-time updates.


📦 Installed Packages
Here are the packages powering the Backend (car-showroom-backend@1.0.0):



Category
Packages



Core Frameworks
express@4.21.2, cors@2.8.5


Database
mysql2@3.14.0


Authentication
jsonwebtoken@9.0.2, bcryptjs@3.0.2


File Handling
multer@1.4.5-lts.2


Email
nodemailer@6.10.1


Real-Time
ws@8.18.1


Utilities
date-fns@4.1.0, dotenv@16.4.7, validator@13.15.0


Development Tools
nodemon@3.1.9, ts-node@10.9.2, typescript@5.8.2


Type Definitions
@types/express@5.0.1, @types/node@22.13.14, @types/cors@2.8.17, @types/jsonwebtoken@9.0.9, @types/bcryptjs@3.0.0, @types/multer@1.4.12, @types/nodemailer@6.4.17, @types/validator@13.12.3, @types/ws@8.18.1, @types/date-fns@2.6.3



🛠️ Setup Details
The Backend is built with Express for routing, MySQL2 for database interactions, and TypeScript for type safety. Key features include:

Environment Variables: Managed with dotenv.
Development Hot-Reloading: Enabled with nodemon.
Type Safety: Ensured with TypeScript and type definitions for all major packages.

Database Setup
This project uses MySQL as the database. Follow these steps to set it up:

Install MySQL:Ensure MySQL is installed and running on your system. You can download it from MySQL Official Website.

Create the Database:Create a database named car_showroom:
CREATE DATABASE car_showroom;


Set Up Tables:You may need to create tables based on your application requirements. Refer to the schema.sql file (if available) or define your own schema.



🚀 Getting Started
Prerequisites

Node.js (v18 or higher)
MySQL (v8 or higher)

Setup Instructions

Clone the Repository:
git clone https://github.com/Kyubey-kub/web-carshowroom-Backend.git
cd web-carshowroom-Backend


Install Dependencies:
npm install


Configure Environment Variables:Create a .env file in the root directory and add the necessary configurations:
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASS=yourpassword
DB_NAME=car_showroom
JWT_SECRET=your_jwt_secret


Set Up the Database:Follow the Database Setup section above to create and configure your MySQL database.

Run the Project:
npm run dev




🤝 Contributing
We welcome contributions! Here's how you can get involved:

Fork the repository.
Create a new branch for your feature or bug fix.
Submit a pull request with a clear description of your changes.For major changes, please open an issue first to discuss.


📜 License
This project is licensed under the MIT License - see the LICENSE file for details.

🌟 Happy coding! If you have any questions, feel free to reach out via GitHub Issues. 🚀
