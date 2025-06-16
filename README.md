# ShareMeal - Food Donation Platform

ShareMeal is a comprehensive web application that connects hotels and restaurants with excess food to local collectors and NGOs, helping reduce food waste while supporting communities in need.

## Features

### For Hotels & Restaurants
- **Food Posting**: Create detailed listings for available food with descriptions, quantities, and pickup times
- **Request Management**: Review and approve collection requests from verified collectors
- **Dashboard**: Track active listings, pending requests, and collection history
- **Rating System**: Rate collectors after successful pickups

### For Collectors & NGOs
- **Food Discovery**: Browse available food listings with detailed information
- **Request System**: Submit requests for food items with optional messages
- **Location-Based**: View food listings organized by pickup location
- **Profile Management**: Maintain collector profiles with contact information

### For Administrators
- **User Verification**: Approve and verify hotel and collector accounts
- **Platform Monitoring**: Oversee all listings, requests, and user activity
- **Analytics**: Track platform usage and food distribution metrics

## Technology Stack

- **Backend**: Flask (Python web framework)
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Authentication**: Flask-Login with secure password hashing
- **Forms**: Flask-WTF with CSRF protection
- **Frontend**: Bootstrap 5 with responsive design
- **Deployment**: Gunicorn WSGI server

## Installation & Setup

### Prerequisites
- Python 3.8+
- PostgreSQL database
- Virtual environment (recommended)

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd sharemeal
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set environment variables**
   ```bash
   export DATABASE_URL="postgresql://username:password@localhost/sharemeal"
   export SESSION_SECRET="your-secret-key-here"
   ```

5. **Initialize the database**
   ```bash
   python -c "from app import app, db; app.app_context().push(); db.create_all()"
   ```

6. **Run the application**
   ```bash
   python main.py
   ```

The application will be available at `http://localhost:5000`

## Database Schema

### User Model
- User authentication and profile information
- Support for three user types: `hotel`, `collector`, `admin`
- Location data stored as text addresses

### FoodListing Model
- Food item details (title, description, type, category)
- Quantity and expiry information
- Pickup location and contact details
- Status tracking (`available`, `requested`, `collected`, `expired`)

### FoodRequest Model
- Request management between collectors and hotels
- Status tracking (`pending`, `approved`, `rejected`, `collected`)
- Rating and feedback system

### Notification Model
- In-app notification system for users
- Status tracking for read/unread notifications

## Usage Guide

### Getting Started

1. **Registration**: Create an account as either a Hotel/Restaurant or Collector/NGO
2. **Verification**: Wait for admin approval to access full features
3. **Profile Setup**: Complete your profile with contact information and address

### For Hotels

1. **Post Food**: Navigate to "Post Food" and fill in details:
   - Food title and description
   - Food type (prepared, raw ingredients, packaged)
   - Category (vegetarian, non-vegetarian, vegan)
   - Quantity and expiry time
   - Pickup location

2. **Manage Requests**: Review incoming requests and approve suitable collectors

3. **Track Collections**: Monitor pickup status and provide ratings

### For Collectors

1. **Browse Food**: Use the "Find Food" section to discover available items
2. **Filter Options**: Search by location, food type, or category
3. **Submit Requests**: Request food items with optional messages
4. **Coordinate Pickup**: Contact hotels for collection arrangements

## API Endpoints

- `GET /api/food-listings` - Retrieve available food listings
- `POST /post-food` - Create new food listing (authenticated hotels only)
- `POST /request-food/<id>` - Submit collection request (authenticated collectors only)

## Security Features

- **CSRF Protection**: All forms protected against cross-site request forgery
- **Password Security**: Werkzeug password hashing with salt
- **Session Management**: Secure session handling with Flask-Login
- **User Verification**: Admin approval required for account activation

## File Structure

```
sharemeal/
├── app.py              # Application factory and configuration
├── main.py             # Application entry point
├── models.py           # Database models
├── routes.py           # URL routes and view functions
├── forms.py            # WTForms form definitions
├── utils.py            # Utility functions
├── templates/          # Jinja2 HTML templates
│   ├── base.html
│   ├── index.html
│   ├── hotel_dashboard.html
│   ├── collector_dashboard.html
│   ├── post_food.html
│   └── ...
├── static/             # Static assets
│   ├── css/
│   ├── js/
│   └── images/
└── README.md
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions, please open an issue in the GitHub repository or contact the development team.

## Future Enhancements

- Mobile application development
- Real-time notifications
- Advanced analytics dashboard
- Integration with delivery services
- Multi-language support
- Photo upload for food listings

---

**ShareMeal** - Connecting communities through food sharing, reducing waste, and fighting hunger one meal at a time.