"""Regression coverage for AI chat validation, grounded streaming, and persistence."""
import json
import os
import uuid

import pytest
import requests


BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")


@pytest.fixture
def api_client():
    return requests.Session()


def test_ai_rejects_empty_message(api_client):
    response = api_client.post(
        f"{BASE_URL}/api/ai/chat",
        json={"message": "   ", "session_id": f"TEST_{uuid.uuid4()}"},
        timeout=15,
    )
    assert response.status_code == 400
    assert "boş" in response.json()["detail"].lower()


def test_ai_rejects_message_over_2000_characters(api_client):
    response = api_client.post(
        f"{BASE_URL}/api/ai/chat",
        json={"message": "x" * 2001, "session_id": f"TEST_{uuid.uuid4()}"},
        timeout=15,
    )
    assert response.status_code == 400
    assert "2000" in response.json()["detail"]


def test_ai_streams_grounded_cheesecake_answer_without_key(api_client):
    session_id = f"TEST_{uuid.uuid4()}"
    response = api_client.post(
        f"{BASE_URL}/api/ai/chat",
        json={
            "message": "Cheesecake kaç TL?",
            "mode": "customer",
            "session_id": session_id,
        },
        headers={"Accept": "text/event-stream"},
        stream=True,
        timeout=90,
    )
    assert response.status_code == 200
    assert response.headers["content-type"].startswith("text/event-stream")
    chunks = []
    saw_done = False
    for line in response.iter_lines(decode_unicode=True):
        if not line or not line.startswith("data: "):
            continue
        payload = line[6:]
        if payload == "[DONE]":
            saw_done = True
            continue
        data = json.loads(payload)
        assert "error" not in data
        chunks.append(data["content"])
    answer = "".join(chunks)
    assert saw_done
    assert "2000" in answer
    assert "sk-emergent" not in answer
    assert "EMERGENT_LLM_KEY" not in answer

    from pymongo import MongoClient

    mongo = MongoClient(os.environ["MONGO_URL"])
    try:
        messages = list(
            mongo[os.environ["DB_NAME"]].ai_messages.find(
                {"session_id": session_id}, {"_id": 0}
            )
        )
        assert {message["role"] for message in messages} == {"user", "assistant"}
        assert any(message["content"] == "Cheesecake kaç TL?" for message in messages)
        assert any(message["content"] == answer for message in messages)
    finally:
        mongo[os.environ["DB_NAME"]].ai_messages.delete_many({"session_id": session_id})
        mongo.close()