const API_BASE_URL = 'http://localhost:5001/api';

// Helper to get authorization headers
const getAuthHeaders = (token) => {
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

// Handle response errors
const handleResponse = async (response) => {
  if (!response.ok) {
    let errorMsg = 'An error occurred';
    try {
      const errData = await response.json();
      errorMsg = errData.error || errData.message || errorMsg;
    } catch (e) {
      errorMsg = response.statusText || errorMsg;
    }
    throw new Error(errorMsg);
  }
  
  if (response.status === 204) return null;
  return response.json();
};

export const apiService = {
  // Auth API
  auth: {
    signupPatient: (data) => 
      fetch(`${API_BASE_URL}/auth/signup/patient`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then(handleResponse),
      
    signupDoctor: (data) => 
      fetch(`${API_BASE_URL}/auth/signup/doctor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then(handleResponse),
      
    signupRetailer: (data) => 
      fetch(`${API_BASE_URL}/auth/signup/retailer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then(handleResponse),
      
    login: (email, password) => 
      fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      }).then(handleResponse),
      
    logout: (token) => 
      fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...getAuthHeaders(token) 
        }
      }).then(handleResponse),
      
    me: (token) => 
      fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers: getAuthHeaders(token)
      }).then(handleResponse),
  },

  // Patients API
  patients: {
    getProfile: (token) => 
      fetch(`${API_BASE_URL}/patients/me`, {
        method: 'GET',
        headers: getAuthHeaders(token)
      }).then(handleResponse),
      
    updateProfile: (token, data) => 
      fetch(`${API_BASE_URL}/patients/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(token)
        },
        body: JSON.stringify(data)
      }).then(handleResponse),
      
    getAddresses: (token) => 
      fetch(`${API_BASE_URL}/patients/me/addresses`, {
        method: 'GET',
        headers: getAuthHeaders(token)
      }).then(handleResponse),
      
    addAddress: (token, address) => 
      fetch(`${API_BASE_URL}/patients/me/addresses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(token)
        },
        body: JSON.stringify(address)
      }).then(handleResponse),
      
    deleteAddress: (token, id) => 
      fetch(`${API_BASE_URL}/patients/me/addresses/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(token)
      }).then(handleResponse),
  },

  // Doctors API
  doctors: {
    getDoctors: (filters = {}) => {
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key]) params.append(key, filters[key]);
      });
      const queryStr = params.toString() ? `?${params.toString()}` : '';
      return fetch(`${API_BASE_URL}/doctors${queryStr}`).then(handleResponse);
    },
    
    getDoctorById: (id) => 
      fetch(`${API_BASE_URL}/doctors/${id}`).then(handleResponse),
      
    createProfile: (token, formData) => 
      fetch(`${API_BASE_URL}/doctors/profile`, {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: formData // Multipart Form Data
      }).then(handleResponse),
      
    updateProfile: (token, data) => 
      fetch(`${API_BASE_URL}/doctors/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(token)
        },
        body: JSON.stringify(data)
      }).then(handleResponse),
  },

  // Retailers API
  retailers: {
    getRetailers: () => 
      fetch(`${API_BASE_URL}/retailers`).then(handleResponse),
      
    getRetailerById: (id) => 
      fetch(`${API_BASE_URL}/retailers/${id}`).then(handleResponse),
      
    createProfile: (token, formData) => 
      fetch(`${API_BASE_URL}/retailers/profile`, {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: formData // Multipart Form Data
      }).then(handleResponse),
      
    updateProfile: (token, data) => 
      fetch(`${API_BASE_URL}/retailers/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(token)
        },
        body: JSON.stringify(data)
      }).then(handleResponse),
  },

  // Prescriptions API
  prescriptions: {
    upload: (token, formData) => 
      fetch(`${API_BASE_URL}/prescriptions/upload`, {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: formData // Multipart Form Data (file, notes, diagnosis)
      }).then(handleResponse),
      
    list: (token) => 
      fetch(`${API_BASE_URL}/prescriptions`, {
        method: 'GET',
        headers: getAuthHeaders(token)
      }).then(handleResponse),
      
    delete: (token, id) => 
      fetch(`${API_BASE_URL}/prescriptions/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(token)
      }).then(handleResponse),
  },

  // Cart API
  cart: {
    getCart: (token) => 
      fetch(`${API_BASE_URL}/cart`, {
        method: 'GET',
        headers: getAuthHeaders(token)
      }).then(handleResponse),
      
    addItem: (token, product) => 
      fetch(`${API_BASE_URL}/cart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(token)
        },
        body: JSON.stringify(product) // product_name, quantity, price, retailer_id
      }).then(handleResponse),
      
    removeItem: (token, itemId) => 
      fetch(`${API_BASE_URL}/cart/items/${itemId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(token)
      }).then(handleResponse),
  },

  // Orders API
  orders: {
    checkout: (token, addressId, prescriptionId = null) => 
      fetch(`${API_BASE_URL}/orders/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(token)
        },
        body: JSON.stringify({ address_id: addressId, prescription_id: prescriptionId })
      }).then(handleResponse),
      
    list: (token) => 
      fetch(`${API_BASE_URL}/orders`, {
        method: 'GET',
        headers: getAuthHeaders(token)
      }).then(handleResponse),
      
    getById: (token, id) => 
      fetch(`${API_BASE_URL}/orders/${id}`, {
        method: 'GET',
        headers: getAuthHeaders(token)
      }).then(handleResponse),
  }
};
