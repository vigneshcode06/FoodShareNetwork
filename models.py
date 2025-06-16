from app import db
from flask_login import UserMixin
from datetime import datetime
from sqlalchemy import func

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    user_type = db.Column(db.String(20), nullable=False)  # 'hotel', 'collector', 'admin'
    full_name = db.Column(db.String(100))
    phone = db.Column(db.String(20))
    address = db.Column(db.Text)
    latitude = db.Column(db.Float)
    longitude = db.Column(db.Float)
    is_verified = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    food_listings = db.relationship('FoodListing', backref='hotel', lazy=True, foreign_keys='FoodListing.hotel_id')
    requests_made = db.relationship('FoodRequest', backref='collector', lazy=True, foreign_keys='FoodRequest.collector_id')

class FoodListing(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    food_type = db.Column(db.String(50), nullable=False)  # 'prepared', 'raw', 'packaged'
    category = db.Column(db.String(50))  # 'vegetarian', 'non-vegetarian', 'vegan'
    quantity = db.Column(db.String(50), nullable=False)
    expiry_time = db.Column(db.DateTime, nullable=False)
    pickup_location = db.Column(db.String(200), nullable=False)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(20), default='available')  # 'available', 'requested', 'collected', 'expired'
    hotel_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    requests = db.relationship('FoodRequest', backref='food_listing', lazy=True, cascade='all, delete-orphan')

class FoodRequest(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    food_listing_id = db.Column(db.Integer, db.ForeignKey('food_listing.id'), nullable=False)
    collector_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    status = db.Column(db.String(20), default='pending')  # 'pending', 'approved', 'rejected', 'collected'
    message = db.Column(db.Text)
    requested_at = db.Column(db.DateTime, default=datetime.utcnow)
    responded_at = db.Column(db.DateTime)
    collected_at = db.Column(db.DateTime)
    
    # Feedback system
    collector_rating = db.Column(db.Integer)  # 1-5 rating from hotel
    hotel_rating = db.Column(db.Integer)  # 1-5 rating from collector
    collector_feedback = db.Column(db.Text)
    hotel_feedback = db.Column(db.Text)

class Notification(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    title = db.Column(db.String(100), nullable=False)
    message = db.Column(db.Text, nullable=False)
    type = db.Column(db.String(20), default='info')  # 'info', 'success', 'warning', 'error'
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    user = db.relationship('User', backref='notifications')
