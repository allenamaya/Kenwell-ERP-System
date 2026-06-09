import os
from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from email.mime.image import MIMEImage
from datetime import datetime

def send_templated_email(subject, template_name, context, to_email):
    """
    Sends a responsive HTML email using Django's template engine,
    generating a plain-text fallback and attaching the brand logo
    inline via Content-ID (cid:logo_png).
    """
    # Ensure standard context variables are available
    context.setdefault('current_year', datetime.now().year)
    context.setdefault('subject', subject)
    
    # Render HTML and extract text version
    html_content = render_to_string(template_name, context)
    text_content = strip_tags(html_content)
    
    # Construct Email message
    msg = EmailMultiAlternatives(
        subject=subject,
        body=text_content,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[to_email]
    )
    msg.attach_alternative(html_content, "text/html")
    
    # Find and attach the logo
    logo_path = settings.BASE_DIR.parent / 'public' / 'logo-light-mode.png'
    if os.path.exists(logo_path):
        try:
            with open(logo_path, 'rb') as f:
                img_data = f.read()
            img = MIMEImage(img_data)
            img.add_header('Content-ID', '<logo_png>')
            img.add_header('Content-Disposition', 'inline', filename='logo-light-mode.png')
            msg.attach(img)
        except Exception as e:
            print(f"[Emails] Error attaching inline logo: {e}")
    else:
        print(f"[Emails] Brand logo not found at {logo_path}")
        
    msg.send()

def send_otp_email(user, otp_code):
    """
    Generates and sends an OTP verification code email to a user.
    """
    subject = f"Verify your Kenwell Account: {otp_code}"
    context = {
        'name': user.get_full_name() or user.username,
        'otp': otp_code,
    }
    send_templated_email(
        subject=subject,
        template_name='emails/otp_email.html',
        context=context,
        to_email=user.email
    )
