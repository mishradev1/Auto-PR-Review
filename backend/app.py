from flask import Flask, request, jsonify
import requests
from github import Github
import openai
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)

# Get OpenAI API key from environment variables
openai.api_key = os.getenv("OPENAI_API_KEY")

# Store GitHub OAuth Token globally (better to store securely in production)
stored_token = ""

# Route to store GitHub OAuth token
@app.route("/store-token", methods=["POST"])
def store_token():
    global stored_token
    token_data = request.json
    stored_token = token_data.get('token')
    return jsonify({"message": "Token stored successfully!"})

# Route to create a webhook on GitHub
@app.route("/create-webhook", methods=["POST"])
def create_webhook():
    if not stored_token:
        return jsonify({"error": "GitHub token not found!"}), 400

    github = Github(stored_token)
    repo = github.get_user().get_repo('your-repo-name')  # Replace with actual repo name

    webhook_config = {
        "url": "http://your-server-url/webhook",  # Replace with public URL (use ngrok for local dev)
        "content_type": "json"
    }

    repo.create_hook(
        name="web", 
        config=webhook_config, 
        events=["pull_request"], 
        active=True
    )

    return jsonify({"message": "Webhook created successfully!"})

# Webhook endpoint to handle PR events
@app.route("/webhook", methods=["POST"])
def webhook():
    payload = request.json

    if payload.get('action') == "opened":
        pr = payload.get('pull_request')
        pr_body = pr.get('body', '')
        pr_url = pr.get('url')

        # Use OpenAI to generate PR review
        review = generate_pr_review(pr_body)

        # Post review comment on the PR
        post_pr_comment(pr_url, review)

    return jsonify({"message": "PR reviewed!"})

# Function to generate PR review using OpenAI
def generate_pr_review(pr_body):
    prompt = f"Review this pull request:\n\n{pr_body}\n\nProvide suggestions for improvements."
    response = openai.Completion.create(
        engine="text-davinci-003",
        prompt=prompt,
        max_tokens=200
    )
    return response.choices[0].text.strip()

# Function to post PR comment on GitHub
def post_pr_comment(pr_url, review_comment):
    if not stored_token:
        return "GitHub token not found"

    headers = {
        "Authorization": f"token {stored_token}",
        "Accept": "application/vnd.github+json"
    }
    comment_url = f"{pr_url}/comments"
    data = {"body": review_comment}

    response = requests.post(comment_url, json=data, headers=headers)
    if response.status_code == 201:
        print("Comment posted successfully!")
    else:
        print(f"Failed to post comment: {response.status_code}")

if __name__ == "__main__":
    app.run(debug=True)
