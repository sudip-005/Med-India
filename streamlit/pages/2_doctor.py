import streamlit as st
import requests
import os

BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:5000")

st.title("🩺 Doctor Dashboard")

if "jwt" not in st.session_state or not st.session_state.jwt:
    st.warning("Please log in on the main page first.")
    st.stop()

if st.session_state.role != "DOCTOR":
    st.error("This page is restricted to Doctor accounts.")
    st.stop()

headers = {"Authorization": f"Bearer {st.session_state.jwt}"}

# Fetch current profile
doctor = {}
with st.spinner("Fetching profile..."):
    # Since doctors can be loaded from doctors list or /api/auth/me, we can call /api/auth/me to get the doctor profile
    resp = requests.get(f"{BACKEND_URL}/api/auth/me", headers=headers)
    if resp.status_code == 200:
        data = resp.json()
        doctor = data.get("profile", {})
        st.session_state.profile = doctor
    else:
        st.error("Failed to load doctor profile")

# Display status banner
status = doctor.get("verification_status", "pending")
if status == "pending":
    st.warning("📄 Your profile verification is **PENDING** review.")
elif status == "approved":
    st.success("✅ Your profile is **APPROVED** and active.")
else:
    st.error(f"❌ Your profile status is: **{status.upper()}**.")

col1, col2 = st.columns([2, 1])

with col1:
    st.subheader("Configure Profile Settings")
    with st.form("doctor_profile_form"):
        first_name = st.text_input("First Name *", value=doctor.get("first_name", ""))
        last_name = st.text_input("Last Name *", value=doctor.get("last_name", ""))
        gender = st.selectbox("Gender", ["male", "female", "other"], index=["male", "female", "other"].index(doctor.get("gender", "male")) if doctor.get("gender") in ["male", "female", "other"] else 0)
        dob = st.text_input("Date of Birth (YYYY-MM-DD)", value=doctor.get("date_of_birth", ""))
        specialization = st.text_input("Specialization *", value=doctor.get("specialization", ""))
        qualification = st.text_input("Qualification", value=doctor.get("qualification", ""))
        registration_number = st.text_input("Registration ID *", value=doctor.get("registration_number", ""))
        experience = st.number_input("Experience (Years)", min_value=0, value=doctor.get("experience_years", 0))
        phone = st.text_input("Phone Number", value=doctor.get("phone", ""))
        
        st.subheader("Clinic Information")
        clinic_name = st.text_input("Clinic Name", value=doctor.get("clinic_name", ""))
        clinic_address = st.text_area("Clinic Address", value=doctor.get("clinic_address", ""))
        city = st.text_input("City", value=doctor.get("city", ""))
        state = st.text_input("State", value=doctor.get("state", ""))
        country = st.text_input("Country", value=doctor.get("country", ""))

        st.subheader("Consultation Details")
        fee = st.number_input("Consultation Fee (INR)", min_value=0, value=int(float(doctor.get("consultation_fee") or 0)))
        
        # Available Days Multiselect
        available_days = st.multiselect(
            "Available Days", 
            ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
            default=doctor.get("available_days", [])
        )
        time_start = st.text_input("Start Time (HH:MM)", value=doctor.get("available_time_start", "09:00"))
        time_end = st.text_input("End Time (HH:MM)", value=doctor.get("available_time_end", "17:00"))
        bio = st.text_area("Short Biography", value=doctor.get("bio", ""))

        sub_doc = st.form_submit_button("Update Doctor Profile")
        if sub_doc:
            payload = {
                "first_name": first_name,
                "last_name": last_name,
                "gender": gender,
                "date_of_birth": dob if dob else None,
                "specialization": specialization,
                "qualification": qualification,
                "registration_number": registration_number,
                "experience_years": int(experience),
                "phone": phone,
                "clinic_name": clinic_name,
                "clinic_address": clinic_address,
                "city": city,
                "state": state,
                "country": country,
                "consultation_fee": float(fee),
                "available_days": available_days,
                "available_time_start": time_start,
                "available_time_end": time_end,
                "bio": bio
            }
            
            update_resp = requests.put(f"{BACKEND_URL}/api/doctors/profile", json=payload, headers=headers)
            if update_resp.status_code == 200:
                st.success("Doctor profile settings saved successfully!")
                st.rerun()
            else:
                st.error(update_resp.json().get("error", "Failed to update profile"))

with col2:
    st.subheader("Upload Verification Documents")
    
    with st.form("doc_files_form"):
        reg_file = st.file_uploader("Medical Registration Certificate (PDF/Image)", type=["pdf", "png", "jpg", "jpeg"])
        deg_file = st.file_uploader("Degree Certificate (PDF/Image)", type=["pdf", "png", "jpg", "jpeg"])
        profile_img = st.file_uploader("Profile Image (PNG/JPG)", type=["png", "jpg", "jpeg"])

        sub_files = st.form_submit_button("Upload Selected Files")
        if sub_files:
            files = {}
            if reg_file:
                files["registration_certificate"] = (reg_file.name, reg_file.getvalue(), reg_file.type)
            if deg_file:
                files["degree_certificate"] = (deg_file.name, deg_file.getvalue(), deg_file.type)
            if profile_img:
                files["profile_image"] = (profile_img.name, profile_img.getvalue(), profile_img.type)

            if not files:
                st.info("No files selected for upload")
            else:
                with st.spinner("Uploading certificates to Supabase..."):
                    resp_upload = requests.post(f"{BACKEND_URL}/api/doctors/profile", files=files, headers=headers)
                    if resp_upload.status_code == 200:
                        st.success("Documents uploaded and linked!")
                        st.rerun()
                    else:
                        st.error(resp_upload.json().get("error", "Document upload failed"))

    st.subheader("Current Documents Status")
    if doctor.get("profile_image_url"):
        st.write("📷 **Profile Photo:** Uploaded")
        st.image(doctor.get("profile_image_url"), width=150)
    else:
        st.write("📷 **Profile Photo:** Not Uploaded")

    # Load details via separate fetch so we get signed urls
    doc_detail_resp = requests.get(f"{BACKEND_URL}/api/doctors/{doctor.get('doctor_id')}")
    if doc_detail_resp.status_code == 200:
        details = doc_detail_resp.json()
        if details.get("registration_certificate_signed_url"):
            st.markdown(f"📥 [Download Registration Certificate]({details.get('registration_certificate_signed_url')})")
        else:
            st.write("❌ Registration Certificate missing")

        if details.get("degree_certificate_signed_url"):
            st.markdown(f"📥 [Download Degree Certificate]({details.get('degree_certificate_signed_url')})")
        else:
            st.write("❌ Degree Certificate missing")
