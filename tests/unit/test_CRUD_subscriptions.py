# # Unit tests for the Subscription CRUD routes.
# import pytest
# from api import create_app
 
# @pytest.fixture
# def client():
#     app = create_app()
#     return app.test_client()


# # POST tests
# def test_create_subscription(client):
#     response = client.post("/api/subscriptions", json={
#         "user_id": 1,
#         "name": "Netflix",
#         "cost": 12.99,
#         "billing_type": "monthly"
#     })
#     assert response.status_code == 201
 
# def test_create_unfinished_subscription(client):
#     response = client.post("/api/subscriptions", json={
#         "name": "Netflix"
#     })
#     assert response.status_code == 400


# # GET tests
# def test_list_subscriptions(client):
#     response = client.get("/api/subscriptions")
#     assert response.status_code == 200
 
# def test_get_subscription(client):
#     response = client.get("/api/subscriptions/1")
#     assert response.status_code == 200
 
# def test_get_subscription_not_found(client):
#     response = client.get("/api/subscriptions/999")
#     assert response.status_code == 404


# # PUT tests
# def test_update_subscription(client):
#     response = client.put("/api/subscriptions/1", json={
#         "name": "Netflix Pro",
#         "cost": 19.99,
#         "billing_type": "monthly"
#     })
#     assert response.status_code == 200
 
# def test_update_subscription_not_found(client):
#     response = client.put("/api/subscriptions/999", json={
#         "name": "NF", "cost": 1, "billing_type": "monthly"
#     })
#     assert response.status_code == 404


# #Delete tests
# def test_delete_subscription(client):
#     response = client.delete("/api/subscriptions/1")
#     assert response.status_code == 200
 
# def test_delete_subscription_not_found(client):
#     response = client.delete("/api/subscriptions/999")
#     assert response.status_code == 404