import streamlit as st
import requests
import os

BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:5000")

st.title("👤 Patient Dashboard")

# Check auth status
if "jwt" not in st.session_state or not st.session_state.jwt:
    st.warning("Please log in on the main page first.")
    st.stop()

if st.session_state.role != "PATIENT":
    st.error("This page is restricted to Patient accounts.")
    st.stop()

headers = {"Authorization": f"Bearer {st.session_state.jwt}"}

# Create sub-sections using tabs
tab1, tab2, tab3, tab4 = st.tabs([
    "📂 Profile Management", 
    "📍 Address Book", 
    "📄 Prescriptions",
    "📦 Order History"
])

with tab1:
    st.subheader("Manage Profile Details")
    
    # Fetch latest profile
    profile = {}
    with st.spinner("Fetching profile..."):
        resp = requests.get(f"{BACKEND_URL}/api/patients/me", headers=headers)
        if resp.status_code == 200:
            profile = resp.json()
            st.session_state.profile = profile
        else:
            st.error("Failed to load profile details from API")

    # Display update form
    with st.form("patient_profile_form"):
        first_name = st.text_input("First Name", value=profile.get("first_name", ""))
        last_name = st.text_input("Last Name", value=profile.get("last_name", ""))
        gender = st.selectbox("Gender", ["male", "female", "other"], index=["male", "female", "other"].index(profile.get("gender", "male")) if profile.get("gender") in ["male", "female", "other"] else 0)
        blood_group = st.text_input("Blood Group", value=profile.get("blood_group", ""))
        dob = st.text_input("Date of Birth (YYYY-MM-DD)", value=profile.get("date_of_birth", ""))
        phone = st.text_input("Phone Number", value=profile.get("phone", ""))
        
        st.subheader("Emergency Contact")
        em_name = st.text_input("Emergency Contact Name", value=profile.get("emergency_contact_name", ""))
        em_phone = st.text_input("Emergency Contact Phone", value=profile.get("emergency_contact_phone", ""))

        st.subheader("Medical Information")
        allergies_str = st.text_input("Allergies (comma-separated list)", value=", ".join(profile.get("allergies", []) or []))
        medical_history = st.text_area("Medical History Notes", value=profile.get("medical_history", ""))

        st.subheader("Insurance Details")
        ins_provider = st.text_input("Insurance Provider", value=profile.get("insurance_provider", ""))
        ins_policy = st.text_input("Insurance Policy Number", value=profile.get("insurance_policy_number", ""))

        submitted = st.form_submit_button("Update Profile Details")
        if submitted:
            payload = {
                "first_name": first_name,
                "last_name": last_name,
                "gender": gender,
                "blood_group": blood_group,
                "date_of_birth": dob if dob else None,
                "phone": phone,
                "emergency_contact_name": em_name,
                "emergency_contact_phone": em_phone,
                "allergies": [x.strip() for x in allergies_str.split(",") if x.strip()],
                "medical_history": medical_history,
                "insurance_provider": ins_provider,
                "insurance_policy_number": ins_policy
            }
            
            update_resp = requests.put(f"{BACKEND_URL}/api/patients/me", json=payload, headers=headers)
            if update_resp.status_code == 200:
                st.success("Profile updated successfully!")
                st.session_state.profile = update_resp.json()["profile"]
                st.rerun()
            else:
                st.error(update_resp.json().get("error", "Failed to update profile"))

    st.subheader("⚠️ Account Danger Zone")
    if st.button("Delete My Account permanently", type="primary"):
        delete_resp = requests.delete(f"{BACKEND_URL}/api/patients/me", headers=headers)
        if delete_resp.status_code == 200:
            st.success("Account deleted successfully! Redirecting...")
            st.session_state.jwt = None
            st.session_state.user = None
            st.session_state.role = None
            st.session_state.profile = None
            st.rerun()
        else:
            st.error(delete_resp.json().get("error", "Failed to delete account"))

with tab2:
    st.subheader("Saved Addresses")
    
    # Fetch list
    addr_resp = requests.get(f"{BACKEND_URL}/api/patients/me/addresses", headers=headers)
    addresses = addr_resp.json() if addr_resp.status_code == 200 else []

    if addresses:
        for addr in addresses:
            with st.container(border=True):
                col1, col2 = st.columns([4, 1])
                with col1:
                    default_badge = " [DEFAULT]" if addr.get("is_default") else ""
                    st.markdown(f"**{addr.get('address_type')}{default_badge}**")
                    st.write(f"{addr.get('address_line_1')}, {addr.get('address_line_2') or ''}")
                    st.write(f"{addr.get('city')}, {addr.get('state')} - {addr.get('pincode')}")
                    st.write(f"Country: {addr.get('country')}")
                with col2:
                    if st.button("Delete", key=f"del_addr_{addr.get('address_id')}"):
                        del_resp = requests.delete(f"{BACKEND_URL}/api/patients/me/addresses/{addr.get('address_id')}", headers=headers)
                        if del_resp.status_code == 200:
                            st.success("Address deleted")
                            st.rerun()
                        else:
                            st.error("Delete failed")
    else:
        st.info("No saved addresses found.")

    st.subheader("➕ Add New Address")
    with st.form("add_address_form"):
        addr1 = st.text_input("Address Line 1 *")
        addr2 = st.text_input("Address Line 2")
        city = st.text_input("City *")
        state = st.text_input("State *")
        country = st.text_input("Country *", value="India")
        pincode = st.text_input("Pincode *")
        addr_type = st.selectbox("Address Type", ["Home", "Office", "Other"])
        is_default = st.checkbox("Set as default delivery address")

        sub_addr = st.form_submit_button("Save Address")
        if sub_addr:
            if not addr1 or not city or not state or not pincode:
                st.error("Please fill in required fields")
            else:
                payload = {
                    "address_line_1": addr1,
                    "address_line_2": addr2,
                    "city": city,
                    "state": state,
                    "country": country,
                    "pincode": pincode,
                    "address_type": addr_type,
                    "is_default": is_default
                }
                save_resp = requests.post(f"{BACKEND_URL}/api/patients/me/addresses", json=payload, headers=headers)
                if save_resp.status_code == 201:
                    st.success("Address added!")
                    st.rerun()
                else:
                    st.error(save_resp.json().get("error", "Failed to save address"))

with tab3:
    st.subheader("Upload Prescription Document")
    uploaded_file = st.file_uploader("Select Prescription PDF or Image file", type=["pdf", "png", "jpeg", "jpg"])
    
    with st.form("prescription_meta_form"):
        diagnosis = st.text_input("Diagnosis / Category (e.g. Cough, Diabetes)")
        doctor_name = st.text_input("Doctor Name")
        notes = st.text_area("Doctor Instructions / Notes")
        
        sub_pres = st.form_submit_button("Upload Prescription")
        if sub_pres:
            if not uploaded_file:
                st.error("Please select a file to upload first.")
            else:
                with st.spinner("Uploading file..."):
                    files = {
                        "file": (uploaded_file.name, uploaded_file.getvalue(), uploaded_file.type)
                    }
                    data = {
                        "diagnosis": diagnosis,
                        "doctor_name": doctor_name,
                        "notes": notes
                    }
                    upload_resp = requests.post(f"{BACKEND_URL}/api/prescriptions/upload", files=files, data=data, headers=headers)
                    if upload_resp.status_code == 201:
                        st.success("Prescription uploaded successfully!")
                        st.rerun()
                    else:
                        st.error(upload_resp.json().get("error", "Upload failed"))

    st.subheader("Your Uploaded Prescriptions")
    list_resp = requests.get(f"{BACKEND_URL}/api/prescriptions", headers=headers)
    prescriptions = list_resp.json() if list_resp.status_code == 200 else []

    if prescriptions:
        for pres in prescriptions:
            with st.container(border=True):
                col1, col2 = st.columns([4, 1])
                with col1:
                    st.markdown(f"**Diagnosis:** {pres.get('diagnosis') or 'Not Specified'}")
                    st.write(f"Doctor: {pres.get('doctor_name') or 'N/A'}")
                    st.write(f"Notes: {pres.get('notes') or 'N/A'}")
                    st.write(f"Uploaded: {pres.get('created_at')}")
                    
                    if pres.get("signed_url"):
                        st.markdown(f"[📥 Download / View Document]({pres.get('signed_url')})")
                with col2:
                    if st.button("Delete", key=f"del_pres_{pres.get('prescription_id')}"):
                        del_pres_resp = requests.delete(f"{BACKEND_URL}/api/prescriptions/{pres.get('prescription_id')}", headers=headers)
                        if del_pres_resp.status_code == 200:
                            st.success("Deleted")
                            st.rerun()
                        else:
                            st.error("Delete failed")
    else:
        st.info("No prescriptions found.")

with tab4:
    st.subheader("Your Purchase Orders")
    
    orders_resp = requests.get(f"{BACKEND_URL}/api/orders", headers=headers)
    orders = orders_resp.json() if orders_resp.status_code == 200 else []

    if orders:
        for ord in orders:
            with st.container(border=True):
                st.markdown(f"### Order ID: `{ord.get('order_id')}`")
                st.write(f"**Status:** :blue[{ord.get('status').upper()}]")
                st.write(f"**Placed At:** {ord.get('created_at')}")
                st.write(f"**Total Amount:** ₹{ord.get('total_amount')}")
                
                # Render items
                st.write("**Ordered Items:**")
                for item in ord.get("items", []):
                    st.write(f"- {item.get('product_name')} (Qty: {item.get('quantity')}) - ₹{item.get('price')} each")
    else:
        st.info("You haven't placed any orders yet.")
