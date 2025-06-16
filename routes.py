from flask import render_template, request, flash, redirect, url_for, jsonify
from flask_login import login_user, logout_user, login_required, current_user
from werkzeug.security import check_password_hash, generate_password_hash
from app import app, db
from models import User, FoodListing, FoodRequest, Notification
from forms import LoginForm, RegisterForm, FoodListingForm, RequestForm
from utils import send_notification, calculate_distance, send_email
from datetime import datetime, timedelta
import os

@app.route('/')
def index():
    # Get recent food listings
    recent_listings = FoodListing.query.filter_by(status='available').filter(
        FoodListing.expiry_time > datetime.utcnow()
    ).order_by(FoodListing.created_at.desc()).limit(6).all()
    
    # Get statistics
    total_listings = FoodListing.query.count()
    total_requests = FoodRequest.query.count()
    total_collected = FoodRequest.query.filter_by(status='collected').count()
    
    return render_template('index.html', 
                         recent_listings=recent_listings,
                         total_listings=total_listings,
                         total_requests=total_requests,
                         total_collected=total_collected)

@app.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('dashboard'))
    
    form = LoginForm()
    if form.validate_on_submit():
        user = User.query.filter_by(email=form.email.data).first()
        if user and check_password_hash(user.password_hash, form.password.data):
            login_user(user, remember=form.remember_me.data)
            next_page = request.args.get('next')
            flash(f'Welcome back, {user.username}!', 'success')
            return redirect(next_page) if next_page else redirect(url_for('dashboard'))
        flash('Invalid email or password', 'error')
    
    return render_template('login.html', form=form)

@app.route('/register', methods=['GET', 'POST'])
def register():
    if current_user.is_authenticated:
        return redirect(url_for('dashboard'))
    
    form = RegisterForm()
    if form.validate_on_submit():
        # Check if user already exists
        if User.query.filter_by(email=form.email.data).first():
            flash('Email already registered', 'error')
            return render_template('register.html', form=form)
        
        if User.query.filter_by(username=form.username.data).first():
            flash('Username already taken', 'error')
            return render_template('register.html', form=form)
        
        # Create new user
        user = User(
            username=form.username.data,
            email=form.email.data,
            password_hash=generate_password_hash(form.password.data),
            user_type=form.user_type.data,
            full_name=form.full_name.data,
            phone=form.phone.data,
            address=form.address.data,
            latitude=form.latitude.data if form.latitude.data else None,
            longitude=form.longitude.data if form.longitude.data else None
        )
        
        db.session.add(user)
        db.session.commit()
        
        flash('Registration successful! You can now log in.', 'success')
        return redirect(url_for('login'))
    
    return render_template('register.html', form=form)

@app.route('/logout')
@login_required
def logout():
    logout_user()
    flash('You have been logged out', 'info')
    return redirect(url_for('index'))

@app.route('/dashboard')
@login_required
def dashboard():
    if current_user.user_type == 'hotel':
        return redirect(url_for('hotel_dashboard'))
    elif current_user.user_type == 'collector':
        return redirect(url_for('collector_dashboard'))
    elif current_user.user_type == 'admin':
        return redirect(url_for('admin_dashboard'))
    else:
        flash('Invalid user type', 'error')
        return redirect(url_for('index'))

@app.route('/hotel/dashboard')
@login_required
def hotel_dashboard():
    if current_user.user_type != 'hotel':
        flash('Access denied', 'error')
        return redirect(url_for('index'))
    
    # Get hotel's food listings
    listings = FoodListing.query.filter_by(hotel_id=current_user.id).order_by(
        FoodListing.created_at.desc()
    ).all()
    
    # Get pending requests for hotel's listings
    pending_requests = FoodRequest.query.join(FoodListing).filter(
        FoodListing.hotel_id == current_user.id,
        FoodRequest.status == 'pending'
    ).order_by(FoodRequest.requested_at.desc()).all()
    
    # Statistics
    total_listings = len(listings)
    active_listings = len([l for l in listings if l.status == 'available'])
    total_requests = FoodRequest.query.join(FoodListing).filter(
        FoodListing.hotel_id == current_user.id
    ).count()
    
    return render_template('hotel_dashboard.html',
                         listings=listings,
                         pending_requests=pending_requests,
                         total_listings=total_listings,
                         active_listings=active_listings,
                         total_requests=total_requests)

@app.route('/collector/dashboard')
@login_required
def collector_dashboard():
    if current_user.user_type != 'collector':
        flash('Access denied', 'error')
        return redirect(url_for('index'))
    
    # Get available food listings
    available_listings = FoodListing.query.filter_by(status='available').filter(
        FoodListing.expiry_time > datetime.utcnow()
    ).order_by(FoodListing.created_at.desc()).all()
    
    # Get user's requests
    user_requests = FoodRequest.query.filter_by(collector_id=current_user.id).order_by(
        FoodRequest.requested_at.desc()
    ).all()
    
    # Filter listings based on distance if user has location
    if current_user.latitude and current_user.longitude:
        nearby_listings = []
        for listing in available_listings:
            distance = calculate_distance(
                current_user.latitude, current_user.longitude,
                listing.latitude, listing.longitude
            )
            if distance <= 50:  # Within 50km
                listing.distance = distance
                nearby_listings.append(listing)
        nearby_listings.sort(key=lambda x: x.distance)
        available_listings = nearby_listings
    
    return render_template('collector_dashboard.html',
                         available_listings=available_listings,
                         user_requests=user_requests)

@app.route('/admin/dashboard')
@login_required
def admin_dashboard():
    if current_user.user_type != 'admin':
        flash('Access denied', 'error')
        return redirect(url_for('index'))
    
    # Get statistics
    total_users = User.query.count()
    hotels = User.query.filter_by(user_type='hotel').all()
    collectors = User.query.filter_by(user_type='collector').all()
    total_listings = FoodListing.query.count()
    total_requests = FoodRequest.query.count()
    
    # Recent activity
    recent_listings = FoodListing.query.order_by(FoodListing.created_at.desc()).limit(10).all()
    recent_requests = FoodRequest.query.order_by(FoodRequest.requested_at.desc()).limit(10).all()
    
    return render_template('admin_dashboard.html',
                         total_users=total_users,
                         hotels=hotels,
                         collectors=collectors,
                         total_listings=total_listings,
                         total_requests=total_requests,
                         recent_listings=recent_listings,
                         recent_requests=recent_requests)

@app.route('/post-food', methods=['GET', 'POST'])
@login_required
def post_food():
    if current_user.user_type != 'hotel':
        flash('Only hotels can post food listings', 'error')
        return redirect(url_for('index'))
    
    form = FoodListingForm()
    if form.validate_on_submit():
        listing = FoodListing(
            title=form.title.data,
            description=form.description.data,
            food_type=form.food_type.data,
            category=form.category.data,
            quantity=form.quantity.data,
            expiry_time=form.expiry_time.data,
            pickup_location=form.pickup_location.data,
            latitude=form.latitude.data if form.latitude.data else 0.0,
            longitude=form.longitude.data if form.longitude.data else 0.0,
            hotel_id=current_user.id
        )
        
        db.session.add(listing)
        db.session.commit()
        
        flash('Food listing posted successfully!', 'success')
        return redirect(url_for('hotel_dashboard'))
    
    return render_template('post_food.html', form=form)

@app.route('/food/<int:food_id>')
def food_details(food_id):
    listing = FoodListing.query.get_or_404(food_id)
    
    # Calculate distance if user is logged in and has location
    distance = None
    if current_user.is_authenticated and current_user.latitude and current_user.longitude:
        distance = calculate_distance(
            current_user.latitude, current_user.longitude,
            listing.latitude, listing.longitude
        )
    
    # Check if user has already requested this food
    has_requested = False
    if current_user.is_authenticated and current_user.user_type == 'collector':
        has_requested = FoodRequest.query.filter_by(
            food_listing_id=food_id,
            collector_id=current_user.id
        ).first() is not None
    
    return render_template('food_details.html',
                         listing=listing,
                         distance=distance,
                         has_requested=has_requested)

@app.route('/request-food/<int:food_id>', methods=['POST'])
@login_required
def request_food(food_id):
    if current_user.user_type != 'collector':
        flash('Only collectors can request food', 'error')
        return redirect(url_for('food_details', food_id=food_id))
    
    listing = FoodListing.query.get_or_404(food_id)
    
    # Check if already requested
    existing_request = FoodRequest.query.filter_by(
        food_listing_id=food_id,
        collector_id=current_user.id
    ).first()
    
    if existing_request:
        flash('You have already requested this food', 'warning')
        return redirect(url_for('food_details', food_id=food_id))
    
    # Create new request
    food_request = FoodRequest(
        food_listing_id=food_id,
        collector_id=current_user.id,
        message=request.form.get('message', '')
    )
    
    db.session.add(food_request)
    db.session.commit()
    
    # Send notification to hotel
    send_notification(
        listing.hotel_id,
        'New Food Request',
        f'{current_user.username} has requested your food listing: {listing.title}',
        'info'
    )
    
    # Send email notification
    send_email(
        listing.hotel.email,
        'New Food Request - ShareMeal',
        f'You have received a new food request from {current_user.username} for "{listing.title}".'
    )
    
    flash('Food request sent successfully!', 'success')
    return redirect(url_for('food_details', food_id=food_id))

@app.route('/respond-request/<int:request_id>/<action>')
@login_required
def respond_request(request_id, action):
    food_request = FoodRequest.query.get_or_404(request_id)
    
    # Check if current user is the hotel owner
    if current_user.id != food_request.food_listing.hotel_id:
        flash('Access denied', 'error')
        return redirect(url_for('index'))
    
    if action == 'approve':
        food_request.status = 'approved'
        food_request.responded_at = datetime.utcnow()
        
        # Update food listing status
        food_request.food_listing.status = 'requested'
        
        # Send notification to collector
        send_notification(
            food_request.collector_id,
            'Request Approved',
            f'Your request for "{food_request.food_listing.title}" has been approved!',
            'success'
        )
        
        flash('Request approved successfully', 'success')
        
    elif action == 'reject':
        food_request.status = 'rejected'
        food_request.responded_at = datetime.utcnow()
        
        # Send notification to collector
        send_notification(
            food_request.collector_id,
            'Request Rejected',
            f'Your request for "{food_request.food_listing.title}" has been rejected.',
            'warning'
        )
        
        flash('Request rejected', 'info')
    
    db.session.commit()
    return redirect(url_for('hotel_dashboard'))

@app.route('/mark-collected/<int:request_id>')
@login_required
def mark_collected(request_id):
    food_request = FoodRequest.query.get_or_404(request_id)
    
    # Check if current user is either the hotel or collector
    if current_user.id not in [food_request.collector_id, food_request.food_listing.hotel_id]:
        flash('Access denied', 'error')
        return redirect(url_for('index'))
    
    food_request.status = 'collected'
    food_request.collected_at = datetime.utcnow()
    food_request.food_listing.status = 'collected'
    
    db.session.commit()
    
    flash('Food marked as collected successfully!', 'success')
    
    if current_user.user_type == 'hotel':
        return redirect(url_for('hotel_dashboard'))
    else:
        return redirect(url_for('collector_dashboard'))

@app.route('/map')
def map_view():
    # Get all available food listings with coordinates
    listings = FoodListing.query.filter_by(status='available').filter(
        FoodListing.expiry_time > datetime.utcnow(),
        FoodListing.latitude.isnot(None),
        FoodListing.longitude.isnot(None)
    ).all()
    
    return render_template('map_view.html', listings=listings)

@app.route('/api/food-listings')
def api_food_listings():
    """API endpoint for food listings"""
    listings = FoodListing.query.filter_by(status='available').filter(
        FoodListing.expiry_time > datetime.utcnow()
    ).all()
    
    data = []
    for listing in listings:
        data.append({
            'id': listing.id,
            'title': listing.title,
            'description': listing.description,
            'food_type': listing.food_type,
            'category': listing.category,
            'quantity': listing.quantity,
            'pickup_location': listing.pickup_location,
            'latitude': listing.latitude,
            'longitude': listing.longitude,
            'expiry_time': listing.expiry_time.isoformat(),
            'hotel_name': listing.hotel.username
        })
    
    return jsonify(data)

@app.route('/verify-user/<int:user_id>')
@login_required
def verify_user(user_id):
    if current_user.user_type != 'admin':
        flash('Access denied', 'error')
        return redirect(url_for('index'))
    
    user = User.query.get_or_404(user_id)
    user.is_verified = not user.is_verified
    db.session.commit()
    
    status = 'verified' if user.is_verified else 'unverified'
    flash(f'User {user.username} has been {status}', 'success')
    
    return redirect(url_for('admin_dashboard'))

@app.route('/delete-listing/<int:listing_id>')
@login_required
def delete_listing(listing_id):
    listing = FoodListing.query.get_or_404(listing_id)
    
    # Check if current user is the hotel owner or admin
    if current_user.id != listing.hotel_id and current_user.user_type != 'admin':
        flash('Access denied', 'error')
        return redirect(url_for('index'))
    
    db.session.delete(listing)
    db.session.commit()
    
    flash('Food listing deleted successfully', 'success')
    
    if current_user.user_type == 'admin':
        return redirect(url_for('admin_dashboard'))
    else:
        return redirect(url_for('hotel_dashboard'))

# Error handlers
@app.errorhandler(404)
def not_found_error(error):
    return render_template('404.html'), 404

@app.errorhandler(500)
def internal_error(error):
    db.session.rollback()
    return render_template('500.html'), 500
