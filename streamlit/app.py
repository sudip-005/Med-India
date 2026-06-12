import streamlit as st
import requests
import os
import json

# Setup page layout
st.set_page_config(
    page_title="Med India Test Dashboard",
    page_icon="🩺",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Resolve backend URL
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:5000")

# Initialize session states
if "jwt" not in st.session_state:
    st.session_state.jwt = None
if "user" not in st.session_state:
    st.session_state.user = None
if "role" not in st.session_state:
    st.session_state.role = None
if "profile" not in st.session_state:
    st.session_state.profile = None

def get_auth_headers():
    if st.session_state.jwt:
        return {"Authorization": f"Bearer {st.session_state.jwt}"}
    return {}

# Title and Description
st.title("🩺 Med India Marketplace - API Testing Dashboard")
st.markdown("Use this interface to register users, authenticate, manage profiles, and test all marketplace endpoints.")

# Sidebar status
with st.sidebar:
    st.header("⚡ Connection Status")
    try:
        health_resp = requests.get(f"{BACKEND_URL}/health", timeout=3)
        if health_resp.status_code == 200:
            st.success(f"Backend Connected to {BACKEND_URL}")
        else:
            st.error(f"Backend error: {health_resp.status_code}")
    except Exception as e:
        st.error(f"Cannot reach backend at {BACKEND_URL}")

    st.header("👤 Auth Status")
    if st.session_state.jwt:
        st.write(f"**Logged in as:** {st.session_state.user.get('email')}")
        st.write(f"**Role:** {st.session_state.role}")
        st.write(f"**User ID:** `{st.session_state.user.get('id')}`")
        if st.button("Logout", use_container_width=True):
            try:
                requests.post(f"{BACKEND_URL}/api/auth/logout", headers=get_auth_headers())
            except:
                pass
            st.session_state.jwt = None
            st.session_state.user = None
            st.session_state.role = None
            st.session_state.profile = None
            st.rerun()
    else:
        st.info("Not authenticated. Please Login or Register.")

# Main content
if not st.session_state.jwt:
    tab1, tab2 = st.tabs(["🔐 Login", "📝 Sign Up"])

    with tab1:
        st.subheader("Login with Password")
        email = st.text_input("Email Address", key="login_email")
        password = st.text_input("Password", type="password", key="login_pwd")
        
        if st.button("Login", type="primary"):
            if email and password:
                with st.spinner("Logging in..."):
                    try:
                        resp = requests.post(f"{BACKEND_URL}/api/auth/login", json={"email": email, "password": password})
                        if resp.status_code == 200:
                            data = resp.json()
                            st.session_state.jwt = data["session"]["access_token"]
                            st.session_state.user = data["user"]
                            
                            # Get user profile to figure out role
                            me_resp = requests.get(f"{BACKEND_URL}/api/auth/me", headers={"Authorization": f"Bearer {st.session_state.jwt}"})
                            if me_resp.status_code == 200:
                                me_data = me_resp.json()
                                st.session_state.role = me_data["user"]["role"]
                                st.session_state.profile = me_data["profile"]
                                st.success("Logged in successfully!")
                                st.rerun()
                            else:
                                st.error("Failed to load profile role.")
                        else:
                            st.error(resp.json().get("error", "Invalid credentials"))
                    except Exception as e:
                        st.error(f"Login request failed: {e}")
            else:
                st.warning("Please provide email and password")

    with tab2:
        st.subheader("Register a New User Account")
        role_type = st.radio("Choose Account Role", ["PATIENT", "DOCTOR", "RETAILER"], horizontal=True)

        with st.form("signup_form"):
            email_signup = st.text_input("Email *")
            pwd_signup = st.text_input("Password (Min 6 chars) *", type="password")
            first_name = st.text_input("First Name / Shop Name *")
            last_name = st.text_input("Last Name / Owner Name (Ignored for Retailer)")
            phone = st.text_input("Phone Number *")

            # Role specific extra fields
            if role_type == "PATIENT":
                gender = st.selectbox("Gender", ["male", "female", "other"])
                dob = st.date_input("Date of Birth")
                blood_group = st.text_input("Blood Group")
            elif role_type == "DOCTOR":
                gender = st.selectbox("Gender", ["male", "female", "other"])
                dob = st.date_input("Date of Birth")
                specialization = st.text_input("Specialization *")
                registration_number = st.text_input("Medical Registration ID *")
            elif role_type == "RETAILER":
                business_id = st.text_input("Business Registration ID *")
                medical_license_id = st.text_input("Medical License ID *")
                shop_address = st.text_area("Shop Address *")

            submitted = st.form_submit_button("Register Account")
            if submitted:
                if not email_signup or not pwd_signup or not first_name or not phone:
                    st.error("Please fill in all required (*) fields")
                else:
                    payload = {
                        "email": email_signup,
                        "password": pwd_signup,
                        "phone": phone
                    }

                    if role_type == "PATIENT":
                        payload.update({
                            "first_name": first_name,
                            "last_name": last_name or "",
                            "gender": gender,
                            "date_of_birth": dob.strftime("%Y-%m-%d"),
                            "blood_group": blood_group
                        })
                        endpoint = "/api/auth/signup/patient"
                    elif role_type == "DOCTOR":
                        payload.update({
                            "first_name": first_name,
                            "last_name": last_name or "",
                            "gender": gender,
                            "date_of_birth": dob.strftime("%Y-%m-%d"),
                            "specialization": specialization,
                            "registration_number": registration_number
                        })
                        endpoint = "/api/auth/signup/doctor"
                    elif role_type == "RETAILER":
                        payload.update({
                            "shop_name": first_name,
                            "owner_name": last_name or first_name,
                            "business_id": business_id,
                            "medical_license_id": medical_license_id,
                            "shop_address": shop_address
                        })
                        endpoint = "/api/auth/signup/retailer"

                    try:
                        resp = requests.post(f"{BACKEND_URL}{endpoint}", json=payload)
                        if resp.status_code == 201:
                            st.success("Account created successfully! You can now log in directly.")
                        else:
                            st.error(resp.json().get("error", "Registration failed"))
                    except Exception as e:
                        st.error(f"Signup request failed: {e}")
else:
    st.success(f"👋 Welcome back, {st.session_state.user.get('email')}!")
    st.info("Select a page from the sidebar to test role-specific endpoints (Patient, Doctor, Retailer, Cart/Orders).")

    # API Health Check logs & tools
    st.subheader("🛠️ Raw API Tester")
    with st.expander("Show Active Session Credentials"):
        st.write("**Access Token (JWT):**")
        st.code(st.session_state.jwt)
        st.write("**User Object (from Auth):**")
        st.json(st.session_state.user)
        st.write("**Profile Object (from Database):**")
        st.json(st.session_state.profile)
