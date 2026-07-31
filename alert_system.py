import smtplib
from email.mime.text import MIMEText
import json
import time
from datetime import datetime
import os

class AlertNotifier:
    def __init__(self):
        self.alert_count = 0
        self.config = self.load_config()
    
    def load_config(self):
        return {
            'email_alerts': False,  # Set to True after configuring
            'console_alerts': True,
            'log_alerts': True,
            'log_file': 'theft_alerts.log'
        }
    
    def send_alert(self, alert_data):
        """Send alert through all configured channels"""
        self.alert_count += 1
        
        alert_data['alert_id'] = self.alert_count
        alert_data['timestamp'] = datetime.now().isoformat()
        
        message = self.format_alert_message(alert_data)
        
        if self.config['console_alerts']:
            self.send_console_alert(message)
        
        if self.config['email_alerts']:
            self.send_email_alert(message, alert_data)
        
        if self.config['log_alerts']:
            self.log_alert(alert_data)
        
        return alert_data
    
    def format_alert_message(self, alert_data):
        return f"""
🚨 THEFT DETECTION ALERT #{alert_data['alert_id']}

Type: {alert_data['type']}
Confidence: {alert_data.get('confidence', 0):.1%}
Timestamp: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}
Location: Camera {alert_data.get('camera_id', 'Unknown')}

Details: {alert_data['message']}

Immediate action required!
"""
    
    def send_console_alert(self, message):
        print("=" * 60)
        print("🚨 SECURITY ALERT!")
        print("=" * 60)
        print(message)
        print("=" * 60)
    
    def send_email_alert(self, message, alert_data):
        """Send email alert (configure email settings first)"""
        try:
            # Configure these with your email settings
            smtp_server = "smtp.gmail.com"
            smtp_port = 587
            sender_email = "your_email@gmail.com"
            sender_password = "your_app_password"
            receiver_emails = ["security@company.com"]
            
            server = smtplib.SMTP(smtp_server, smtp_port)
            server.starttls()
            server.login(sender_email, sender_password)
            
            msg = MIMEText(message)
            msg['Subject'] = f"🚨 THEFT ALERT: {alert_data['type']}"
            msg['From'] = sender_email
            msg['To'] = ', '.join(receiver_emails)
            
            server.send_message(msg)
            server.quit()
            print("✅ Email alert sent successfully")
        except Exception as e:
            print(f"❌ Email alert failed: {e}")
    
    def log_alert(self, alert_data):
        """Log alert to file"""
        try:
            with open(self.config['log_file'], 'a') as f:
                log_entry = {
                    'timestamp': datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                    'alert_id': alert_data['alert_id'],
                    'type': alert_data['type'],
                    'confidence': alert_data.get('confidence', 0),
                    'message': alert_data['message']
                }
                f.write(json.dumps(log_entry) + '\n')
            print(f"✅ Alert logged to {self.config['log_file']}")
        except Exception as e:
            print(f"❌ Alert logging failed: {e}")

# Test function
def test_alert_system():
    print("Testing Alert System...")
    notifier = AlertNotifier()
    
    test_alerts = [
        {
            'type': 'pickpocketing',
            'confidence': 0.92,
            'message': 'Suspicious hand movement detected near personal belongings',
            'camera_id': 'CAM-001'
        },
        {
            'type': 'shoplifting', 
            'confidence': 0.89,
            'message': 'Product concealment detected in clothing',
            'camera_id': 'CAM-002'
        }
    ]
    
    for alert in test_alerts:
        notifier.send_alert(alert)
        time.sleep(1)
    
    print(f"✅ Alert system test completed. Sent {notifier.alert_count} alerts.")

if __name__ == "__main__":
    test_alert_system()
