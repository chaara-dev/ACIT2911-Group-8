import pytest
from src.api import create_app
from src.database.models import User

@pytest.fixture()
def user_client():
    flask_app = create_app()
    with flask_app.test_client() as testing_client:
        yield testing_client

#register
def test_register(user_client):
    response = user_client.post(
        "/api/register",
        json={"email": "new_user@test.com", "password": "password123"}
    )
    assert response.status_code == 201
    
    data = response.get_json()
    assert data["message"] == "User registered successfully"

    test_user = User.get(User.email == "new_user@test.com")
    test_user.delete_instance()

def test_register_without_password(user_client):
    response = user_client.post(
        "/api/register",
        json={"email": "missing@test.com"}
    )
    assert response.status_code == 400
    
    data = response.get_json()
    assert data["error"] == "email and password are required"

#login
def test_login(user_client):
    user_client.post(
        "/api/register",
        json={"email": "new_user@test.com", "password": "password123"}
    )
    
    response = user_client.post(
        "/api/login",
        json={"email": "new_user@test.com", "password": "password123"}
    )
    assert response.status_code == 200
    
    test_user = User.get(User.email == "new_user@test.com")
    test_user.delete_instance()

def test_login_wrong(user_client):
    
    response = user_client.post(
        "/api/login",
        json={"email": "wrong@test.com", "password": "wrong123"}
    )
    assert response.status_code == 401 
    