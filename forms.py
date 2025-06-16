from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, BooleanField, TextAreaField, SelectField, DateTimeField, FloatField
from wtforms.validators import DataRequired, Email, EqualTo, Length, Optional
from wtforms.widgets import DateTimeLocalInput

class LoginForm(FlaskForm):
    email = StringField('Email', validators=[DataRequired(), Email()])
    password = PasswordField('Password', validators=[DataRequired()])
    remember_me = BooleanField('Remember Me')

class RegisterForm(FlaskForm):
    username = StringField('Username', validators=[DataRequired(), Length(min=4, max=20)])
    email = StringField('Email', validators=[DataRequired(), Email()])
    full_name = StringField('Full Name', validators=[DataRequired(), Length(max=100)])
    phone = StringField('Phone Number', validators=[Optional(), Length(max=20)])
    address = TextAreaField('Address', validators=[Optional()])
    user_type = SelectField('User Type', 
                           choices=[('hotel', 'Hotel/Restaurant'), ('collector', 'Collector/NGO')],
                           validators=[DataRequired()])
    password = PasswordField('Password', validators=[DataRequired(), Length(min=6)])
    confirm_password = PasswordField('Confirm Password', 
                                   validators=[DataRequired(), EqualTo('password')])
    latitude = FloatField('Latitude', validators=[Optional()])
    longitude = FloatField('Longitude', validators=[Optional()])

class FoodListingForm(FlaskForm):
    title = StringField('Food Title', validators=[DataRequired(), Length(max=100)])
    description = TextAreaField('Description', validators=[Optional()])
    food_type = SelectField('Food Type',
                           choices=[('prepared', 'Prepared Food'), ('raw', 'Raw Ingredients'), ('packaged', 'Packaged Food')],
                           validators=[DataRequired()])
    category = SelectField('Category',
                          choices=[('vegetarian', 'Vegetarian'), ('non-vegetarian', 'Non-Vegetarian'), ('vegan', 'Vegan')],
                          validators=[DataRequired()])
    quantity = StringField('Quantity', validators=[DataRequired(), Length(max=50)])
    expiry_time = DateTimeField('Expiry Time', 
                               widget=DateTimeLocalInput(),
                               validators=[DataRequired()],
                               format=['%Y-%m-%dT%H:%M', '%Y-%m-%d %H:%M:%S'])
    pickup_location = StringField('Pickup Location', validators=[DataRequired(), Length(max=200)])
    latitude = FloatField('Latitude', validators=[Optional()])
    longitude = FloatField('Longitude', validators=[Optional()])

class RequestForm(FlaskForm):
    message = TextAreaField('Message (Optional)', validators=[Optional(), Length(max=500)])
