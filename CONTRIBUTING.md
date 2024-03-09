# Contribution Guidelines

Thank you for considering contributing to SafetyHero! We welcome contributions from developers, educators, cybersecurity enthusiasts, and anyone else interested in making the internet a safer place for everyone. To ensure a smooth contribution process, please review the following guidelines:

## Page Design

- **Intuitive Layout**: The frontend organization of elements ensures an intuitive design for the end user to navigate the site easily.
  
- **Colorful Theme**: Our colorful logo and theme are targeted towards younger audiences, maintaining consistency throughout the website.
  
- **Optimized Performance**: Images and page file sizes are optimized for performance to ensure fast loading times.
  
- **Accessibility**: Text across the website is easily readable, and the contrast between text, images, and the background allows for easy navigation and readability. The website is tested to work for users with colorblindness and other visual impairments.

## Customer Functionality

- **Dynamic Routing**: We use dynamic routing to automatically create routes when new courses, units, and lessons are published.
  
- **Input Validation**: Users are always instructed on what to input for every input form across the site, and both frontend and backend perform input validation to filter for XSS attacks.
  
- **Responsive Design**: Tailwind CSS is utilized to implement responsive design, ensuring browser compatibility, consistent styling, and flexibility.
  
- **Search Feature**: A search feature is implemented in the course listings for enhanced user experience.

## Database Development

- **Database Technology**: We use PostgreSQL to store user and content data and utilize Firebase/Google Cloud Storage APIs to store course thumbnails, optimizing database storage.
  
- **Database Schema**: A conceptual database schema is correctly implemented into the application with minimal redundancy.
  
- **Password Security**: User passwords are encrypted using the pbkdf2 algorithm set to 15000 iterations hashing with SHA512 and a unique, cryptographically random seed for enhanced security.

## Application Design

- **Session Management**: express-session is used to manage sessions and maintain application state, ensuring session data persistence even through application crashes.
  
- **Input Validation**: All form fields across the web application undergo input validation to enhance security.
  
- **Frontend-Backend Separation**: The application is split into a front-end server running a React application and a backend server running an Express application. Sensitive data is securely transmitted between the frontend and backend using session tokens stored in cookies.

## Getting Started

To contribute to SafetyHero, please follow these steps:

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Make your changes and test thoroughly.
4. Submit a pull request, explaining the purpose of your changes.
