import streamlit as st
import requests
import os

BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:5000")

st.title("🏬 Retailer Dashboard")

if "jwt" not in st.session_state or not st.session_state.jwt:
    st.warning("Please log in on the main page first.")
    st.stop()

if st.session_state.role != "RETAILER":
    st.error("This page is restricted to Retailer accounts.")
    st.stop()

headers = {"Authorization": f"Bearer {st.session_state.jwt}"}

# Fetch profile
retailer = {}
with st.spinner("Fetching profile..."):
    resp = requests.get(f"{BACKEND_URL}/api/auth/me", headers=headers)
    if resp.status_code == 200:
        data = resp.json()
        retailer = data.get("profile", {})
        st.session_state.profile = retailer
    else:
        st.error("Failed to load retailer profile")

# Display status banner
status = retailer.get("account_status", "pending")
if status == "pending":
    st.warning("📄 Your merchant account verification is **PENDING** review.")
elif status == "approved":
    st.success("✅ Your merchant account is **APPROVED** and active.")
else:
    st.error(f"❌ Your merchant account status is: **{status.upper()}**.")

st.metric(label="📈 Total Orders Processed", value=retailer.get("total_orders", 0))

col1, col2 = st.columns([2, 1])

with col1:
    st.subheader("Configure Shop Profile Settings")
    with st.form("retailer_profile_form"):
        shop_name = st.text_input("Shop Name *", value=retailer.get("shop_name", ""))
        owner_name = st.text_input("Owner Name *", value=retailer.get("owner_name", ""))
        phone = st.text_input("Phone Number *", value=retailer.get("phone", ""))
        email = st.text_input("Contact Email", value=retailer.get("email", ""))
        business_id = st.text_input("Business Registration ID *", value=retailer.get("business_id", ""))
        medical_license_id = st.text_input("Medical License ID *", value=retailer.get("medical_license_id", ""))
        shop_address = st.text_area("Shop Address *", value=retailer.get("shop_address", ""))
        city = st.text_input("City", value=retailer.get("city", ""))
        state = st.text_input("State", value=retailer.get("state", ""))
        pincode = st.text_input("Pincode", value=retailer.get("pincode", ""))

        sub_ret = st.form_submit_button("Update Merchant Profile")
        if sub_ret:
            payload = {
                "shop_name": shop_name,
                "owner_name": owner_name,
                "phone": phone,
                "email": email,
                "business_id": business_id,
                "medical_license_id": medical_license_id,
                "shop_address": shop_address,
                "city": city,
                "state": state,
                "pincode": pincode
            }
            
            update_resp = requests.put(f"{BACKEND_URL}/api/retailers/profile", json=payload, headers=headers)
            if update_resp.status_code == 200:
                st.success("Retailer profile settings saved successfully!")
                st.rerun()
            else:
                st.error(update_resp.json().get("error", "Failed to update profile"))

with col2:
    st.subheader("Upload Verification & Stock Files")
    with st.form("retailer_files_form"):
        bus_file = st.file_uploader("Business License (PDF/Image)", type=["pdf", "png", "jpg", "jpeg"])
        med_file = st.file_uploader("Medical License (PDF/Image)", type=["pdf", "png", "jpg", "jpeg"])
        gst_file = st.file_uploader("GST Registration Certificate (PDF/Image)", type=["pdf", "png", "jpg", "jpeg"])
        stock_file = st.file_uploader("Stock / Inventory CSV File (CSV)", type=["csv"])
        shop_img = st.file_uploader("Shop Front Image (PNG/JPG)", type=["png", "jpg", "jpeg"])

        sub_files = st.form_submit_button("Upload Selected Documents")
        if sub_files:
            files = {}
            if bus_file:
                files["business_license"] = (bus_file.name, bus_file.getvalue(), bus_file.type)
            if med_file:
                files["medical_license"] = (med_file.name, med_file.getvalue(), med_file.type)
            if gst_file:
                files["gst_certificate"] = (gst_file.name, gst_file.getvalue(), gst_file.type)
            if stock_file:
                files["stock_file"] = (stock_file.name, stock_file.getvalue(), stock_file.type)
            if shop_img:
                files["shop_image"] = (shop_img.name, shop_img.getvalue(), shop_img.type)

            if not files:
                st.info("No files selected for upload")
            else:
                with st.spinner("Uploading merchants credentials..."):
                    resp_upload = requests.post(f"{BACKEND_URL}/api/retailers/profile", files=files, headers=headers)
                    if resp_upload.status_code == 200:
                        st.success("Documents uploaded and database paths configured!")
                        st.rerun()
                    else:
                        st.error(resp_upload.json().get("error", "Upload failed"))

    st.subheader("Current Documents Status")
    if retailer.get("shop_image_url"):
        st.write("📷 **Shop Front Photo:** Uploaded")
        st.image(retailer.get("shop_image_url"), width=150)
    else:
        st.write("📷 **Shop Front Photo:** Not Uploaded")

    # Fetch with signed urls
    ret_detail_resp = requests.get(f"{BACKEND_URL}/api/retailers/{retailer.get('retailer_id')}")
    if ret_detail_resp.status_code == 200:
        details = ret_detail_resp.json()
        if details.get("business_license_signed_url"):
            st.markdown(f"📄 [Download Business License]({details.get('business_license_signed_url')})")
        if details.get("medical_license_signed_url"):
            st.markdown(f"📄 [Download Medical License]({details.get('medical_license_signed_url')})")
        if details.get("gst_certificate_signed_url"):
            st.markdown(f"📄 [Download GST Certificate]({details.get('gst_certificate_signed_url')})")
        if details.get("stock_file_signed_url"):
            st.markdown(f"📥 [Download Inventory Stock File]({details.get('stock_file_signed_url')})")
