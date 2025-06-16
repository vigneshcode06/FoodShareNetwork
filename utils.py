import smtplib
import math
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app import db
from models import Notification
from datetime import datetime

def send_notification(user_id, title, message, notification_type='info'):
    """Send a notification to a user"""
    notification = Notification(
        user_id=user_id,
        title=title,
        message=message,
        type=notification_type
    )
    db.session.add(notification)
    db.session.commit()

def send_email(to_email, subject, body):
    """Send email notification"""
    try:
        # Email configuration - using environment variables
        smtp_server = os.environ.get('SMTP_SERVER', 'smtp.gmail.com')
        smtp_port = int(os.environ.get('SMTP_PORT', '587'))
        sender_email = os.environ.get('SENDER_EMAIL', 'noreply@sharemeal.com')
        sender_password = os.environ.get('SENDER_PASSWORD', 'dummy_password')
        
        # Create message
        msg = MIMEMultipart()
        msg['From'] = sender_email
        msg['To'] = to_email
        msg['Subject'] = subject
        
        msg.attach(MIMEText(body, 'plain'))
        
        # Send email
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        server.login(sender_email, sender_password)
        text = msg.as_string()
        server.sendmail(sender_email, to_email, text)
        server.quit()
        
        print(f"Email sent successfully to {to_email}")
        return True
        
    except Exception as e:
        print(f"Failed to send email: {e}")
        return False

def calculate_distance(lat1, lon1, lat2, lon2):
    """
    Calculate the great circle distance between two points 
    on the earth (specified in decimal degrees)
    Returns distance in kilometers
    """
    # Convert decimal degrees to radians
    lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])
    
    # Haversine formula
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
    c = 2 * math.asin(math.sqrt(a))
    
    # Radius of earth in kilometers
    r = 6371
    
    return c * r

def format_time_ago(dt):
    """Format datetime as time ago string"""
    now = datetime.utcnow()
    diff = now - dt
    
    if diff.days > 0:
        return f"{diff.days} day{'s' if diff.days > 1 else ''} ago"
    elif diff.seconds > 3600:
        hours = diff.seconds // 3600
        return f"{hours} hour{'s' if hours > 1 else ''} ago"
    elif diff.seconds > 60:
        minutes = diff.seconds // 60
        return f"{minutes} minute{'s' if minutes > 1 else ''} ago"
    else:
        return "Just now"

def get_status_color(status):
    """Get Bootstrap color class for status"""
    status_colors = {
        'available': 'success',
        'requested': 'warning',
        'collected': 'info',
        'expired': 'danger',
        'pending': 'warning',
        'approved': 'success',
        'rejected': 'danger'
    }
    return status_colors.get(status, 'secondary')

def clean_expired_listings():
    """Clean up expired food listings"""
    from models import FoodListing
    
    expired_listings = FoodListing.query.filter(
        FoodListing.expiry_time < datetime.utcnow(),
        FoodListing.status == 'available'
    ).all()
    
    for listing in expired_listings:
        listing.status = 'expired'
    
    db.session.commit()
    return len(expired_listings)
