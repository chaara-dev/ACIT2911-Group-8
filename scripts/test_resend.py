import os
import sys

from dotenv import load_dotenv

load_dotenv()

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.email import send_email

TEST_TO = os.environ.get("TEST_EMAIL", "siu1310257@gmail.com")


def main() -> None:
    result = send_email(
        to=TEST_TO,
        subject="Hello World",
        html="<p>Congrats on sending your <strong>first email</strong>!</p>",
    )
    print(f"Email sent to {TEST_TO}: {result}")


if __name__ == "__main__":
    main()
