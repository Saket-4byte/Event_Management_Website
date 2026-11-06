# Eventora – Event Discovery & Registration Website 🎟️

> **"Discover. Experience. Celebrate."**

Eventora is a modern, responsive event discovery and registration website developed using HTML5, CSS3, and Vanilla JavaScript. It allows users to explore upcoming events, search and filter events by category, view event details, and register for their preferred events through an interactive registration form.

The project focuses on creating a simple, user-friendly, and visually appealing platform while demonstrating essential frontend web development concepts.

---

## 🔗 Project Links

| Resource | Link |
| :--- | :--- |
| **GitHub Repository** | [Eventora – Source Code](https://github.com/Saket-4byte/Event_Management_Website) |
| **Live Website** | [Eventora – Visit Website](https://event-management-website-green.vercel.app/) |
| **Deployment Platform** | [Vercel](https://vercel.com) |

---

## 1. Project Objective

The main objective of Eventora is to develop an event management website that makes discovering and registering for events easier.

The website provides a centralized platform where users can:
- Explore upcoming and featured events.
- View event information, including date, venue, and description.
- Search for events using keywords.
- Filter events according to categories.
- Register for selected events.
- Receive confirmation after successful registration.

The project is developed using HTML, CSS, and JavaScript, with LocalStorage for client-side data persistence.

---

## 2. Key Features

### 2.1 Homepage and Navigation
- Modern and responsive homepage.
- Navigation menu for easy access to different sections.
- Hero section with clear call-to-action buttons.
- Featured events and upcoming events sections.
- Informative sections introducing the platform.

### 2.2 Event Discovery
Users can explore different events through interactive event cards.  
Each event card displays:
- Event name.
- Event date.
- Venue.
- Event image.
- Short description.
- Event category.
- Available seats.
- Event details and registration options.

### 2.3 Search and Category Filtering
- Search events using keywords.
- Filter events by category.
- Display matching results dynamically.
- Show an appropriate message when no events match the search.
- Reset filters to view all events.

### 2.4 Event Details
Users can select an event to view its complete information in a detailed dialog.  
The details include:
- Event name and description.
- Date and time.
- Venue and city.
- Organizer information.
- Admission price.
- Available seats.
- Live countdown timer.
- Register Now option.

### 2.5 Event Registration
Users can register for their selected events through an interactive registration form.

#### Registration Form Fields:
| Field | Description |
| :--- | :--- |
| **Full Name** | Participant's name |
| **Email Address** | Valid email address |
| **Phone Number** | Valid 10-digit Indian mobile number |
| **Selected Event** | Event chosen for registration |

#### Form Validation:
- Checking that all required fields are completed.
- Validating the participant's name (minimum 3 characters, valid letters).
- Checking email format.
- Validating the phone number (10 digits, valid starting carrier digit).
- Preventing duplicate registrations for the same event and email.
- Preventing registration for expired or sold-out events.

### 2.6 Registration Confirmation
After successful registration:
- A confirmation message is displayed.
- A unique registration ID is generated.
- Participant and event details are displayed.
- A digital event pass is generated.
- Registration information is stored in LocalStorage.

### 2.7 My Registrations
Users can:
- View their previous registrations.
- Check registration details.
- View their digital passes.
- Cancel a registration.
- Restore the available seat count after cancellation.

---

## 3. Additional Features

The following enhancements improve the website's functionality and user experience:

| Feature | Description |
| :--- | :--- |
| **Dark/Light Mode** | Switch between dark and light themes. |
| **Theme Persistence** | Saves the selected theme using LocalStorage. |
| **Event Countdown** | Displays the remaining time before an event starts. |
| **Animations** | Smooth scrolling, transitions, and hover effects. |
| **Toast Notifications** | Displays feedback after important user actions. |
| **Responsive Design** | Supports mobile, tablet, and desktop screens. |
| **Host an Event** | Allows users to submit an event proposal through a frontend form. |
| **Digital Event Pass** | Displays registration details in a voucher-style format. |

---

## 4. Technologies Used

| Technology | Purpose |
| :--- | :--- |
| **HTML5** | Structure and content of the website |
| **CSS3** | Styling, layouts, animations, and responsive design |
| **JavaScript (ES6+)** | Dynamic functionality, search, filtering, and form validation |
| **LocalStorage** | Client-side storage of registration and theme information |
| **Lucide Icons** | Icons used throughout the interface |
| **Google Fonts** | Manrope and Inter typography |

- **Development approach:** Vanilla HTML, CSS, and JavaScript without frontend frameworks.
- **Backend:** Not required. The project uses browser LocalStorage for client-side data storage.

---

## 5. Event Categories

Eventora includes 12 sample events across six categories:
1. **Technology** – AI and Autonomous Systems Summit, CloudNative and Microservices Expo.
2. **Music** – Electronic Music Festival, Symphonic Twilight and Chamber Ensemble.
3. **Sports** – Urban Sprint Challenge, Half Marathon and 10K.
4. **Workshops** – UI/UX Design System Masterclass, Web Performance and Edge Computing.
5. **Business** – Startup and Investor Summit, FinTech and Global Commerce Forum.
6. **Art & Culture** – Digital Art and XR Gallery, Ceramic and Sculpture Expo.

The sample event catalog includes information such as event dates, venue, organizer, capacity, pricing, and descriptions.

---

## 6. Project Folder Structure

```text
Event_Management_Website/
│
├── index.html
│
├── css/
│   └── style.css
│
├── js/
│   ├── data.js
│   ├── theme.js
│   ├── events.js
│   ├── registration.js
│   └── app.js
│
├── assets/
│   └── images/
│
├── vercel.json
└── README.md
```

### File Description:
| File | Responsibility |
| :--- | :--- |
| `index.html` | Main HTML structure of the website |
| `css/style.css` | Styling, themes, animations, and responsive layouts |
| `js/data.js` | Sample event data and LocalStorage synchronization |
| `js/theme.js` | Dark and light theme functionality |
| `js/events.js` | Event cards, search, filtering, details, and countdown |
| `js/registration.js` | Registration form, validation, and registration management |
| `js/app.js` | Main application logic and event handling |
| `assets/images/` | Event images and visual assets |
| `vercel.json` | Vercel deployment configuration |
| `README.md` | Project documentation |

---

## 7. Data Storage

Eventora uses the browser's LocalStorage to maintain selected application data.

The stored information includes:
- User registration details.
- Event information and available seat counts.
- Selected theme preference.

The application uses LocalStorage to maintain data even after the browser page is refreshed.

> **Note:** This is a frontend-only academic project. LocalStorage data is stored in the user's browser and is not synchronized with a central server or database.

---

## 8. Responsive Design

The website is designed to provide a consistent experience across different devices:
- **Desktop:** Multi-column event layouts and complete navigation.
- **Tablet:** Adjusted layouts, spacing, and event cards.
- **Mobile:** Compact navigation and mobile-friendly single-column layouts.

Responsive CSS media queries are used to adapt the interface to different screen sizes.

---

## 9. Testing and Verification

The following functionality was verified before final submission:
- [x] Homepage and navigation work correctly.
- [x] Event cards display the correct information.
- [x] Search functionality returns relevant results.
- [x] Category filters work correctly.
- [x] Event details open and close properly.
- [x] Registration form validates required fields.
- [x] Invalid email and phone numbers are rejected.
- [x] Successful registration displays confirmation.
- [x] Registration details persist after refreshing the page.
- [x] My Registrations displays saved registrations.
- [x] Theme selection persists after refreshing.
- [x] Website layout works across different screen sizes.

---

## 10. Learning Outcomes

Through the development of Eventora, the following concepts were applied:
- Creating semantic webpage structures using HTML5.
- Designing responsive layouts using CSS3.
- Implementing DOM manipulation using JavaScript.
- Working with JavaScript events and functions.
- Implementing search and category filtering.
- Performing client-side form validation.
- Managing browser data using LocalStorage.
- Creating interactive dialogs and notifications.
- Organizing a project into separate files and modules.
- Using GitHub for source code management and Vercel for deployment.

---

## 11. Conclusion

Eventora is an event discovery and registration website developed to demonstrate the practical application of frontend web development technologies.

It provides essential event management functionality, including event browsing, searching, category filtering, detailed event views, registration, and confirmation.

The project also includes additional enhancements such as dark/light mode, countdown timers, digital event passes, and LocalStorage-based registration management.

Overall, Eventora demonstrates how HTML5, CSS3, and JavaScript can be combined to develop a responsive, interactive, and user-friendly web application.

---

## 12. Project Submission Details

| Submission Requirement | Details |
| :--- | :--- |
| **Project Name** | Eventora – Event Discovery & Registration Website |
| **GitHub Repository** | [Event_Management_Website](https://github.com/Saket-4byte/Event_Management_Website) |
| **Live Website** | [https://event-management-website-green.vercel.app/](https://event-management-website-green.vercel.app/) |
| **Technologies** | HTML5, CSS3, JavaScript |
| **Deployment Platform** | Vercel |
| **Documentation** | README.md |

*Developed as part of the K Explore – Web Designing Project.*
