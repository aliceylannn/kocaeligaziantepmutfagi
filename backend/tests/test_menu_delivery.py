"""Regression coverage for public menu and neighborhood delivery APIs."""
import os

import pytest
import requests


BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")


@pytest.fixture
def api_client():
    return requests.Session()


def test_menu_contains_36_items_and_key_prices(api_client):
    response = api_client.get(f"{BASE_URL}/api/menu", timeout=15)
    assert response.status_code == 200
    items = response.json()
    assert len(items) == 36
    prices = {(item["name"], item["price"]) for item in items}
    assert ("Milföylü Tepsi Böreği", 800) in prices
    assert ("Cheesecake", 2000) in prices
    assert ("İçli Köfte", 75) in prices
    assert ("İçli Köfte", 85) in prices
    assert ("Şekerpare", 600) in prices


@pytest.mark.parametrize("neighborhood", ["Kadıköy", "kadıköy"])
def test_delivery_available_case_insensitive(api_client, neighborhood):
    response = api_client.post(
        f"{BASE_URL}/api/delivery-check",
        json={"neighborhood": neighborhood},
        timeout=15,
    )
    assert response.status_code == 200
    data = response.json()
    assert data["available"] is True
    assert "teslimat" in data["message"].lower()


def test_delivery_unknown_neighborhood_is_informative(api_client):
    response = api_client.post(
        f"{BASE_URL}/api/delivery-check",
        json={"neighborhood": "Bilinmeyen Mahalle"},
        timeout=15,
    )
    assert response.status_code == 200
    data = response.json()
    assert data["available"] is False
    assert "henüz" in data["message"].lower()


def test_delivery_rejects_blank_neighborhood(api_client):
    response = api_client.post(
        f"{BASE_URL}/api/delivery-check",
        json={"neighborhood": "   "},
        timeout=15,
    )
    assert response.status_code == 400