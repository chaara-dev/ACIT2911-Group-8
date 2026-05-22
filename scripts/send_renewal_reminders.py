import os
import sys

from dotenv import load_dotenv

load_dotenv()

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.api import create_app
from services.renewal_reminders import run_renewal_reminders


def main() -> None:
    app = create_app()
    with app.app_context():
        sent = run_renewal_reminders()
    print(f"Sent {sent} renewal reminder email(s).")


if __name__ == "__main__":
    main()
