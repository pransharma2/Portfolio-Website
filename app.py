# app.py
from flask import Flask, render_template, request, redirect, url_for
from supabase.db import save_message

app = Flask(__name__)

@app.route("/")
def home():
    return render_template("home.html")

@app.route("/contact", methods=["GET", "POST"])
def contact():
    if request.method == "POST":
        save_message(
            request.form["name"],
            request.form["email"],
            request.form["message"]
        )
        return redirect(url_for("home"))
    return render_template("contact.html")

if __name__ == "__main__":
    app.run(debug=True)
