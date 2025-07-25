from jira import JIRA
import os
from dotenv import load_dotenv

load_dotenv()

JIRA_SERVER = os.getenv("JIRA_SERVER")
JIRA_EMAIL = os.getenv("JIRA_EMAIL")
JIRA_API_TOKEN = os.getenv("JIRA_API_TOKEN")
JIRA_PROJECT_KEY = os.getenv("JIRA_PROJECT_KEY")

jira_options = {"server": JIRA_SERVER}

# Add a check for missing values to avoid silent failures
assert JIRA_SERVER and JIRA_EMAIL and JIRA_API_TOKEN and JIRA_PROJECT_KEY, "JIRA env vars not set correctly."

jira_client = JIRA(
    options=jira_options,
    basic_auth=(JIRA_EMAIL, JIRA_API_TOKEN)
)

def create_jira_issue(summary: str, description: str, issue_type: str = "Task"):
    issue_dict = {
        "project": {"key": JIRA_PROJECT_KEY},
        "summary": summary,
        "description": description,
        "issuetype": {"name": issue_type},
    }
    issue = jira_client.create_issue(fields=issue_dict)
    return issue.key

# import os
# from dotenv import load_dotenv

# load_dotenv()

# USE_MOCK = os.getenv("MOCK_JIRA", "false").lower() == "true"

# JIRA_SERVER = os.getenv("JIRA_SERVER")
# JIRA_EMAIL = os.getenv("JIRA_EMAIL")
# JIRA_API_TOKEN = os.getenv("JIRA_API_TOKEN")
# JIRA_PROJECT_KEY = os.getenv("JIRA_PROJECT_KEY")


# class MockJIRAClient:
#     def create_issue(self, fields):
#         print("MockJIRAClient used. Returning fake issue.")
#         return type("FakeIssue", (), {"key": "MOCK-123"})


# def get_jira_client():
#     if USE_MOCK:
#         print("🔧 MOCK_JIRA is enabled. Using MockJIRAClient.")
#         return MockJIRAClient()

#     try:
#         from jira import JIRA

#         assert JIRA_SERVER and JIRA_EMAIL and JIRA_API_TOKEN and JIRA_PROJECT_KEY, \
#             "JIRA env vars not set correctly."

#         jira_options = {"server": JIRA_SERVER}
#         return JIRA(options=jira_options, basic_auth=(JIRA_EMAIL, JIRA_API_TOKEN))
#     except Exception as e:
#         print(f"Error initializing real Jira client: {e}")
#         print("Falling back to MockJIRAClient.")
#         return MockJIRAClient()


# jira_client = get_jira_client()


# def create_jira_issue(summary: str, description: str, issue_type: str = "Task"):
#     issue_dict = {
#         "project": {"key": JIRA_PROJECT_KEY},
#         "summary": summary,
#         "description": description,
#         "issuetype": {"name": issue_type},
#     }
#     issue = jira_client.create_issue(fields=issue_dict)
#     print(f"Issue created: {issue.key}")
#     return issue.key
