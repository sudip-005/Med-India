import streamlit as st
import requests
import os

BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:5000")

st.title("🛒 Shopping Cart & Orders Dashboard")

if "jwt" not in st.session_state or not st.session_state.jwt:
    st.warning("Please log in on the main page first.")
    st.stop()

headers = {"Authorization": f"Bearer {st.session_state.jwt}"}
role = st.session_state.role

# If user is a PATIENT, show cart + checkout
if role == "PATIENT":
    tab1, tab2 = st.tabs(["🛒 Your Shopping Cart", "📦 Order History"])

    with tab1:
        st.subheader("Your Shopping Cart Items")
        
        # Load cart
        cart_resp = requests.get(f"{BACKEND_URL}/api/cart", headers=headers)
        cart_data = cart_resp.json() if cart_resp.status_code == 200 else {"items": []}
        items = cart_data.get("items", [])

        if items:
            total_sum = 0
            for item in items:
                with st.container(border=True):
                    col1, col2, col3 = st.columns([3, 1, 1])
                    with col1:
                        st.markdown(f"**Product:** {item.get('product_name')}")
                        st.write(f"Retailer ID: `{item.get('retailer_id') or 'N/A'}`")
                    with col2:
                        st.write(f"Qty: **{item.get('quantity')}**")
                        st.write(f"Price: ₹{item.get('price')}")
                        item_total = float(item.get('price')) * int(item.get('quantity'))
                        total_sum += item_total
                        st.write(f"Subtotal: **₹{item_total:.2f}**")
                    with col3:
                        if st.button("Remove", key=f"remove_item_{item.get('cart_item_id')}"):
                            del_resp = requests.delete(f"{BACKEND_URL}/api/cart/items/{item.get('cart_item_id')}", headers=headers)
                            if del_resp.status_code == 200:
                                st.success("Item removed")
                                st.rerun()
                            else:
                                st.error("Failed to remove item")
            
            st.markdown(f"### Total Cart Value: :green[₹{total_sum:.2f}]")

            st.subheader("🏁 Checkout Order")
            
            # Fetch saved addresses
            addr_resp = requests.get(f"{BACKEND_URL}/api/patients/me/addresses", headers=headers)
            addresses = addr_resp.json() if addr_resp.status_code == 200 else []

            # Fetch prescriptions
            pres_resp = requests.get(f"{BACKEND_URL}/api/prescriptions", headers=headers)
            prescriptions = pres_resp.json() if pres_resp.status_code == 200 else []

            if not addresses:
                st.warning("⚠️ You must add a delivery address first in the Patient Dashboard.")
            else:
                address_options = {f"{a.get('address_type')} - {a.get('address_line_1')}, {a.get('city')}": a.get('address_id') for a in addresses}
                selected_addr_label = st.selectbox("Select Delivery Address", list(address_options.keys()))
                selected_addr_id = address_options[selected_addr_label]

                prescription_options = {"None (Over the counter)": None}
                for p in prescriptions:
                    label = f"Prescription #{p.get('prescription_id')[:8]} - {p.get('diagnosis') or 'No Diagnosis'}"
                    prescription_options[label] = p.get('prescription_id')
                selected_pres_label = st.selectbox("Link Prescription (Optional)", list(prescription_options.keys()))
                selected_pres_id = prescription_options[selected_pres_label]

                if st.button("Place Order", type="primary", use_container_width=True):
                    checkout_payload = {
                        "address_id": selected_addr_id,
                        "prescription_id": selected_pres_id
                    }
                    checkout_resp = requests.post(f"{BACKEND_URL}/api/orders/checkout", json=checkout_payload, headers=headers)
                    if checkout_resp.status_code == 201:
                        st.success("🎉 Order placed successfully!")
                        st.rerun()
                    else:
                        st.error(checkout_resp.json().get("error", "Checkout failed"))
        else:
            st.info("Your shopping cart is empty.")

        # Test tool to add items to cart
        st.subheader("➕ Add Test Item to Cart")
        with st.form("add_test_item_form"):
            prod_name = st.text_input("Product Name (e.g. Paracetamol, Insulin)")
            prod_price = st.number_input("Unit Price (INR)", min_value=1.0, value=120.0)
            prod_qty = st.number_input("Quantity", min_value=1, value=1)
            
            # Fetch retailers to allow linking
            ret_list_resp = requests.get(f"{BACKEND_URL}/api/retailers")
            retailers = ret_list_resp.json() if ret_list_resp.status_code == 200 else []
            retailer_options = {"None": None}
            for r in retailers:
                retailer_options[f"{r.get('shop_name')} ({r.get('city')})"] = r.get('retailer_id')
            selected_ret_label = st.selectbox("Select Retailer / Merchant", list(retailer_options.keys()))
            selected_ret_id = retailer_options[selected_ret_label]

            submitted_item = st.form_submit_button("Add Item to Cart")
            if submitted_item:
                if not prod_name:
                    st.error("Please specify product name")
                else:
                    payload = {
                        "product_name": prod_name,
                        "price": prod_price,
                        "quantity": int(prod_qty),
                        "retailer_id": selected_ret_id
                    }
                    add_resp = requests.post(f"{BACKEND_URL}/api/cart", json=payload, headers=headers)
                    if add_resp.status_code == 201:
                        st.success(f"Added {prod_name} to cart!")
                        st.rerun()
                    else:
                        st.error(add_resp.json().get("error", "Failed to add item"))

    with tab2:
        st.subheader("Your Placed Orders")
        orders_resp = requests.get(f"{BACKEND_URL}/api/orders", headers=headers)
        orders = orders_resp.json() if orders_resp.status_code == 200 else []

        if orders:
            for ord in orders:
                with st.container(border=True):
                    st.markdown(f"### Order ID: `{ord.get('order_id')}`")
                    st.write(f"**Status:** :blue[{ord.get('status').upper()}]")
                    st.write(f"**Total Amount:** ₹{ord.get('total_amount')}")
                    st.write(f"**Shipping Address:** {ord.get('address', {}).get('address_line_1')}, {ord.get('address', {}).get('city')}")
                    
                    st.markdown("**Products Ordered:**")
                    for item in ord.get("items", []):
                        st.write(f"- {item.get('product_name')} (Qty: {item.get('quantity')}) - ₹{item.get('price')} each")
        else:
            st.info("No order history found.")

elif role == "RETAILER":
    st.subheader("Customer Orders Received")
    
    orders_resp = requests.get(f"{BACKEND_URL}/api/orders", headers=headers)
    orders = orders_resp.json() if orders_resp.status_code == 200 else []

    if orders:
        for ord in orders:
            with st.container(border=True):
                st.markdown(f"### Order ID: `{ord.get('order_id')}`")
                st.write(f"**Status:** :blue[{ord.get('status').upper()}]")
                st.write(f"**Total Order Amount:** ₹{ord.get('total_amount')}")
                st.write(f"**Shipping Address:** {ord.get('address', {}).get('address_line_1')}, {ord.get('address', {}).get('city')}")
                
                st.markdown("**Your Products in this Order:**")
                for item in ord.get("items", []):
                    st.write(f"- {item.get('product_name')} (Qty: {item.get('quantity')}) - ₹{item.get('price')} each")
    else:
        st.info("No customer orders found matching your retailer ID.")
else:
    st.info("Doctors do not participate in order checkouts or merchant stock fulfillment.")
