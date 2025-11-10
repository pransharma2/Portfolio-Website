from flask import Flask, render_template

app = Flask(__name__)

@app.route("/")
def home():
    return render_template("home.html", page="home")

@app.route("/about")
def about():
    return render_template("about.html", page="about")

@app.route("/projects")
def projects():
    # Example project data for templating (front-end only)
    projects = [
        {"name": "Data Pipeline Monitor", "desc": "Power BI + ADF monitoring app.", "tags": ["Power BI", "ADF", "Snowflake"]},
        {"name": "City of Ember Lesson Pack", "desc": "ELA + Social Studies activities.", "tags": ["Teaching", "Curriculum"]},
        {"name": "Tableau Energy Viz", "desc": "OPMA 421 dashboard.", "tags": ["Tableau", "Viz"]},
    ]
    return render_template("projects.html", page="projects", projects=projects)

@app.route("/contact")
def contact():
    return render_template("contact.html", page="contact")

if __name__ == "__main__":
    app.run(debug=True)
