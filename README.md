# FoodShareNetwork

FoodShareNetwork is a comprehensive web application that connects hotels and restaurants with excess food to local collectors and NGOs, helping reduce food waste while supporting communities in need.

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
FoodShareNetwork/
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

**FoodShareNetwork** - Connecting communities through food sharing, reducing waste, and fighting hunger one meal at a time.